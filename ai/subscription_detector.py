"""
GX Rise — Subscription Detector
Detects recurring subscriptions from transaction history.
Scores each by "forgotten-ness risk" using idle days + monthly cost.
"""

from typing import Optional
from datetime import datetime, date, timedelta
from collections import defaultdict

KNOWN_SUBSCRIPTIONS: dict[str, dict] = {
    "Netflix": {
        "monthly": 17.00,
        "cancel_steps": [
            "Buka Netflix app",
            "Tap profil di sudut kanan atas → Akaun",
            "Cancel Membership → Confirm",
        ],
        "cancel_time_seconds": 45,
    },
    "Spotify Malaysia": {
        "monthly": 15.90,
        "cancel_steps": [
            "Buka Spotify → Tetapan (gear icon)",
            "Urus pelan Premium kamu",
            "Batalkan Premium → Ya, batalkan",
        ],
        "cancel_time_seconds": 40,
    },
    "YouTube Premium": {
        "monthly": 16.90,
        "cancel_steps": [
            "Buka YouTube → Profil",
            "Pengurusan langganan → YouTube Premium",
            "Batalkan langganan → Confirm",
        ],
        "cancel_time_seconds": 35,
    },
    "Disney+ Hotstar": {
        "monthly": 22.90,
        "cancel_steps": [
            "Buka Disney+ → Profil",
            "Akaun → Urus langganan",
            "Batalkan langganan → Ya",
        ],
        "cancel_time_seconds": 50,
    },
    "Apple Music": {
        "monthly": 17.00,
        "cancel_steps": [
            "Buka Tetapan iPhone → nama kamu",
            "Langganan → Apple Music",
            "Batalkan Langganan → Confirm",
        ],
        "cancel_time_seconds": 40,
    },
    "Astro": {
        "monthly": 44.00,
        "cancel_steps": [
            "Hubungi Astro di 1300-82-3838",
            "Pilih pilihan \"Batal atau ubah pakej\"",
            "Ikut arahan wakil khidmat pelanggan",
        ],
        "cancel_time_seconds": 300,
    },
}

# Idle days per subscription (simulated from notification last-open)
_DEMO_IDLE_DAYS: dict[str, Optional[int]] = {
    "Netflix": 47,
    "Apple Music": 23,
    "YouTube Premium": 8,
    "Spotify Malaysia": 1,
    "Disney+ Hotstar": 3,
    "Astro": None,  # utility, not idle-scored
}


def detect_subscriptions(transactions: list[dict]) -> list[dict]:
    """
    Detects recurring subscriptions from 90-day transaction history.
    Returns list sorted by risk_score descending.
    """
    merchant_txns: dict[str, list[dict]] = defaultdict(list)
    for txn in sorted(transactions, key=lambda x: x.get("date", "")):
        if txn.get("type") == "debit":
            merchant_txns[txn["merchant"]].append(txn)

    results = []
    for merchant, txns in merchant_txns.items():
        if len(txns) < 2:
            continue

        amounts = [abs(t["amount"]) for t in txns]
        dates   = [datetime.strptime(t["date"], "%Y-%m-%d").date() for t in txns]

        intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
        is_monthly    = all(25 <= d <= 35 for d in intervals)
        is_consistent = (max(amounts) - min(amounts)) < 0.50

        if not (is_monthly and is_consistent):
            continue

        days_idle = _DEMO_IDLE_DAYS.get(merchant)
        risk      = calculate_risk(days_idle, amounts[-1])
        risk_meta = get_risk_level(risk)
        info      = KNOWN_SUBSCRIPTIONS.get(merchant, {})

        results.append({
            "merchant":      merchant,
            "amount":        round(amounts[-1], 2),
            "annual_cost":   round(amounts[-1] * 12, 2),
            "days_idle":     days_idle,
            "risk_score":    risk,
            "risk_level":    risk_meta["level"],
            "risk_colour":   risk_meta["colour"],
            "risk_emoji":    risk_meta["emoji"],
            "months_detected": len(txns),
            "cancel_steps":  info.get("cancel_steps", []),
            "cancel_time_seconds": info.get("cancel_time_seconds", 60),
            "potential_annual_saving": round(amounts[-1] * 12, 2),
        })

    return sorted(results, key=lambda x: -x["risk_score"])


def calculate_risk(days_idle: Optional[int], monthly_cost: float) -> float:
    """
    idle_score  = min(100, days_idle * 2)   — 50 days idle = 100
    cost_score  = min(100, monthly_cost * 4) — RM25/month = 100
    risk        = idle_score*0.7 + cost_score*0.3
    """
    idle_score = min(100.0, (days_idle or 0) * 2)
    cost_score = min(100.0, monthly_cost * 4)
    return round(idle_score * 0.7 + cost_score * 0.3, 1)


def get_risk_level(score: float) -> dict:
    if score >= 70:
        return {"level": "HIGH",   "colour": "#E63946", "emoji": "🔴"}
    if score >= 40:
        return {"level": "MEDIUM", "colour": "#FFB703", "emoji": "🟡"}
    return {"level": "LOW",    "colour": "#2DC653", "emoji": "🟢"}


def get_cancel_guidance(merchant: str) -> list[str]:
    return KNOWN_SUBSCRIPTIONS.get(merchant, {}).get("cancel_steps", [
        "Buka apl",
        "Pergi ke Tetapan → Langganan",
        "Batalkan langganan",
    ])


def get_potential_savings(subscriptions: list[dict]) -> dict:
    high_risk = [s for s in subscriptions if s["risk_level"] == "HIGH"]
    return {
        "monthly":  round(sum(s["amount"] for s in high_risk), 2),
        "annual":   round(sum(s["annual_cost"] for s in high_risk), 2),
        "count":    len(high_risk),
    }


if __name__ == "__main__":
    from datetime import date as d

    def _make_sub(merchant: str, amount: float, months: int = 3) -> list[dict]:
        today = d(2026, 5, 8)
        return [
            {
                "merchant": merchant,
                "amount": amount,
                "type": "debit",
                "date": (today - timedelta(days=30 * i)).strftime("%Y-%m-%d"),
            }
            for i in range(months)
        ]

    sample_txns = (
        _make_sub("Netflix", 17.00)
        + _make_sub("Spotify Malaysia", 15.90)
        + _make_sub("YouTube Premium", 16.90)
        + _make_sub("Disney+ Hotstar", 22.90)
        + _make_sub("Apple Music", 17.00)
    )

    subs = detect_subscriptions(sample_txns)
    print("=== GX Rise Subscription Detector ===\n")
    total_monthly = sum(s["amount"] for s in subs)
    print(f"Total: RM{total_monthly:.2f}/bulan · RM{total_monthly*12:.2f}/tahun\n")
    for s in subs:
        idle_str = f"{s['days_idle']} hari lalu" if s["days_idle"] else "aktif"
        print(
            f"  {s['risk_emoji']} {s['merchant']:<20} RM{s['amount']:.2f}/bln"
            f"  Last used: {idle_str:<15}  Risk: {s['risk_level']} ({s['risk_score']})"
        )

    savings = get_potential_savings(subs)
    print(f"\nPotensi penjimatan jika cancel 🔴: RM{savings['monthly']:.2f}/bln = RM{savings['annual']:.2f}/tahun")
