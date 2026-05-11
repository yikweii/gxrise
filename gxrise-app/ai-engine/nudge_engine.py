"""
Smart Nudge Engine - AI Engine
Generates contextual, behavioral nudges based on:
- Spending patterns
- Category overages
- BNPL accumulation
- PTPTN disbursements
- Subscription detection
"""

import random
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum

class NudgeType(str, Enum):
    """Nudge severity levels"""
    ALERT = "alert"           # Spending concern
    OPPORTUNITY = "opportunity"  # Savings opportunity
    WARNING = "warning"       # Debt risk
    PRAISE = "praise"        # Positive reinforcement
    GENTLE = "gentle"        # Soft reminder


class NudgeEngine:
    """
    Generates contextual nudges based on behavioral economics principles:
    - Default effect (make saving the default)
    - Loss aversion (frame as losing money, not missing gains)
    - Commitment devices (lock-in savings)
    - Social proof (peer comparisons)
    - Reward salience (immediate, visible rewards)
    """
    
    # Nudge templates
    NUDGE_LIBRARY = {
        NudgeType.ALERT: [
            {
                "template": "You've spent RM{spent} on {category} this week — that's {pct}% of your budget. {action}?",
                "action_text": "Cook once and save RM{saving}",
                "trigger": "category_overage"
            },
            {
                "template": "GrabFood charges are adding up: RM{spent} in {days} days. That's {pct}% higher than last week.",
                "action_text": "Save RM{saving} by meal prepping",
                "trigger": "food_surge"
            },
            {
                "template": "Your BNPL commitments now total RM{total} — {pct}% of your monthly income. Pause new purchases?",
                "action_text": "Lock until June",
                "trigger": "bnpl_surge"
            }
        ],
        
        NudgeType.OPPORTUNITY: [
            {
                "template": "RM{amount} disbursed! Students who save 20% on disbursement day finish without emergency borrowing. Save RM{saving} now?",
                "action_text": "Lock it in",
                "trigger": "ptptn_disbursement"
            },
            {
                "template": "Salary day! {pct}% of peers auto-transfer to savings on payday. Transfer RM{saving}?",
                "action_text": "Auto-save",
                "trigger": "salary_received"
            },
            {
                "template": "You've hit a 7-day spending pause streak! One more day = +RM10 bonus. Keep going?",
                "action_text": "Continue",
                "trigger": "streak_maintenance"
            }
        ],
        
        NudgeType.WARNING: [
            {
                "template": "Alert: You have {count} BNPL commitments totalling RM{total} due this month. Without careful planning, you'll overspend.",
                "action_text": "View plan",
                "trigger": "bnpl_warning"
            },
            {
                "template": "Your subscriptions drain RM{cost}/month (Netflix, Spotify, YouTube, Disney+). {unused} unused. Cancel?",
                "action_text": "Review subscriptions",
                "trigger": "subscription_drain"
            },
            {
                "template": "PTPTN repayment due in {days} days. Your current savings won't cover RM{amount} + living expenses.",
                "action_text": "View payment plan",
                "trigger": "ptptn_due_soon"
            }
        ],
        
        NudgeType.PRAISE: [
            {
                "template": "🔥 7-Day Saver Streak! You've saved RM{total} this week — {pct}% above target.",
                "action_text": "Keep the streak",
                "trigger": "streak_reached"
            },
            {
                "template": "You hit your savings goal! ✨ Share this win with your squad on Pocket with Kawan?",
                "action_text": "Share",
                "trigger": "goal_achieved"
            }
        ],
        
        NudgeType.GENTLE: [
            {
                "template": "Just a gentle reminder: you set a budget of RM{budget} for {category} this week. You've used RM{spent} so far.",
                "action_text": "Adjust budget",
                "trigger": "budget_friendly_reminder"
            }
        ]
    }
    
    def __init__(self):
        self.nudge_id_counter = 0
    
    def generate_nudges(self,
                       user_id: str,
                       transactions: List[Dict],
                       user_profile: Dict,
                       health_score: int,
                       last_nudge_time: datetime = None) -> List[Dict]:
        """
        Generate appropriate nudges for user based on current context.
        
        Args:
            user_id: User identifier
            transactions: Recent transaction history
            user_profile: User financial profile
            health_score: Current health score
            last_nudge_time: Timestamp of last nudge (avoid fatigue)
            
        Returns:
            List of nudges to display
        """
        
        nudges = []
        now = datetime.now()
        
        # Respect notification fatigue - max 2 nudges per day
        if last_nudge_time:
            hours_since = (now - last_nudge_time).total_seconds() / 3600
            if hours_since < 4:  # Less than 4 hours ago
                return nudges
        
        # Check each trigger condition
        
        # 1. Category overage check
        category_nudges = self._check_category_overage(
            transactions, user_profile
        )
        nudges.extend(category_nudges)
        
        # 2. BNPL surge check
        bnpl_nudges = self._check_bnpl_burden(
            transactions, user_profile
        )
        nudges.extend(bnpl_nudges)
        
        # 3. Subscription drain check
        subscription_nudges = self._check_subscription_drain(
            transactions, user_profile
        )
        nudges.extend(subscription_nudges)
        
        # 4. PTPTN-related nudges
        ptptn_nudges = self._check_ptptn_status(
            user_profile
        )
        nudges.extend(ptptn_nudges)
        
        # 5. Positive reinforcement
        if health_score >= 70:
            praise_nudges = self._generate_praise(user_profile, transactions)
            nudges.extend(praise_nudges)
        
        # Limit to top 2 nudges by importance
        nudges = self._prioritize_nudges(nudges)[:2]
        
        return nudges
    
    def _check_category_overage(self, transactions: List[Dict],
                               user_profile: Dict) -> List[Dict]:
        """Check if user is overspending in any category"""
        nudges = []
        
        # Categorize recent transactions
        category_spend = {}
        for txn in transactions[-30:]:  # Last 30 days
            cat = txn.get("category", "Other")
            amount = abs(txn.get("amount", 0))
            category_spend[cat] = category_spend.get(cat, 0) + amount
        
        # Budget limits (weekly)
        budgets = {
            "Food & Drink": 100,
            "Transport": 80,
            "Entertainment": 60,
            "Shopping": 200,
        }
        
        for category, spent in category_spend.items():
            if category in budgets:
                budget = budgets[category]
                pct = int((spent / budget) * 100)
                
                if pct > 80:  # Over 80% of budget
                    nudge = {
                        "id": self._generate_nudge_id(),
                        "type": NudgeType.ALERT.value,
                        "title": f"{category} Overspend Alert",
                        "message": f"You've spent RM{spent:.2f} on {category} — {pct}% of your weekly budget.",
                        "action": "Reduce spending",
                        "action_value": int(spent - budget),
                        "category": category,
                        "created_at": datetime.now().isoformat(),
                        "priority": 8 if pct > 100 else 6
                    }
                    nudges.append(nudge)
        
        return nudges
    
    def _check_bnpl_burden(self, transactions: List[Dict],
                          user_profile: Dict) -> List[Dict]:
        """Check BNPL accumulation and debt stress"""
        nudges = []
        
        bnpl_total = user_profile.get("bnpl_commitments", 0)
        monthly_income = user_profile.get("monthly_income", 0)
        
        if monthly_income <= 0:
            return nudges
        
        bnpl_ratio = bnpl_total / monthly_income
        
        # Count BNPL transactions in last week
        bnpl_count = sum(
            1 for txn in transactions[-7:]
            if "bnpl" in txn.get("category", "").lower()
        )
        
        if bnpl_ratio > 0.25:  # More than 25% of income
            nudge = {
                "id": self._generate_nudge_id(),
                "type": NudgeType.WARNING.value,
                "title": "BNPL Debt Alert",
                "message": f"Your BNPL commitments total RM{bnpl_total:.2f} ({int(bnpl_ratio*100)}% of income). "
                          f"This is above the safe threshold. Pause new purchases.",
                "action": "View BNPL breakdown",
                "created_at": datetime.now().isoformat(),
                "priority": 9
            }
            nudges.append(nudge)
        
        if bnpl_count >= 2:  # Multiple BNPL purchases in a week
            nudge = {
                "id": self._generate_nudge_id(),
                "type": NudgeType.ALERT.value,
                "title": "Multiple BNPL Purchases Detected",
                "message": f"You've made {bnpl_count} BNPL purchases this week. "
                          f"This could lead to a debt spiral.",
                "action": "Review BNPL",
                "created_at": datetime.now().isoformat(),
                "priority": 7
            }
            nudges.append(nudge)
        
        return nudges
    
    def _check_subscription_drain(self, transactions: List[Dict],
                                 user_profile: Dict) -> List[Dict]:
        """Check for subscription overload"""
        nudges = []
        
        # Detect subscriptions
        subscription_keywords = [
            "netflix", "spotify", "youtube", "apple music",
            "disney", "hbo", "amazon prime", "icloud"
        ]
        
        subscriptions = []
        for txn in transactions[-90:]:  # 3 months
            merchant = txn.get("merchant", "").lower()
            if any(keyword in merchant for keyword in subscription_keywords):
                subscriptions.append(txn)
        
        if subscriptions:
            total_sub_cost = sum(abs(s.get("amount", 0)) for s in subscriptions)
            monthly_avg = total_sub_cost / 3  # 3 months
            
            if monthly_avg > 80:  # More than RM80/month in subscriptions
                nudge = {
                    "id": self._generate_nudge_id(),
                    "type": NudgeType.WARNING.value,
                    "title": "Subscription Drain Alert",
                    "message": f"Your subscriptions cost RM{monthly_avg:.2f}/month. "
                              f"Consider cancelling unused ones to save money.",
                    "action": "Review & cancel",
                    "created_at": datetime.now().isoformat(),
                    "priority": 6
                }
                nudges.append(nudge)
        
        return nudges
    
    def _check_ptptn_status(self, user_profile: Dict) -> List[Dict]:
        """Check PTPTN repayment status and generate nudges"""
        nudges = []
        
        ptptn_balance = user_profile.get("ptptn_outstanding", 0)
        monthly_repayment = user_profile.get("ptptn_monthly_repayment", 0)
        
        if ptptn_balance <= 0:
            return nudges
        
        # If balance is high, nudge for on-time payment
        if ptptn_balance > 20000:
            nudge = {
                "id": self._generate_nudge_id(),
                "type": NudgeType.GENTLE.value,
                "title": "PTPTN Repayment Reminder",
                "message": f"Your outstanding PTPTN balance is RM{ptptn_balance:,.0f}. "
                          f"Monthly payment: RM{monthly_repayment}. Stay current to avoid default.",
                "action": "View schedule",
                "created_at": datetime.now().isoformat(),
                "priority": 5
            }
            nudges.append(nudge)
        
        return nudges
    
    def _generate_praise(self, user_profile: Dict,
                        transactions: List[Dict]) -> List[Dict]:
        """Generate positive reinforcement nudges"""
        nudges = []
        
        # Check if user maintained savings streak
        monthly_savings = user_profile.get("monthly_savings", 0)
        if monthly_savings > 500:  # Good savings
            nudge = {
                "id": self._generate_nudge_id(),
                "type": NudgeType.PRAISE.value,
                "title": "🔥 Great Savings!",
                "message": f"You've saved RM{monthly_savings:.2f} this month. Keep it up!",
                "action": "View savings goal",
                "created_at": datetime.now().isoformat(),
                "priority": 3
            }
            nudges.append(nudge)
        
        return nudges
    
    def _prioritize_nudges(self, nudges: List[Dict]) -> List[Dict]:
        """Sort nudges by priority (higher first)"""
        return sorted(nudges, key=lambda x: x.get("priority", 0), reverse=True)
    
    def _generate_nudge_id(self) -> str:
        """Generate unique nudge ID"""
        self.nudge_id_counter += 1
        return f"nudge_{datetime.now().timestamp()}_{self.nudge_id_counter}"


# Example usage
if __name__ == "__main__":
    engine = NudgeEngine()
    
    # Mock data
    transactions = [
        {"merchant": "GrabFood", "amount": -18.50, "category": "Food & Drink"},
        {"merchant": "Shopee", "amount": -89.00, "category": "Shopping"},
        {"merchant": "Netflix", "amount": -17.00, "category": "Subscriptions"},
        {"merchant": "Grab Ride", "amount": -12.50, "category": "Transport"},
    ]
    
    user_profile = {
        "user_id": "user_123",
        "monthly_income": 3000,
        "bnpl_commitments": 400,
        "ptptn_outstanding": 25000,
        "ptptn_monthly_repayment": 350,
    }
    
    nudges = engine.generate_nudges(
        user_id="user_123",
        transactions=transactions,
        user_profile=user_profile,
        health_score=65
    )
    
    print("Generated Nudges:")
    print("-" * 60)
    for nudge in nudges:
        print(f"\n[{nudge['type'].upper()}] {nudge['title']}")
        print(f"Message: {nudge['message']}")
        print(f"Action: {nudge['action']}")
