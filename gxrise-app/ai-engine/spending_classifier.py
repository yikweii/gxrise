"""
Spending Classifier - AI Engine
Categorizes transactions into predefined categories
Uses rule-based approach with ML-ready architecture for production
"""

import re
from typing import Tuple, List, Dict
from enum import Enum

class TransactionCategory(str, Enum):
    """Transaction categories aligned with Malaysian spending patterns"""
    FOOD = "Food & Drink"
    TRANSPORT = "Transport"
    SHOPPING = "Online Shopping"
    ENTERTAINMENT = "Entertainment"
    SUBSCRIPTIONS = "Subscriptions"
    UTILITIES = "Utilities"
    EDUCATION = "Education"
    BNPL = "BNPL Repayment"
    SAVINGS = "Savings Transfer"
    OTHER = "Other"

class SpendingClassifier:
    """
    Classifies transactions into spending categories.
    Architecture supports:
    - Rule-based classification (immediate)
    - ML model integration (MiniLM ONNX for production)
    """
    
    def __init__(self):
        """Initialize merchant keyword mappings"""
        self.merchant_keywords = {
            TransactionCategory.FOOD: [
                "grabfood", "foodpanda", "deliveroo", "kfc", "mcdonald",
                "pizza hut", "subway", "starbucks", "nespresso", "restaurant",
                "cafe", "kopitiam", "mamak", "hawker", "roti", "nasi",
                "dim sum", "sushi", "jjim", "curry"
            ],
            TransactionCategory.TRANSPORT: [
                "grab", "uber", "taxi", "mrt", "lrt", "bas", "bus",
                "petrol", "shell", "petronas", "caltex", "parking",
                "tolls", "dtx", "highway", "myrapid"
            ],
            TransactionCategory.SHOPPING: [
                "shopee", "lazada", "taobao", "alibaba", "amazon",
                "zalora", "shein", "uniqlo", "h&m", "zara", "forever 21",
                "sephora", "boots", "watsons", "guardian", "mall",
                "aeon", "pavilion", "sunway", "klcc"
            ],
            TransactionCategory.ENTERTAINMENT: [
                "netflix", "spotify", "youtube", "twitch", "disney",
                "hbo", "iflix", "astro", "gaming", "steam", "psn",
                "cinema", "tgv", "golden screen", "movie", "concert",
                "ticketmaster", "clubbing", "pub", "bar", "karaoke"
            ],
            TransactionCategory.SUBSCRIPTIONS: [
                "netflix", "spotify", "youtube premium", "apple music",
                "amazon prime", "disney+", "hbo max", "icloud",
                "subscription", "monthly", "renewal", "billing",
                "membership", "premium", "pro", "plus"
            ],
            TransactionCategory.UTILITIES: [
                "tnb", "electricity", "water", "astro", "maxis",
                "digi", "celcom", "u mobile", "unifi", "postpaid",
                "phone bill", "internet", "gas", "sewerage",
                "telekom", "broadband"
            ],
            TransactionCategory.EDUCATION: [
                "university", "college", "tuition", "training",
                "course", "exam", "school", "book", "study",
                "moe", "exam fees", "registration"
            ],
            TransactionCategory.BNPL: [
                "atome", "split", "aeon credit", "maybank",
                "installment", "bnpl", "pay later", "shopee paylater",
                "lazada paylater", "grab pay later", "affirm"
            ],
            TransactionCategory.SAVINGS: [
                "gxbank", "transfer to", "savings pocket",
                "investment", "mutual fund", "reksadana",
                "buying", "recurring deposit"
            ]
        }
    
    def classify(self, merchant: str, amount: float, 
                transaction_hour: int = None) -> Tuple[TransactionCategory, float]:
        """
        Classify a transaction based on merchant name and amount.
        
        Args:
            merchant: Merchant name from transaction
            amount: Transaction amount
            transaction_hour: Hour of day (0-23) for context
            
        Returns:
            Tuple of (category, confidence_score)
        """
        # Normalize merchant name
        merchant_lower = merchant.lower().strip()
        
        # Calculate confidence scores for each category
        scores = {}
        for category, keywords in self.merchant_keywords.items():
            score = self._calculate_merchant_score(merchant_lower, keywords)
            scores[category] = score
        
        # Amount-based heuristics
        amount_scores = self._calculate_amount_heuristics(amount)
        for category, score in amount_scores.items():
            scores[category] = scores.get(category, 0) + score * 0.2
        
        # Time-based heuristics
        if transaction_hour is not None:
            time_scores = self._calculate_time_heuristics(transaction_hour)
            for category, score in time_scores.items():
                scores[category] = scores.get(category, 0) + score * 0.1
        
        # Find category with highest score
        best_category = max(scores, key=scores.get)
        confidence = min(scores[best_category], 1.0)
        
        # Default to OTHER if confidence is very low
        if confidence < 0.3:
            best_category = TransactionCategory.OTHER
            confidence = 0.5
        
        return best_category, confidence
    
    def _calculate_merchant_score(self, merchant: str, keywords: List[str]) -> float:
        """Calculate match score between merchant and keyword list"""
        merchant_words = merchant.split()
        
        matches = 0
        for keyword in keywords:
            if keyword in merchant or any(keyword in word for word in merchant_words):
                matches += 1
        
        return min(matches / max(len(keywords), 1), 1.0)
    
    def _calculate_amount_heuristics(self, amount: float) -> Dict:
        """Add amount-based heuristics"""
        scores = {}
        abs_amount = abs(amount)
        
        # Large subscriptions-like amounts (monthly recurring)
        if 10 <= abs_amount <= 50:
            scores[TransactionCategory.SUBSCRIPTIONS] = 0.3
            scores[TransactionCategory.UTILITIES] = 0.3
        
        # Food/transport range
        if 5 <= abs_amount <= 30:
            scores[TransactionCategory.FOOD] = 0.2
            scores[TransactionCategory.TRANSPORT] = 0.2
        
        # Shopping amounts
        if abs_amount > 50:
            scores[TransactionCategory.SHOPPING] = 0.3
            scores[TransactionCategory.ENTERTAINMENT] = 0.2
        
        return scores
    
    def _calculate_time_heuristics(self, hour: int) -> Dict:
        """Add time-based heuristics"""
        scores = {}
        
        # Meal times
        if 6 <= hour <= 9 or 11 <= hour <= 14 or 18 <= hour <= 21:
            scores[TransactionCategory.FOOD] = 0.3
        
        # Morning commute
        if 6 <= hour <= 9:
            scores[TransactionCategory.TRANSPORT] = 0.2
        
        return scores
    
    def batch_classify(self, transactions: List[Dict]) -> List[Dict]:
        """Classify multiple transactions"""
        results = []
        for txn in transactions:
            category, confidence = self.classify(
                merchant=txn.get("merchant", "Unknown"),
                amount=txn.get("amount", 0),
                transaction_hour=txn.get("hour", None)
            )
            
            txn["predicted_category"] = category.value
            txn["confidence"] = confidence
            results.append(txn)
        
        return results


