"""
GX Rise — FastAPI Backend
Serves the React Native mobile app with health scores, nudges, transactions,
subscriptions, BNPL data, PTPTN info, and Claude Haiku digests.
"""

import os
import sys
from datetime import datetime
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Allow importing from ai/ directory
sys.path.insert(0, str(Path(__file__).parent.parent / "ai"))

from spending_classifier import classify_transaction, get_category_stats  # noqa: E402
from health_score import calculate_health_score, simulate_score_history    # noqa: E402
from nudge_engine import NudgeEngine, get_demo_nudge                        # noqa: E402
from subscription_detector import detect_subscriptions, get_potential_savings  # noqa: E402
from notification_parser import get_connected_accounts                      # noqa: E402
from mock_data_generator import generate_azri, generate_siti               # noqa: E402

app = FastAPI(
    title="GX Rise API",
    description="AI Financial Resilience Module for GXBank — UTMxHackathon'26",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory mock DB (generated once on startup) ──────────────────────────────
_MOCK_DB: dict = {}


@app.on_event("startup")
def _init_mock_db():
    import random
    random.seed(42)
    _MOCK_DB["azri"] = generate_azri()
    _MOCK_DB["siti"] = generate_siti()


# ── Models ─────────────────────────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    merchant: str
    amount: Optional[float] = None


class HealthScoreRequest(BaseModel):
    transactions: list[dict]
    savings_balance: float
    income: float
    bnpl_total: float
    previous_score: Optional[float] = None


class DigestRequest(BaseModel):
    user_id: str
    health_score: float
    score_delta: float
    top_category: str
    top_amount: float
    savings_week: float
    streak: int
    lang: str = "ms"


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_user_txns(user_id: str) -> list[dict]:
    uid = user_id.lower()
    if uid in _MOCK_DB:
        return _MOCK_DB[uid]
    return _MOCK_DB.get("azri", [])


def _ts() -> str:
    return datetime.now().isoformat()


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "GX Rise API running", "version": "1.0.0", "timestamp": _ts()}


@app.get("/api/user/{user_id}")
def get_user(user_id: str):
    profiles = {
        "azri": {
            "user_id": "azri",
            "name": "Azri Hakim",
            "income": 1050.0,
            "savings_balance": 234.0,
            "bnpl_total": 254.0,
            "ptptn_balance": 21400.0,
            "streak": 5,
        },
        "siti": {
            "user_id": "siti",
            "name": "Siti Nabilah",
            "income": 2800.0,
            "savings_balance": 1240.0,
            "bnpl_total": 120.0,
            "ptptn_balance": 18500.0,
            "streak": 12,
        },
    }
    profile = profiles.get(user_id.lower(), profiles["azri"])
    return {**profile, "timestamp": _ts()}


@app.get("/api/transactions/{user_id}")
def get_transactions(user_id: str, days: int = 30, category: Optional[str] = None):
    from datetime import date, timedelta
    cutoff = (date(2026, 5, 8) - timedelta(days=days)).strftime("%Y-%m-%d")
    txns = [t for t in _get_user_txns(user_id) if t["date"] >= cutoff]
    if category:
        txns = [t for t in txns if t.get("category", "").lower() == category.lower()]
    total_debit  = sum(t["amount"] for t in txns if t["type"] == "debit")
    total_credit = sum(t["amount"] for t in txns if t["type"] == "credit")
    return {
        "user_id":      user_id,
        "transactions": txns,
        "count":        len(txns),
        "total_debit":  round(total_debit, 2),
        "total_credit": round(total_credit, 2),
        "period_days":  days,
        "timestamp":    _ts(),
    }


@app.post("/api/classify")
def classify(req: ClassifyRequest):
    category = classify_transaction(req.merchant, req.amount)
    return {"merchant": req.merchant, "category": category, "timestamp": _ts()}


@app.post("/api/health-score")
def compute_health_score(req: HealthScoreRequest):
    result = calculate_health_score(
        transactions=req.transactions,
        savings_balance=req.savings_balance,
        income=req.income,
        bnpl_total=req.bnpl_total,
        previous_score=req.previous_score,
    )
    return {**result, "timestamp": _ts()}


