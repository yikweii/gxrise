"""
GX Rise — Spending Classifier
Rule-based transaction classifier for 10 Malaysian spending categories.
Runs on mock data for the prototype; export to ONNX for on-device production.
"""

from typing import Optional

CATEGORIES = [
    "Food & Drink",
    "Transport",
    "BNPL Repayment",
    "Online Shopping",
    "Subscriptions",
    "Entertainment",
    "Utilities",
    "Education",
    "Savings Transfer",
    "Cash/ATM",
]

MERCHANT_RULES: dict[str, list[str]] = {
    "Food & Drink": [
        "grabfood", "foodpanda", "mcdonald", "kfc", "tealive", "zus coffee",
        "chatime", "mamak", "old town", "subway", "secret recipe", "marrybrown",
        "jollibee", "a&w", "pizza hut", "domino", "starbucks", "coffee bean",
        "kenny rogers", "nando", "sushi king", "sushi tei", "sakae",
    ],
    "Transport": [
        "grab ride", "rapidkl", "touch n go toll", "mrt rapid kl", "lrt",
        "petron", "shell malaysia", "bhp petrol", "petronas dagangan",
        "bas rapidkl", "ktm", "ets", "aerobus", "airport limo",
    ],
    "BNPL Repayment": [
        "atome", "split", "shopee paylater", "grab paylater", "rely",
        "hoolah", "pace", "fave pay later",
    ],
    "Online Shopping": [
        "shopee", "lazada", "zalora", "aeon online", "pg mall", "hermo",
        "watsons online", "guardian online", "senq online", "parkson online",
        "mydin online", "padini",
    ],
    "Subscriptions": [
        "netflix", "spotify", "youtube premium", "disney+", "disney plus",
        "apple music", "astro", "iflix", "viu", "unifi tv",
    ],
    "Entertainment": [
        "gsc", "tgv", "mbo cinema", "lotus", "steam", "playstation",
        "xbox", "nintendo", "google play", "apple app store", "arcade",
    ],
    "Utilities": [
        "tnb e-bill", "air selangor", "celcom postpaid", "celcom prepaid",
        "maxis", "digi", "unifi monthly", "tm broadband", "yes 4g",
        "syarikat air", "indah water",
    ],
    "Education": [
        "textbook", "course fee", "stationery", "bookstore", "popular book",
        "mph bookstore", "udemy", "coursera", "exam fee", "kolej",
    ],
    "Savings Transfer": [
        "auto-save", "savings transfer", "gx rise auto", "tabung",
        "ptptn sspn credit", "kwsp", "epf", "asnb",
    ],
    "Cash/ATM": [
        "atm withdrawal", "cash withdrawal", "tunai",
    ],
}

# Grab is ambiguous — check context
_GRAB_FOOD_SIGNALS = ["grabfood", "grab food", "ord", "delivery"]
_GRAB_RIDE_SIGNALS = ["grab ride", "grab car", "grabrental", "grabshare"]


def classify_transaction(merchant: str, amount: Optional[float] = None) -> str:
    """
    Classify a transaction by merchant name.
    Returns one of the 10 CATEGORIES strings.
    """
    lower = merchant.lower().strip()

    # Disambiguate "Grab" specifically
    if lower.startswith("grab"):
        if any(sig in lower for sig in _GRAB_FOOD_SIGNALS):
            return "Food & Drink"
        if any(sig in lower for sig in _GRAB_RIDE_SIGNALS):
            return "Transport"
        # Plain "Grab" with small amount → likely ride
        if amount and amount < 5:
            return "Transport"
        if amount and amount > 30:
            return "Food & Drink"
        return "Transport"  # default Grab = ride

    for category, keywords in MERCHANT_RULES.items():
        if any(kw in lower for kw in keywords):
            return category

    # Amount-based heuristics for unknown merchants
    if amount:
        if amount < 5:
            return "Transport"        # bus, toll
        if 14 <= amount <= 25:
            return "Subscriptions"    # typical sub amounts

    return "Food & Drink"  # safe default for unknowns in student context


def batch_classify(transactions: list[dict]) -> list[dict]:
    """Add 'category' field to each transaction dict in-place."""
    for txn in transactions:
        if "category" not in txn or txn["category"] in ("", "Other", None):
            txn["category"] = classify_transaction(
                txn.get("merchant", ""),
                abs(txn.get("amount", 0)) if txn.get("type") == "debit" else None,
            )
    return transactions


def get_category_stats(transactions: list[dict]) -> dict:
    """
    Returns spending breakdown by category.
    Only counts debit transactions.
    Returns: {category: {total, count, avg, pct_of_total}}
    """
    totals: dict[str, float] = {}
    counts: dict[str, int] = {}

    for txn in transactions:
        if txn.get("type") != "debit":
            continue
        cat = txn.get("category", classify_transaction(txn.get("merchant", "")))
        amt = abs(txn.get("amount", 0))
        totals[cat] = totals.get(cat, 0) + amt
        counts[cat] = counts.get(cat, 0) + 1

    grand_total = sum(totals.values()) or 1
    return {
        cat: {
            "total": round(total, 2),
            "count": counts[cat],
            "avg": round(total / counts[cat], 2),
            "pct_of_total": round(total / grand_total * 100, 1),
        }
        for cat, total in sorted(totals.items(), key=lambda x: -x[1])
    }


if __name__ == "__main__":
    tests = [
        ("GrabFood #ORD12345", 18.50),
        ("Netflix", 17.00),
        ("Atome instalment 1/3", 89.00),
        ("Shell Malaysia", 45.00),
        ("Shopee", 67.00),
        ("RapidKL", 3.20),
        ("Unifi monthly", 89.00),
        ("PTPTN SSPN Credit", None),
        ("ZUS Coffee PJ", 14.00),
        ("Touch n Go Toll", 6.20),
    ]
    print("=== GX Rise Spending Classifier ===\n")
    for merchant, amount in tests:
        cat = classify_transaction(merchant, amount)
        print(f"  {merchant:<35} → {cat}")