class TransactionDetector:
    """
    Advanced detector for specific transaction types:
    - BNPL payments
    - Subscriptions
    - Savings transfers
    """
    
    @staticmethod
    def is_bnpl(merchant: str, amount: float) -> bool:
        """Detect BNPL transactions"""
        bnpl_keywords = ["atome", "split", "paylater", "installment", "aeon credit"]
        return any(keyword in merchant.lower() for keyword in bnpl_keywords)
    
    @staticmethod
    def is_subscription(merchant: str, frequency: str = None) -> bool:
        """Detect subscription transactions"""
        subscription_keywords = [
            "netflix", "spotify", "youtube", "apple music", "disney",
            "subscription", "monthly", "premium", "membership"
        ]
        return any(keyword in merchant.lower() for keyword in subscription_keywords)
    
    @staticmethod
    def is_savings_transfer(merchant: str) -> bool:
        """Detect savings/investment transfers"""
        savings_keywords = ["gxbank", "transfer to savings", "investment", "mutual fund"]
        return any(keyword in merchant.lower() for keyword in savings_keywords)
    
    @staticmethod
    def is_recurring(transaction_history: List[Dict], merchant: str, 
                    tolerance_days: int = 35) -> bool:
        """
        Detect if a transaction appears to be recurring based on history.
        Typical subscriptions recur monthly (30 days ± tolerance).
        """
        matching_txns = [
            t for t in transaction_history 
            if merchant.lower() in t.get("merchant", "").lower()
        ]
        
        if len(matching_txns) < 2:
            return False
        
        # Calculate days between transactions
        # This is simplified; production version would use datetime
        return len(matching_txns) >= 2  # Basic heuristic


# Example usage
if __name__ == "__main__":
    classifier = SpendingClassifier()
    
    # Test transactions
    test_txns = [
        {"merchant": "GrabFood", "amount": -18.50, "hour": 19},
        {"merchant": "Shopee", "amount": -89.00, "hour": 14},
        {"merchant": "Netflix", "amount": -17.00, "hour": 20},
        {"merchant": "Shell Petrol", "amount": -45.00, "hour": 8},
    ]
    
    results = classifier.batch_classify(test_txns)
    
    print("Classification Results:")
    print("-" * 60)
    for result in results:
        print(f"{result['merchant']:20} | {result['amount']:>8} | "
              f"{result['predicted_category']:20} | "
              f"Confidence: {result['confidence']:.2f}")
