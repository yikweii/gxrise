"""
Mock Data Generator
Generates realistic Malaysian student transaction data for demo/testing
"""

import random
from datetime import datetime, timedelta
import json
from typing import List, Dict

class MockDataGenerator:
    """
    Generates realistic transaction data based on Malaysian student spending patterns.
    Used for demo when real GXBank API is not available.
    """
    
    def __init__(self):
        """Initialize merchant and transaction templates"""
        
        self.merchants = {
            "Food & Drink": [
                "GrabFood", "FoodPanda", "Deliveroo", "KFC", "McDonald's",
                "Pizza Hut", "Subway", "Starbucks", "Nespresso", "Local Kopitiam",
                "Nasi Lemak Stall", "Mamak Restaurant", "Sushi King", "Pepper Lunch"
            ],
            "Transport": [
                "Grab Ride", "Grab Food", "Uber", "MRT/LRT", "BAS Rapid",
                "Shell Petrol", "Petronas", "Caltex", "Parking KL Sentral", "Toll"
            ],
            "Shopping": [
                "Shopee", "Lazada", "Taobao", "Amazon", "Zalora",
                "Shein", "Uniqlo", "H&M", "Forever 21", "Aeon",
                "Pavilion Mall", "Sunway Pyramid", "KLCC"
            ],
            "Entertainment": [
                "Netflix", "Spotify", "YouTube Premium", "Disney+", "HBO Max",
                "Apple Music", "TGV Cinemas", "Golden Screen", "Klook", "Ticketmaster"
            ],
            "Subscriptions": [
                "Netflix", "Spotify", "YouTube", "Disney+", "Apple iCloud",
                "Amazon Prime", "Scribd", "Audible"
            ],
            "Utilities": [
                "TNB Electricity", "Water Bill", "Astro TV", "Unifi Internet",
                "Maxis Postpaid", "Digi Postpaid", "Celcom Postpaid", "Airtel"
            ],
            "BNPL": [
                "Atome Payment", "Split Payment", "Shopee PayLater",
                "Lazada PayLater", "Grab PayLater"
            ],
            "Education": [
                "University Fees", "Tuition Center", "Online Course",
                "Exam Registration", "Book Store"
            ]
        }
    
    def generate_transactions(self, days: int = 90, user_id: str = "demo_user") -> List[Dict]:
        """
        Generate realistic transaction history for a Malaysian student.
        
        Args:
            days: Number of days of history to generate
            user_id: User identifier
            
        Returns:
            List of transaction dictionaries
        """
        
        transactions = []
        now = datetime.now()
        
        # Generate transactions for the past N days
        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            
            # Vary number of transactions per day (2-6 transactions)
            num_txns = random.randint(2, 6)
            
            for _ in range(num_txns):
                # Random time during the day
                hour = random.randint(6, 23)
                minute = random.randint(0, 59)
                txn_time = date.replace(hour=hour, minute=minute)
                
                # Pick random category and merchant
                category = random.choice(list(self.merchants.keys()))
                merchant = random.choice(self.merchants[category])
                
                # Determine amount based on category
                amount = self._generate_amount(category)
                
                transaction = {
                    "id": f"txn_{user_id}_{now.timestamp()}_{random.randint(1000, 9999)}",
                    "user_id": user_id,
                    "merchant": merchant,
                    "amount": -amount,  # Negative for expense
                    "category": category,
                    "timestamp": txn_time.isoformat(),
                    "description": f"Transaction at {merchant}",
                    "status": "completed"
                }
                
                transactions.append(transaction)
        
        # Add some income (part-time salary on 1st, pocket money from parents on 5th)
        if now.day >= 1:
            salary_date = now.replace(day=1, hour=9, minute=0, second=0)
            if (now - salary_date).days >= 0 and (now - salary_date).days < days:
                transactions.append({
                    "id": f"txn_{user_id}_salary_{now.timestamp()}",
                    "user_id": user_id,
                    "merchant": "Salary Deposit",
                    "amount": 3000,  # Monthly salary
                    "category": "Income",
                    "timestamp": salary_date.isoformat(),
                    "description": "Monthly salary",
                    "status": "completed"
                })

        # Monthly pocket money from parents (transferred every 5th)
        pocket_money_date = now.replace(day=5, hour=10, minute=0, second=0)
        if (now - pocket_money_date).days >= 0 and (now - pocket_money_date).days < days:
            transactions.append({
                "id": f"txn_{user_id}_pocketmoney_{now.timestamp()}",
                "user_id": user_id,
                "merchant": "Transfer from Ibu & Ayah",
                "amount": 500,  # Monthly allowance from parents
                "category": "Income",
                "timestamp": pocket_money_date.isoformat(),
                "description": "Monthly pocket money from parents",
                "status": "completed"
            })
        
        # Sort by timestamp (newest first)
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return transactions
    
    def _generate_amount(self, category: str) -> float:
        """Generate realistic amount based on category"""
        amounts = {
            "Food & Drink": (8, 35),
            "Transport": (5, 25),
            "Shopping": (20, 200),
            "Entertainment": (15, 60),
            "Subscriptions": (10, 25),
            "Utilities": (30, 100),
            "BNPL": (30, 100),
            "Education": (50, 500),
        }
        
        min_amt, max_amt = amounts.get(category, (10, 50))
        
        # Round to nearest .50
        amount = random.uniform(min_amt, max_amt)
        return round(amount * 2) / 2
    
    def generate_user_profile(self, user_id: str = "demo_user") -> Dict:
        """Generate a realistic student user profile"""
        
        # Base monthly income (part-time + occasional)
        monthly_income = random.randint(2000, 4000)
        
        # BNPL commitments (typically 2-3 active)
        bnpl_commitments = random.randint(50, 300)
        
        # PTPTN outstanding (varies by year)
        ptptn_outstanding = random.choice([
            15000,  # 2nd year
            25000,  # 3rd year
            35000,  # Final year
        ])
        
        ptptn_monthly = 350  # Standard repayment
        
        # Savings (typically low for students)
        savings_balance = random.randint(500, 3000)
        
        # Monthly expenses (rough estimate)
        monthly_expenses = random.randint(1800, 3000)
        
        return {
            "user_id": user_id,
            "name": random.choice(["Ahmad", "Siti", "Raj", "Farah", "Wei"]),
            "age": random.randint(20, 24),
            "status": "University Student",
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "savings_balance": savings_balance,
            "bnpl_commitments": bnpl_commitments,
            "ptptn_outstanding": ptptn_outstanding,
            "ptptn_monthly_repayment": ptptn_monthly,
            "created_at": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat()
        }
    
    def generate_bnpl_debts(self) -> List[Dict]:
        """Generate realistic BNPL debt portfolio"""
        return [
            {
                "id": "bnpl_001",
                "provider": "Shopee PayLater",
                "amount": 89.00,
                "due_date": (datetime.now() + timedelta(days=7)).isoformat(),
                "status": "active",
                "installments_remaining": 2
            },
            {
                "id": "bnpl_002",
                "provider": "Atome",
                "amount": 150.00,
                "due_date": (datetime.now() + timedelta(days=15)).isoformat(),
                "status": "active",
                "installments_remaining": 3
            },
            {
                "id": "bnpl_003",
                "provider": "Lazada PayLater",
                "amount": 45.50,
                "due_date": (datetime.now() + timedelta(days=3)).isoformat(),
                "status": "active",
                "installments_remaining": 1
            }
        ]
    
    def generate_subscriptions(self) -> List[Dict]:
        """Generate typical subscription portfolio"""
        return [
            {
                "id": "sub_001",
                "name": "Netflix",
                "provider": "Netflix",
                "monthly_cost": 17.00,
                "renewal_date": (datetime.now() + timedelta(days=15)).isoformat(),
                "category": "Entertainment",
                "last_used": (datetime.now() - timedelta(days=2)).isoformat(),
                "status": "active"
            },
            {
                "id": "sub_002",
                "name": "Spotify",
                "provider": "Spotify",
                "monthly_cost": 15.90,
                "renewal_date": (datetime.now() + timedelta(days=8)).isoformat(),
                "category": "Music",
                "last_used": (datetime.now() - timedelta(hours=4)).isoformat(),
                "status": "active"
            },
            {
                "id": "sub_003",
                "name": "YouTube Premium",
                "provider": "Google",
                "monthly_cost": 16.90,
                "renewal_date": (datetime.now() + timedelta(days=22)).isoformat(),
                "category": "Entertainment",
                "last_used": (datetime.now() - timedelta(hours=1)).isoformat(),
                "status": "active"
            },
            {
                "id": "sub_004",
                "name": "Disney+",
                "provider": "Disney",
                "monthly_cost": 22.90,
                "renewal_date": (datetime.now() + timedelta(days=12)).isoformat(),
                "category": "Entertainment",
                "last_used": (datetime.now() - timedelta(days=30)).isoformat(),
                "status": "unused"  # Not used in 30+ days
            }
        ]
    
    def generate_dataset_json(self, output_path: str = None) -> Dict:
        """Generate complete dataset for demo"""
        dataset = {
            "user": self.generate_user_profile(),
            "transactions": self.generate_transactions(days=90),
            "bnpl_debts": self.generate_bnpl_debts(),
            "subscriptions": self.generate_subscriptions(),
            "generated_at": datetime.now().isoformat(),
            "note": "This is mock data for demonstration purposes only."
        }
        
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(dataset, f, indent=2)
        
        return dataset


# Example usage
if __name__ == "__main__":
    generator = MockDataGenerator()
    
    # Generate dataset
    dataset = generator.generate_dataset_json()
    
    print("Mock Data Generated:")
    print("-" * 60)
    print(f"User: {dataset['user']['name']} ({dataset['user']['status']})")
    print(f"Monthly Income: RM{dataset['user']['monthly_income']:.2f}")
    print(f"Transactions: {len(dataset['transactions'])} entries")
    print(f"BNPL Debts: {len(dataset['bnpl_debts'])} active")
    print(f"Subscriptions: {len(dataset['subscriptions'])} active")
    print(f"\nSample transactions:")
    for txn in dataset['transactions'][:3]:
        print(f"  - {txn['merchant']:20} RM{txn['amount']:>8.2f} ({txn['category']})")
