"""
Financial Health Scorer - AI Engine
Calculates personalized financial health score based on:
1. Savings Rate (target: >20%)
2. Spending Control (budget adherence)
3. Debt Risk (BNPL + PTPTN load)
4. Emergency Buffer (3-month expenses)
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class HealthScoreBreakdown:
    """Financial health score components"""
    savings_rate: int          # 0-100
    spending_control: int      # 0-100
    debt_risk: int             # 0-100
    emergency_buffer: int      # 0-100
    overall_score: int         # 0-100
    recommendation: str


class FinancialHealthScorer:
    """
    Scores user financial health across 4 dimensions.
    Uses weighted calculation to produce 0-100 score.
    """
    
    # Scoring weights
    WEIGHTS = {
        "savings_rate": 0.25,
        "spending_control": 0.25,
        "debt_risk": 0.25,
        "emergency_buffer": 0.25
    }
    
    # Thresholds and targets
    TARGETS = {
        "monthly_savings_pct": 0.20,      # 20% of income
        "debt_to_income_ratio": 0.30,     # Max 30% of income as debt
        "emergency_months": 3,             # 3 months of expenses
        "bnpl_load_pct": 0.20,            # Max 20% of income as BNPL
    }
    
    def __init__(self):
        pass
    
    def calculate_score(self,
                       monthly_income: float,
                       monthly_expenses: float,
                       savings_balance: float,
                       bnpl_commitments: float,
                       ptptn_outstanding: float,
                       ptptn_monthly_repayment: float,
                       transaction_history: List[Dict] = None) -> HealthScoreBreakdown:
        """
        Calculate comprehensive financial health score.
        
        Args:
            monthly_income: User's monthly income
            monthly_expenses: User's monthly expenses
            savings_balance: Current savings balance
            bnpl_commitments: Total active BNPL commitments
            ptptn_outstanding: Outstanding PTPTN balance
            ptptn_monthly_repayment: Monthly PTPTN repayment
            transaction_history: List of recent transactions for analysis
            
        Returns:
            HealthScoreBreakdown with detailed scores
        """
        
        # Calculate each dimension
        savings_rate_score = self._calculate_savings_rate_score(
            monthly_income, monthly_expenses
        )
        
        spending_control_score = self._calculate_spending_control_score(
            monthly_income, monthly_expenses, transaction_history
        )
        
        debt_risk_score = self._calculate_debt_risk_score(
            monthly_income, bnpl_commitments, ptptn_monthly_repayment
        )
        
        emergency_buffer_score = self._calculate_emergency_buffer_score(
            savings_balance, monthly_expenses
        )
        
        # Calculate weighted overall score
        overall_score = int(
            savings_rate_score * self.WEIGHTS["savings_rate"] +
            spending_control_score * self.WEIGHTS["spending_control"] +
            debt_risk_score * self.WEIGHTS["debt_risk"] +
            emergency_buffer_score * self.WEIGHTS["emergency_buffer"]
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            savings_rate_score, spending_control_score, debt_risk_score, emergency_buffer_score
        )
        
        return HealthScoreBreakdown(
            savings_rate=savings_rate_score,
            spending_control=spending_control_score,
            debt_risk=debt_risk_score,
            emergency_buffer=emergency_buffer_score,
            overall_score=overall_score,
            recommendation=recommendation
        )
    
    def _calculate_savings_rate_score(self, 
                                     monthly_income: float, 
                                     monthly_expenses: float) -> int:
        """
        Score based on savings rate.
        Formula: (Income - Expenses) / Income
        Target: 20%+ = 100 points
        """
        if monthly_income <= 0:
            return 50  # Neutral score if no income
        
        monthly_savings = monthly_income - monthly_expenses
        savings_rate = monthly_savings / monthly_income
        
        # Scoring: linear from 0% (0 pts) to 30% (100 pts)
        if savings_rate <= 0:
            score = 0  # No savings = bad
        elif savings_rate >= 0.30:
            score = 100  # 30%+ savings = excellent
        else:
            score = int((savings_rate / 0.30) * 100)
        
        return min(max(score, 0), 100)
    
    def _calculate_spending_control_score(self,
                                         monthly_income: float,
                                         monthly_expenses: float,
                                         transaction_history: List[Dict] = None) -> int:
        """
        Score based on spending pattern discipline.
        - Categorizes transactions
        - Detects overspending in categories
        - Identifies unusual patterns
        """
        if monthly_income <= 0:
            return 50
        
        expense_ratio = monthly_expenses / monthly_income
        
        # Scoring: 50% expense ratio = 100 pts, 100% = 0 pts
        if expense_ratio <= 0.50:
            base_score = 100
        elif expense_ratio >= 1.00:
            base_score = 0
        else:
            base_score = int((1 - expense_ratio) / 0.50 * 100)
        
        # Adjust based on transaction history anomalies
        anomaly_penalty = 0
        if transaction_history:
            anomalies = self._detect_spending_anomalies(transaction_history)
            anomaly_penalty = min(len(anomalies) * 5, 20)  # Max 20pt penalty
        
        score = base_score - anomaly_penalty
        return min(max(score, 0), 100)
    
    def _calculate_debt_risk_score(self,
                                  monthly_income: float,
                                  bnpl_commitments: float,
                                  ptptn_monthly_repayment: float) -> int:
        """
        Score based on debt burden.
        Risk factors:
        - BNPL load (should be <20% of income)
        - PTPTN repayment (should be <30% of income)
        """
        if monthly_income <= 0:
            return 50
        
        total_debt_payments = bnpl_commitments + ptptn_monthly_repayment
        debt_to_income = total_debt_payments / monthly_income
        
        # Scoring: 0% debt = 100, 50%+ debt = 0
        if debt_to_income <= 0.10:
            score = 100
        elif debt_to_income >= 0.50:
            score = 0
        else:
            score = int((1 - (debt_to_income / 0.50)) * 100)
        
        # Penalty for high BNPL specifically (trap indicator)
        bnpl_ratio = bnpl_commitments / monthly_income
        if bnpl_ratio > 0.20:
            score -= 15  # BNPL is high risk
        
        return min(max(score, 0), 100)
    
    def _calculate_emergency_buffer_score(self,
                                         savings_balance: float,
                                         monthly_expenses: float) -> int:
        """
        Score based on emergency fund adequacy.
        Target: 3 months of expenses = 100 points
        """
        if monthly_expenses <= 0:
            return 50
        
        emergency_months = savings_balance / monthly_expenses
        
        # Scoring: 0 months = 0, 3+ months = 100
        if emergency_months >= 3:
            score = 100
        elif emergency_months <= 0:
            score = 0
        else:
            score = int((emergency_months / 3) * 100)
        
        return min(max(score, 0), 100)
    
    def _detect_spending_anomalies(self, transactions: List[Dict]) -> List[str]:
        """Detect unusual spending patterns"""
        anomalies = []
        
        if not transactions:
            return anomalies
        
        # Count transactions by category
        categories = {}
        for txn in transactions:
            category = txn.get("category", "Other")
            categories[category] = categories.get(category, 0) + 1
        
        # Flag excessive spending in specific categories
        if categories.get("Food & Drink", 0) > 15:  # More than 15 food transactions
            anomalies.append("Excessive food spending")
        
        if categories.get("Online Shopping", 0) > 10:
            anomalies.append("Frequent shopping activity")
        
        if categories.get("Entertainment", 0) > 8:
            anomalies.append("High entertainment spend")
        
        return anomalies
    
    def _generate_recommendation(self,
                               savings_score: int,
                               spending_score: int,
                               debt_score: int,
                               buffer_score: int) -> str:
        """Generate personalized recommendation based on scores"""
        
        overall = (savings_score + spending_score + debt_score + buffer_score) / 4
        
        if overall >= 80:
            return "Excellent! Keep up your disciplined financial habits. Consider exploring investments."
        elif overall >= 60:
            return "Good progress! Focus on building your emergency fund to 3 months of expenses."
        elif overall >= 40:
            return "Time to take action. Start by reducing BNPL commitments and increasing savings."
        else:
            return "Critical: Your debt load is unsustainable. Consider debt consolidation and cutting subscriptions."
    
    def get_score_breakdown_text(self, breakdown: HealthScoreBreakdown) -> str:
        """Generate human-readable breakdown"""
        return f"""