@app.get("/api/health-score/{user_id}")
def get_health_score(user_id: str):
    uid  = user_id.lower()
    txns = _get_user_txns(uid)
    user_cfg = {
        "azri": {"savings_balance": 234.0,  "income": 1050.0, "bnpl_total": 254.0,  "prev": 63.0},
        "siti": {"savings_balance": 1240.0, "income": 2800.0, "bnpl_total": 120.0,  "prev": 68.0},
    }.get(uid, {"savings_balance": 234.0, "income": 1050.0, "bnpl_total": 254.0, "prev": 63.0})

    result = calculate_health_score(
        transactions=txns,
        savings_balance=user_cfg["savings_balance"],
        income=user_cfg["income"],
        bnpl_total=user_cfg["bnpl_total"],
        previous_score=user_cfg["prev"],
    )
    history = simulate_score_history(result["overall"])
    return {**result, "history": history, "user_id": user_id, "timestamp": _ts()}


@app.get("/api/nudge/{user_id}")
def get_nudge(user_id: str):
    user_state = {
        "food_7d": 87.50,
        "food_budget": 80.0,
        "bnpl_due_72h": 89.0,
        "bnpl_due_date": "15 Mei 2026",
        "ptptn_credited_today": False,
        "salary_credited_today": False,
        "idle_subscription_found": True,
        "idle_subscription_name": "Netflix",
        "idle_subscription_days": 47,
        "idle_subscription_amount": 17.0,
        "streak": 5,
        "is_friday_evening": False,
        "nudges_today": 0,
    }
    engine = NudgeEngine(user_state)
    nudge  = engine.select_nudge()
    return {"user_id": user_id, "nudge": nudge, "timestamp": _ts()}


@app.get("/api/subscriptions/{user_id}")
def get_subscriptions(user_id: str):
    txns  = _get_user_txns(user_id)
    subs  = detect_subscriptions(txns)
    savings = get_potential_savings(subs)
    return {
        "user_id": user_id,
        "subscriptions": subs,
        "total_monthly": round(sum(s["amount"] for s in subs), 2),
        "potential_savings": savings,
        "timestamp": _ts(),
    }


@app.get("/api/bnpl/{user_id}")
def get_bnpl(user_id: str):
    bnpl_data = {
        "azri": {
            "items": [
                {"provider": "Atome",           "merchant": "Dress Shopee",    "amount": 89.00,  "due_date": "2026-05-15", "days_until": 7},
                {"provider": "Split",            "merchant": "Zalora Kasut",    "amount": 45.00,  "due_date": "2026-05-20", "days_until": 12},
                {"provider": "Shopee PayLater",  "merchant": "Aksesori Fon",   "amount": 120.00, "due_date": "2026-05-28", "days_until": 20},
            ],
            "income": 1050.0,
        },
        "siti": {
            "items": [
                {"provider": "Atome", "merchant": "Telefon Samsung", "amount": 120.00, "due_date": "2026-05-25", "days_until": 17},
            ],
            "income": 2800.0,
        },
    }
    data   = bnpl_data.get(user_id.lower(), bnpl_data["azri"])
    total  = sum(i["amount"] for i in data["items"])
    income = data["income"]
    free_cash = income - total
    return {
        "user_id":   user_id,
        "items":     data["items"],
        "total":     round(total, 2),
        "free_cash": round(free_cash, 2),
        "pct_of_free_cash": round(total / max(income, 1) * 100, 1),
        "risk_level": "HIGH" if total / max(income, 1) > 0.4 else "MEDIUM",
        "timestamp": _ts(),
    }


@app.get("/api/ptptn/{user_id}")
def get_ptptn(user_id: str):
    profiles = {
        "azri": {
            "outstanding_balance": 21400.00,
            "total_loan":          28660.00,
            "monthly_repayment":   356.67,
            "next_due_date":       "2026-06-15",
            "days_until_due":      38,
            "pct_repaid":          34.0,
            "amount_repaid":       7260.00,
            "years_remaining":     6,
            "status":              "on_track",
            "auto_pay":            True,
        },
        "siti": {
            "outstanding_balance": 18500.00,
            "total_loan":          24000.00,
            "monthly_repayment":   356.67,
            "next_due_date":       "2026-06-02",
            "days_until_due":      25,
            "pct_repaid":          22.9,
            "amount_repaid":       5500.00,
            "years_remaining":     5,
            "status":              "on_track",
            "auto_pay":            True,
        },
    }
    data = profiles.get(user_id.lower(), profiles["azri"])
    # Boost calculation: +RM50/month saves X months & Y interest
    extra = 50.0
    current = data["monthly_repayment"]
    months_saved = round(data["outstanding_balance"] / (current + extra)
                        - data["outstanding_balance"] / current)
    interest_saved = round(months_saved * current * 0.4)
    data["boost_calculation"] = {
        "extra_monthly": extra,
        "months_saved": abs(months_saved),
        "interest_saved": interest_saved,
    }
    return {**data, "user_id": user_id, "timestamp": _ts()}


