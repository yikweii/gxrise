"""
GX Rise — Financial Health Score Engine
Weighted 4-dimension scoring: Spending Control, Savings Rate, Debt Risk, Emergency Buffer
"""

from typing import Optional
from spending_classifier import classify_transaction, get_category_stats

NON_ESSENTIAL_CATEGORIES = {
    "Food & Drink", "Online Shopping", "Entertainment", "Subscriptions", "Cash/ATM"
}

WEIGHTS = {"spending_control": 0.30, "savings_rate": 0.25, "debt_risk": 0.25, "emergency_buffer": 0.20}

SCORE_LABELS = [
    (80, "Sihat", "Healthy", "#2DC653"),
    (60, "Sederhana", "Moderate", "#00B4D8"),
    (40, "Perlu Perhatian", "Needs Attention", "#FFB703"),
    (0,  "Kritikal", "Critical", "#E63946"),
]


def calculate_health_score(
    transactions: list[dict],
    savings_balance: float,
    income: float,
    bnpl_total: float,
    previous_score: Optional[float] = None,
) -> dict:
    """
    Returns full health score breakdown.
    All dimension scores are 0–100; overall is weighted sum.
    """
    if income <= 0:
        income = 1

    debit_txns = [t for t in transactions if t.get("type") == "debit"]
    credit_txns = [t for t in transactions if t.get("type") == "credit"]

    non_essential = sum(
        abs(t["amount"]) for t in debit_txns
        if classify_transaction(t.get("merchant", "")) in NON_ESSENTIAL_CATEGORIES
    )
    monthly_savings = sum(abs(t["amount"]) for t in credit_txns
                          if "savings" in t.get("category", "").lower()
                          or "simpan" in t.get("merchant", "").lower())
    total_spend = sum(abs(t["amount"]) for t in debit_txns)
    weekly_spend = total_spend / 4 if total_spend else 1
    available_cash = max(income - bnpl_total, 1)

    spending_control = min(100.0, (1 - non_essential / income) * 200)
    savings_rate     = min(100.0, monthly_savings / income * 500)
    debt_risk        = min(100.0, (1 - bnpl_total / available_cash) * 150)
    emergency_buffer = min(100.0, savings_balance / weekly_spend * 25)

    # Clamp negatives
    spending_control = max(0.0, spending_control)
    savings_rate     = max(0.0, savings_rate)
    debt_risk        = max(0.0, debt_risk)
    emergency_buffer = max(0.0, emergency_buffer)

    overall = (
        spending_control * WEIGHTS["spending_control"]
        + savings_rate     * WEIGHTS["savings_rate"]
        + debt_risk        * WEIGHTS["debt_risk"]
        + emergency_buffer * WEIGHTS["emergency_buffer"]
    )

    label_bm, label_en, colour = _get_label(overall)
    delta = round(overall - previous_score, 1) if previous_score is not None else 0.0

    return {
        "overall": round(overall, 1),
        "spending_control": round(spending_control, 1),
        "savings_rate": round(savings_rate, 1),
        "debt_risk": round(debt_risk, 1),
        "emergency_buffer": round(emergency_buffer, 1),
        "delta": delta,
        "label_bm": label_bm,
        "label_en": label_en,
        "colour": colour,
        "tips": get_improvement_tips({
            "spending_control": spending_control,
            "savings_rate": savings_rate,
            "debt_risk": debt_risk,
            "emergency_buffer": emergency_buffer,
        }),
        "category_stats": get_category_stats(transactions),
    }


def _get_label(score: float) -> tuple[str, str, str]:
    for threshold, bm, en, colour in SCORE_LABELS:
        if score >= threshold:
            return bm, en, colour
    return "Kritikal", "Critical", "#E63946"


def get_improvement_tips(dimensions: dict) -> list[str]:
    worst = min(dimensions, key=dimensions.get)
    tips = {
        "spending_control": [
            "Kurangkan pesanan GrabFood kepada 3x seminggu — jimat ~RM30/bulan",
            "Set bajet harian RM25 untuk makanan dan patuhi selama 2 minggu",
            "Masak di rumah sekali seminggu untuk tingkat skor 5-8 mata",
        ],
        "savings_rate": [
            "Auto-save 10% setiap kali terima pendapatan — buat ia lalai",
            "Transfer RM50 ke Savings Pocket sekarang untuk mulakan streak",
            "Cancel satu langganan yang tak guna dan auto-redirect ke simpanan",
        ],
        "debt_risk": [
            "Jangan ambil BNPL baru sehingga hutang semasa dibayar sepenuhnya",
            "Bayar BNPL tertinggi dahulu untuk kurangkan risiko hutang",
            "Ketepikan wang BNPL due sekarang supaya tak terkejut bila due date",
        ],
        "emergency_buffer": [
            "Simpan RM100/bulan ke dana kecemasan — target 4 minggu perbelanjaan",
            "Lock sebahagian PTPTN ke Bonus Pocket 3.55% sebagai buffer kecemasan",
            "Mulakan dengan RM50 minggu ni — dana kecemasan pertama kamu",
        ],
    }
    return tips.get(worst, ["Teruskan usaha yang baik!"])


def simulate_score_history(base_score: float, weeks: int = 8) -> list[float]:
    """Generates realistic week-by-week score progression toward base_score."""
    import random
    history = []
    start = max(base_score - 25, 20)
    for i in range(weeks):
        noise = random.uniform(-3, 4)
        progress = (base_score - start) * (i / (weeks - 1)) if weeks > 1 else 0
        history.append(round(min(100, max(0, start + progress + noise)), 1))
    history[-1] = base_score
    return history


if __name__ == "__main__":
    sample_txns = [
        {"merchant": "GrabFood", "amount": 18.50, "type": "debit", "category": "Food & Drink"},
        {"merchant": "Netflix", "amount": 17.00, "type": "debit", "category": "Subscriptions"},
        {"merchant": "Shopee", "amount": 45.00, "type": "debit", "category": "Online Shopping"},
        {"merchant": "RapidKL", "amount": 3.20, "type": "debit", "category": "Transport"},
        {"merchant": "GX Rise Auto-Save", "amount": 130.00, "type": "credit", "category": "Savings Transfer"},
    ]
    result = calculate_health_score(
        transactions=sample_txns,
        savings_balance=234.0,
        income=1050.0,
        bnpl_total=254.0,
        previous_score=63.0,
    )
    print(f"Health Score: {result['overall']}/100 ({result['label_bm']})")
    print(f"Delta:        {result['delta']:+.1f} mata minggu ini")
    print(f"Spending Control:  {result['spending_control']:.1f}/100")
    print(f"Savings Rate:      {result['savings_rate']:.1f}/100")
    print(f"Debt Risk:         {result['debt_risk']:.1f}/100")
    print(f"Emergency Buffer:  {result['emergency_buffer']:.1f}/100")
    print(f"\nTips: {result['tips'][0]}")
