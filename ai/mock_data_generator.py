"""
GX Rise — Mock Data Generator
Generates 90-day synthetic Malaysian transaction datasets for Azri (student) and Siti (fresh grad).
Run: python mock_data_generator.py
Output: data/azri_transactions.json, data/siti_transactions.json
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

TODAY = date(2026, 5, 8)


def days_ago(n: int) -> str:
    return (TODAY - timedelta(days=n)).strftime("%Y-%m-%d")


def days_from_now(n: int) -> str:
    return (TODAY + timedelta(days=n)).strftime("%Y-%m-%d")


FOOD_MERCHANTS = [
    ("GrabFood", 15.0, 28.0),
    ("foodpanda", 18.0, 32.0),
    ("McDonald's Nilai", 12.0, 22.0),
    ("KFC IOI City", 14.0, 24.0),
    ("Tealive SS15", 7.9, 14.9),
    ("ZUS Coffee PJ", 10.0, 16.0),
    ("Mamak Corner SS2", 8.0, 15.0),
    ("Chatime Mid Valley", 9.0, 14.0),
    ("A&W Sunway", 13.0, 21.0),
    ("Old Town White Coffee", 11.0, 18.0),
]

TRANSPORT_MERCHANTS = [
    ("Grab", 7.0, 14.0),
    ("RapidKL", 2.0, 4.5),
    ("Touch n Go Toll", 4.2, 18.6),
    ("MRT Rapid KL", 2.0, 4.0),
    ("Shell Malaysia", 30.0, 60.0),
    ("Petron Nilai", 28.0, 55.0),
]

SHOPPING_MERCHANTS = [
    ("Shopee", 20.0, 120.0),
    ("Lazada", 30.0, 150.0),
    ("Zalora", 45.0, 200.0),
    ("AEON Online", 25.0, 80.0),
]

AZRI_SUBSCRIPTIONS = [
    ("Netflix", 17.00),
    ("Spotify Malaysia", 15.90),
    ("YouTube Premium", 16.90),
    ("Disney+ Hotstar", 22.90),
    ("Apple Music", 17.00),
]

SITI_SUBSCRIPTIONS = [
    ("Netflix", 17.00),
    ("Spotify Malaysia", 15.90),
    ("Apple Music", 17.00),
]

AZRI_UTILITIES = [
    ("Celcom postpaid", 68.00),
]

SITI_UTILITIES = [
    ("Celcom postpaid", 68.00),
    ("Unifi monthly", 89.00),
]


def _txn(idx: int, merchant: str, amount: float, txn_date: str, txn_type: str, category: str) -> dict:
    return {
        "id":       f"txn_{idx:04d}",
        "date":     txn_date,
        "merchant": merchant,
        "amount":   round(amount, 2),
        "type":     txn_type,
        "category": category,
    }


def generate_azri(n_days: int = 90) -> list[dict]:
    txns = []
    idx = 1

    # Income — PTPTN monthly + part-time
    for month_start in [0, 30, 60]:
        txns.append(_txn(idx, "PTPTN SSPN Credit", 650.00, days_ago(month_start), "credit", "Income"))
        idx += 1
        txns.append(_txn(idx, "Part-time Income - Kedai Buku Fajar", 400.00, days_ago(month_start + 2), "credit", "Income"))
        idx += 1

    # Subscriptions — monthly, days 1/31/61
    for month_offset in [1, 31, 61]:
        for merchant, amount in AZRI_SUBSCRIPTIONS:
            txns.append(_txn(idx, merchant, amount, days_ago(month_offset), "debit", "Subscriptions"))
            idx += 1

    # Utilities — monthly
    for month_offset in [5, 35, 65]:
        for merchant, amount in AZRI_UTILITIES:
            txns.append(_txn(idx, merchant, amount, days_ago(month_offset), "debit", "Utilities"))
            idx += 1

    # BNPL — 3 active instalments
    bnpl_items = [
        ("Atome instalment 1/3 - Dress Shopee", 89.00,  7),
        ("Split payment Zalora - Kasut",          45.00,  12),
        ("Shopee PayLater - Aksesori",            120.00, 20),
    ]
    for merchant, amount, days_until_due in bnpl_items:
        txns.append(_txn(idx, merchant, amount, days_from_now(days_until_due), "debit", "BNPL Repayment"))
        idx += 1

    # Food — daily-ish, more in older months (worse habits early)
    food_schedule = (
        [(i, *random.choice(FOOD_MERCHANTS)) for i in range(0, 30, 1)]    # recent: almost daily
        + [(i, *random.choice(FOOD_MERCHANTS)) for i in range(30, 60, 3)] # mid: every 3 days
        + [(i, *random.choice(FOOD_MERCHANTS)) for i in range(60, 90, 3)] # oldest: every 3 days (heavier)
    )
    for day, merchant, lo, hi in food_schedule:
        # Older transactions: higher amounts (worse spending habits)
        multiplier = 1.3 if day > 60 else (1.15 if day > 30 else 1.0)
        amount = round(random.uniform(lo, hi) * multiplier, 2)
        txns.append(_txn(idx, merchant, amount, days_ago(day), "debit", "Food & Drink"))
        idx += 1

    # Transport — twice a week
    for day in range(0, 90, 4):
        merchant, lo, hi = random.choice(TRANSPORT_MERCHANTS[:4])  # public transport / grab
        txns.append(_txn(idx, merchant, round(random.uniform(lo, hi), 2), days_ago(day), "debit", "Transport"))
        idx += 1

    # Shopping — sporadic, larger in early months
    for day in [5, 14, 22, 35, 50, 68, 80]:
        merchant, lo, hi = random.choice(SHOPPING_MERCHANTS)
        multiplier = 1.4 if day > 60 else 1.0
        txns.append(_txn(idx, merchant, round(random.uniform(lo, hi) * multiplier, 2), days_ago(day), "debit", "Online Shopping"))
        idx += 1

    # Auto-saves (improving over time)
    for day, amount in [(2, 30), (15, 50), (22, 45), (32, 55), (55, 60), (75, 80)]:
        txns.append(_txn(idx, "GX Rise Auto-Save", amount, days_ago(day), "credit", "Savings Transfer"))
        idx += 1

    return sorted(txns, key=lambda t: t["date"], reverse=True)


def generate_siti(n_days: int = 90) -> list[dict]:
    txns = []
    idx = 5000

    # Salary monthly
    for month_offset in [1, 31, 61]:
        txns.append(_txn(idx, "Salary credit - AEON Retail Sdn Bhd", 2800.00, days_ago(month_offset), "credit", "Income"))
        idx += 1

    # Subscriptions
    for month_offset in [3, 33, 63]:
        for merchant, amount in SITI_SUBSCRIPTIONS:
            txns.append(_txn(idx, merchant, amount, days_ago(month_offset), "debit", "Subscriptions"))
            idx += 1

    # Utilities
    for month_offset in [6, 36, 66]:
        for merchant, amount in SITI_UTILITIES:
            txns.append(_txn(idx, merchant, amount, days_ago(month_offset), "debit", "Utilities"))
            idx += 1

    # BNPL — 1 active
    txns.append(_txn(idx, "Atome instalment 2/3 - Telefon Samsung", 120.00, days_from_now(17), "debit", "BNPL Repayment"))
    idx += 1

    # PTPTN repayment (auto-pay)
    for month_offset in [2, 32, 62]:
        txns.append(_txn(idx, "PTPTN Auto-repayment", 356.67, days_ago(month_offset), "debit", "Education"))
        idx += 1

    # Food — moderate
    for day in range(0, 90, 2):
        merchant, lo, hi = random.choice(FOOD_MERCHANTS)
        txns.append(_txn(idx, merchant, round(random.uniform(lo * 0.9, hi * 0.9), 2), days_ago(day), "debit", "Food & Drink"))
        idx += 1

    # Transport — car + grab
    for day in range(0, 90, 3):
        merchant, lo, hi = random.choice(TRANSPORT_MERCHANTS)
        txns.append(_txn(idx, merchant, round(random.uniform(lo, hi), 2), days_ago(day), "debit", "Transport"))
        idx += 1

    # Shopping — moderate
    for day in [8, 20, 45, 60, 78]:
        merchant, lo, hi = random.choice(SHOPPING_MERCHANTS)
        txns.append(_txn(idx, merchant, round(random.uniform(lo, hi * 0.8), 2), days_ago(day), "debit", "Online Shopping"))
        idx += 1

    # Auto-saves
    for day, amount in [(3, 200), (10, 150), (33, 250), (63, 300)]:
        txns.append(_txn(idx, "GX Rise Auto-Save", amount, days_ago(day), "credit", "Savings Transfer"))
        idx += 1

    return sorted(txns, key=lambda t: t["date"], reverse=True)


def save_json(data: list[dict], filename: str) -> None:
    Path("data").mkdir(exist_ok=True)
    path = Path("data") / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved {len(data)} transactions → {path}")


if __name__ == "__main__":
    random.seed(42)
    print("=== GX Rise Mock Data Generator ===\n")
    azri = generate_azri()
    siti = generate_siti()
    save_json(azri, "azri_transactions.json")
    save_json(siti, "siti_transactions.json")

    azri_debit = sum(t["amount"] for t in azri if t["type"] == "debit")
    siti_debit = sum(t["amount"] for t in siti if t["type"] == "debit")
    print(f"\nAzri:  {len(azri)} transactions | Total spend: RM{azri_debit:.2f}")
    print(f"Siti:  {len(siti)} transactions | Total spend: RM{siti_debit:.2f}")
    print("\nDone.")