@app.get("/api/pocket/{user_id}")
def get_pocket(user_id: str):
    return {
        "user_id": user_id,
        "pocket": {
            "id":       "pocket_langkawi_2026",
            "name":     "Trip Langkawi 2026 🌴",
            "goal":     2000.00,
            "current":  1240.00,
            "pct":      62.0,
            "deadline": "2026-08-30",
            "days_left": 114,
            "members": [
                {"name": "Azri",  "initials": "AH", "contributed": 380.00, "is_you": True},
                {"name": "Siti",  "initials": "SN", "contributed": 320.00, "is_you": False},
                {"name": "Hafiz", "initials": "HZ", "contributed": 290.00, "is_you": False},
                {"name": "Nur",   "initials": "NR", "contributed": 250.00, "is_you": False},
            ],
            "activity": [
                {"member": "Azri",  "amount": 50.00,  "date": "2026-05-07", "type": "deposit"},
                {"member": "Siti",  "amount": 80.00,  "date": "2026-05-05", "type": "deposit"},
                {"member": "Hafiz", "amount": 40.00,  "date": "2026-05-03", "type": "deposit"},
                {"member": "Nur",   "amount": 100.00, "date": "2026-05-01", "type": "deposit"},
            ],
            "withdrawal_policy": "majority",
        },
        "timestamp": _ts(),
    }


@app.get("/api/connected-accounts/{user_id}")
def get_connected_accounts_route(user_id: str):
    accounts = get_connected_accounts()
    return {"user_id": user_id, "accounts": accounts, "timestamp": _ts()}


@app.post("/api/digest")
async def generate_digest(req: DigestRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            lang_str = "Bahasa Malaysia" if req.lang == "ms" else "English"
            delta_str = f"naik {req.score_delta:.0f}" if req.score_delta >= 0 else f"turun {abs(req.score_delta):.0f}"
            prompt = (
                f"Generate a friendly, non-judgmental weekly financial summary in {lang_str}. "
                f"Stats: Health Score {req.health_score}/100 ({delta_str} mata), "
                f"Top spending: {req.top_category} RM{req.top_amount:.0f}, "
                f"Savings this week: RM{req.savings_week:.0f}, Streak: {req.streak} hari. "
                f"Rules: MAX 70 words. Use 'kamu' not 'anda'. Encouraging, never preachy. "
                f"End with ONE specific actionable tip. Reference Malaysian context if relevant."
            )
            msg = client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}],
            )
            digest_text = msg.content[0].text
        except Exception:
            digest_text = _fallback_digest(req)
    else:
        digest_text = _fallback_digest(req)

    return {
        "user_id":     req.user_id,
        "digest":      digest_text,
        "week_of":     "4–10 Mei 2026",
        "score":       req.health_score,
        "score_delta": req.score_delta,
        "timestamp":   _ts(),
    }


def _fallback_digest(req: DigestRequest) -> str:
    delta_str = f"naik {req.score_delta:.0f}" if req.score_delta >= 0 else f"turun {abs(req.score_delta):.0f}"
    return (
        f"Minggu ini, skor kamu {delta_str} mata — {'bagus!' if req.score_delta >= 0 else 'boleh buat lebih!'} "
        f"{req.top_category} ambil RM{req.top_amount:.0f}, sedikit {'tinggi' if req.top_amount > 60 else 'ok'}. "
        f"Kamu berjaya simpan RM{req.savings_week:.0f} dan streak dah {req.streak} hari. "
        f"Tips minggu depan: cuba masak sekali dan simpan RM20 terus ke PTPTN Pocket. Kamu boleh!"
    )


@app.get("/api/category-stats/{user_id}")
def get_category_stats_route(user_id: str, days: int = 30):
    from datetime import date, timedelta
    cutoff = (date(2026, 5, 8) - timedelta(days=days)).strftime("%Y-%m-%d")
    txns   = [t for t in _get_user_txns(user_id) if t["date"] >= cutoff]
    stats  = get_category_stats(txns)
    return {"user_id": user_id, "stats": stats, "period_days": days, "timestamp": _ts()}


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": _ts()},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