Financial Health Score: {breakdown.overall_score}/100

Breakdown:
├── Savings Rate:       {breakdown.savings_rate}/100  {'✓' if breakdown.savings_rate > 60 else '⚠️' if breakdown.savings_rate > 30 else '✗'}
├── Spending Control:   {breakdown.spending_control}/100  {'✓' if breakdown.spending_control > 60 else '⚠️' if breakdown.spending_control > 30 else '✗'}
├── Debt Risk:          {breakdown.debt_risk}/100  {'✓' if breakdown.debt_risk > 60 else '⚠️' if breakdown.debt_risk > 30 else '✗'}
└── Emergency Buffer:   {breakdown.emergency_buffer}/100  {'✓' if breakdown.emergency_buffer > 60 else '⚠️' if breakdown.emergency_buffer > 30 else '✗'}

Recommendation: {breakdown.recommendation}
        """


# Example usage
if __name__ == "__main__":
    scorer = FinancialHealthScorer()
    
    # Mock user profile
    breakdown = scorer.calculate_score(
        monthly_income=3000,
        monthly_expenses=2400,
        savings_balance=1500,
        bnpl_commitments=134,
        ptptn_outstanding=25000,
        ptptn_monthly_repayment=350
    )
    
    print(scorer.get_score_breakdown_text(breakdown))
