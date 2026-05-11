"""
GX Rise — Notification Parser
Parses financial push notifications from GXBank, Maybank, Atome, Shopee PayLater, TnG.
All parsing is on-device; no raw notification text is sent to server.
"""

import re
from typing import Optional
from spending_classifier import classify_transaction

PATTERNS: dict[str, str] = {
    "gxbank":  r"(?:Debit|Credit)\s+RM([\d,]+\.?\d*)\s+at\s+(.+?)\.",
    "maybank": r"RM([\d,]+\.?\d*)\s+(?:debited|credited)\s+(?:from|to).+?at\s+(.+)",
    "atome":   r"Payment\s+of\s+RM([\d,]+\.?\d*)\s+to\s+(.+?)\s+successful",
    "shopee":  r"PayLater\s+installment.*?RM([\d,]+\.?\d*)",
    "tng":     r"RM([\d,]+\.?\d*)\s+paid\s+to\s+(.+?)(?:\s|\.)",
    "netflix": r"Your\s+Netflix\s+payment\s+of\s+RM([\d.]+)",
    "spotify": r"Spotify\s+Premium.*?RM([\d.]+)",
}

PTPTN_SIGNALS   = ["ptptn", "sspn", "perbadanan tabung"]
SALARY_KEYWORDS = ["salary", "gaji", "payroll", "credit from employer"]


def parse_notification(text: str, source: str) -> Optional[dict]:
    """
    Parses a financial notification string.
    Returns transaction dict or None if not parseable.
    """
    source = source.lower().strip()
    pattern = PATTERNS.get(source)
    if not pattern:
        return None

    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return None

    amount_str = match.group(1).replace(",", "")
    amount = float(amount_str)
    merchant = match.group(2).strip() if match.lastindex and match.lastindex >= 2 else source.capitalize()

    txn_type = _infer_type(text, source)
    category = classify_transaction(merchant, amount if txn_type == "debit" else None)

    return {
        "merchant":  merchant,
        "amount":    amount,
        "type":      txn_type,
        "category":  category,
        "source":    source,
        "raw_text":  text,
        "is_ptptn":  is_ptptn_credit(text),
        "is_salary": is_salary_credit(text),
    }


def _infer_type(text: str, source: str) -> str:
    lower = text.lower()
    if source in ("atome", "shopee"):
        return "debit"
    if any(w in lower for w in ("credit", "received", "masuk", "deposit")):
        return "credit"
    return "debit"


def is_ptptn_credit(text: str) -> bool:
    lower = text.lower()
    return any(sig in lower for sig in PTPTN_SIGNALS)


def is_salary_credit(text: str, amount: Optional[float] = None, income: Optional[float] = None) -> bool:
    lower = text.lower()
    keyword_match = any(kw in lower for kw in SALARY_KEYWORDS)
    if income and amount:
        within_5pct = abs(amount - income) / income < 0.05
        return keyword_match or within_5pct
    return keyword_match


def get_connected_accounts() -> list[dict]:
    """Returns mock connected accounts status."""
    return [
        {"name": "GXBank",          "status": "active",    "emoji": "✅", "txn_count": 23, "source": "gxbank"},
        {"name": "Atome",           "status": "active",    "emoji": "✅", "txn_count": 3,  "source": "atome"},
        {"name": "Shopee PayLater", "status": "active",    "emoji": "✅", "txn_count": 1,  "source": "shopee"},
        {"name": "Maybank",         "status": "detected",  "emoji": "🔗", "txn_count": 0,  "source": "maybank"},
        {"name": "Touch 'n Go",     "status": "pending",   "emoji": "⬜", "txn_count": 0,  "source": "tng"},
    ]


def get_demo_notifications() -> list[dict]:
    return [
        {"text": "Debit RM18.50 at GrabFood #ORD98765.", "source": "gxbank"},
        {"text": "Payment of RM89.00 to Zalora successful", "source": "atome"},
        {"text": "Your Netflix payment of RM17.00", "source": "netflix"},
        {"text": "Credit RM650.00 at PTPTN SSPN.", "source": "gxbank"},
        {"text": "RM12.40 paid to Touch n Go Toll.", "source": "tng"},
    ]


if __name__ == "__main__":
    print("=== GX Rise Notification Parser ===\n")
    for notif in get_demo_notifications():
        result = parse_notification(notif["text"], notif["source"])
        if result:
            flag = "🎓 PTPTN" if result["is_ptptn"] else ""
            print(f"  [{result['source']:8}] RM{result['amount']:.2f} {result['type']:6} → {result['merchant']:<25} [{result['category']}] {flag}")
        else:
            print(f"  [{notif['source']:8}] Could not parse: {notif['text'][:50]}")
