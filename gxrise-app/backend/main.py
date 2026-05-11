"""
GX Rise Backend API
FastAPI application for financial coaching module
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
from typing import Optional, List

# Initialize FastAPI app
app = FastAPI(
    title="GX Rise API",
    description="AI Financial Resilience Module for GXBank",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

from pydantic import BaseModel
from enum import Enum

class TransactionCategory(str, Enum):
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

class Transaction(BaseModel):
    id: str
    merchant: str
    amount: float
    category: TransactionCategory
    timestamp: str
    description: Optional[str] = None

class HealthScoreBreakdown(BaseModel):
    savings_rate: int
    spending_control: int
    debt_risk: int
    emergency_buffer: int
    overall_score: int

class Nudge(BaseModel):
    id: str
    type: str  # "alert", "opportunity", "warning"
    title: str
    message: str
    action: str
    timestamp: str
    is_read: bool = False

class User(BaseModel):
    user_id: str
    name: str
    monthly_income: float
    monthly_expenses: float
    bnpl_commitments: float
    ptptn_balance: Optional[float] = None

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "GX Rise API running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/health/{user_id}")
def get_health_score(user_id: str):
    """Calculate and return financial health score"""
    logger.info(f"Fetching health score for user {user_id}")
    
    # Mock implementation - replace with real calculation
    health_breakdown = HealthScoreBreakdown(
        savings_rate=45,  # ⚠️ Low
        spending_control=72,  # ✓ Moderate
        debt_risk=58,  # ⚠️ Moderate
        emergency_buffer=40,  # ✗ Very Low
        overall_score=54
    )
    
    return {
        "user_id": user_id,
        "health_score": health_breakdown.overall_score,
        "breakdown": health_breakdown,
        "timestamp": datetime.now().isoformat(),
        "message": "Your health score indicates moderate financial resilience. Focus on building emergency savings."
    }

@app.get("/api/transactions/{user_id}")
def get_transactions(user_id: str, limit: int = 20):
    """Get categorized transactions for a user"""
    logger.info(f"Fetching transactions for user {user_id}")
    
    # Mock transactions - replace with real data
    mock_transactions = [
        Transaction(
            id="txn_001",
            merchant="GrabFood",
            amount=-18.50,
            category=TransactionCategory.FOOD,
            timestamp="2026-05-08T19:30:00Z",
            description="GrabFood delivery - dinner"
        ),
        Transaction(
            id="txn_002",
            merchant="Shopee",
            amount=-89.00,
            category=TransactionCategory.SHOPPING,
            timestamp="2026-05-08T14:15:00Z",
            description="Shopee - electronics"
        ),
        Transaction(
            id="txn_003",
            merchant="Grab Ride",
            amount=-12.50,
            category=TransactionCategory.TRANSPORT,
            timestamp="2026-05-07T17:45:00Z",
            description="Grab ride to campus"
        ),
        Transaction(
            id="txn_004",
            merchant="Netflix",
            amount=-17.00,
            category=TransactionCategory.SUBSCRIPTIONS,
            timestamp="2026-05-01T00:00:00Z",
            description="Netflix monthly subscription"
        ),
    ]
    
    return {
        "user_id": user_id,
        "transactions": mock_transactions[:limit],
        "total_spending": sum(abs(t.amount) for t in mock_transactions[:limit]),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/nudges/{user_id}")
def get_nudges(user_id: str):
    """Get personalized nudges for a user"""
    logger.info(f"Fetching nudges for user {user_id}")
    
    # Mock nudges - replace with AI-generated
    nudges = [
        Nudge(
            id="nudge_001",
            type="alert",
            title="GrabFood Overspend Alert",
            message="You've spent RM67 on GrabFood this week — that's 89% of your weekly food budget. Cook once this week and save RM20?",
            action="Save RM20",
            timestamp="2026-05-08T20:00:00Z",
            is_read=False
        ),
        Nudge(
            id="nudge_002",
            type="opportunity",
            title="PTPTN Disbursement Detected",
            message="RM650 just landed! Students who save 20% on disbursement day are 3x more likely to avoid borrowing later. Save RM130 now?",
            action="Lock in savings",
            timestamp="2026-05-04T10:00:00Z",
            is_read=False
        ),
    ]
    
    return {
        "user_id": user_id,
        "nudges": nudges,
        "unread_count": sum(1 for n in nudges if not n.is_read),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/nudges/{user_id}/{nudge_id}/read")
def mark_nudge_read(user_id: str, nudge_id: str):
    """Mark a nudge as read"""
    logger.info(f"Marking nudge {nudge_id} as read for user {user_id}")
    
    return {
        "status": "nudge marked as read",
        "user_id": user_id,
        "nudge_id": nudge_id,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/bnpl/{user_id}")
def get_bnpl_debts(user_id: str):
    """Get aggregated BNPL debts"""
    logger.info(f"Fetching BNPL debts for user {user_id}")
    
    bnpl_debts = [
        {
            "provider": "Shopee PayLater",
            "amount": 89.00,
            "due_date": "2026-05-15",
            "status": "active"
        },
        {
            "provider": "Atome",
            "amount": 45.00,
            "due_date": "2026-05-20",
            "status": "active"
        }
    ]
    
    total_bnpl = sum(d["amount"] for d in bnpl_debts)
    
    return {
        "user_id": user_id,
        "bnpl_debts": bnpl_debts,
        "total_committed": total_bnpl,
        "risk_level": "moderate" if total_bnpl > 100 else "low",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/ptptn/{user_id}")
def get_ptptn_info(user_id: str):
    """Get PTPTN repayment information"""
    logger.info(f"Fetching PTPTN info for user {user_id}")
    
    return {
        "user_id": user_id,
        "outstanding_balance": 25000,
        "monthly_repayment": 350,
        "next_due_date": "2026-06-01",
        "repayment_schedule": [
            {"date": "2026-06-01", "amount": 350},
            {"date": "2026-07-01", "amount": 350},
            {"date": "2026-08-01", "amount": 350},
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/subscriptions/{user_id}")
def get_subscriptions(user_id: str):
    """Get detected subscriptions"""
    logger.info(f"Fetching subscriptions for user {user_id}")
    
    subscriptions = [
        {
            "name": "Netflix",
            "category": "Entertainment",
            "monthly_cost": 17.00,
            "renewal_date": "2026-06-01",
            "status": "active"
        },
        {
            "name": "Spotify",
            "category": "Music",
            "monthly_cost": 15.90,
            "renewal_date": "2026-05-15",
            "status": "active"
        },
        {
            "name": "YouTube Premium",
            "category": "Entertainment",
            "monthly_cost": 16.90,
            "renewal_date": "2026-05-10",
            "status": "active"
        },
        {
            "name": "Disney+",
            "category": "Entertainment",
            "monthly_cost": 22.90,
            "renewal_date": "2026-05-20",
            "status": "unused"  # ⚠️ Not used in 30 days
        }
    ]
    
    total_monthly = sum(s["monthly_cost"] for s in subscriptions)
    unused_cost = sum(s["monthly_cost"] for s in subscriptions if s["status"] == "unused")
    
    return {
        "user_id": user_id,
        "subscriptions": subscriptions,
        "total_monthly_cost": total_monthly,
        "unused_cost": unused_cost,
        "potential_savings": unused_cost,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/digest/{user_id}")
def generate_digest(user_id: str, lang: str = "bm"):
    """Generate weekly AI digest in Bahasa Malaysia (lang=bm) or English (lang=en)"""
    logger.info(f"Generating digest for user {user_id} in lang={lang}")

    content = {
        "bm": {
            "summary": """
        Minggu ini, anda telah menghabiskan RM428 — lebih 15% daripada target anda.
        Belanja makanan anda naik kepada RM89 (biasanya RM60), terutamanya dari GrabFood pada malam hari.
        Berita baik: Anda telah menyelamatkan RM150 kepada poket tabung anda!
        Fokus minggu depan: Masak sekali seminggu untuk menjimatkan RM20.
        """,
            "actionable_items": [
                "Kurangkan GrabFood pesanan kepada 2x per minggu",
                "Batal langganan Disney+ yang tidak digunakan",
                "Simpan RM130 dari PTPTN anda seperti rancangan",
            ],
        },
        "en": {
            "summary": """
        This week, you spent RM428 — 15% over your target.
        Your food spending rose to RM89 (usually RM60), mostly from GrabFood late at night.
        Good news: You saved RM150 into your savings pocket!
        Focus for next week: Cook at home once a week to save RM20.
        """,
            "actionable_items": [
                "Reduce GrabFood orders to 2x per week",
                "Cancel your unused Disney+ subscription",
                "Save RM130 from your PTPTN as planned",
            ],
        },
    }

    selected = content.get(lang, content["bm"])

    # Mock digest - replace with Claude Haiku API call
    digest = {
        "user_id": user_id,
        "week_of": "2026-05-04 to 2026-05-10",
        "lang": lang,
        "summary": selected["summary"],
        "actionable_items": selected["actionable_items"],
        "score_forecast": "Your health score will improve to 62 if you follow recommendations",
        "timestamp": datetime.now().isoformat()
    }

    return digest

@app.get("/api/pocket-kawan/{user_id}")
def get_shared_savings(user_id: str):
    """Get shared savings goals with friends"""
    logger.info(f"Fetching shared savings for user {user_id}")
    
    shared_goals = [
        {
            "goal_id": "goal_001",
            "name": "Langkawi Trip 2026",
            "members": ["You", "Amirah", "Farah"],
            "target_amount": 1500,
            "current_amount": 450,
            "target_per_person": 500,
            "saved_by_you": 150,
            "deadline": "2026-07-01",
            "streak_days": 7
        }
    ]
    
    return {
        "user_id": user_id,
        "shared_goals": shared_goals,
        "total_shared_saved": 450,
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# ERROR HANDLING
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.now().isoformat()}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
