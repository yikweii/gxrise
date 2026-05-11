"""
GX Rise — Nudge Engine
Context-aware financial nudge selector. Max 2 nudges/day — respects attention budget.
All text in Bahasa Malaysia with template variable substitution.
"""

from typing import Optional
from datetime import datetime

NUDGE_LIBRARY: dict[str, dict] = {
    "ptptn_disbursed": {
        "title": "PTPTN masuk! 🎉",
        "body": "RM{amount} baru credit. Students yang simpan 20% hari ni 3× lebih likely habis semester tanpa hutang. Save RM{save20pct}?",
        "actions": ["Lock RM{save20pct}", "Decide later"],
        "priority": 1,
    },
    "salary_credit": {
        "title": "Gaji masuk!",
        "body": "Auto-save 15% sebelum mula berbelanja? Tu RM{save15pct} — selesai dalam 10 saat.",
        "actions": ["Lock RM{save15pct}", "Skip"],
        "priority": 2,
    },
    "bnpl_due": {
        "title": "Bayaran BNPL dalam 3 hari ⚠️",
        "body": "RM{amount} Atome due {date}. Ketepikan sekarang supaya tak terkejut?",
        "actions": ["Ketepikan RM{amount}", "OK, faham"],
        "priority": 3,
    },
    "subscription_idle": {
        "title": "Subscription yang mungkin terlupa 📱",
        "body": "{name} — RM{amount}/bulan. Kamu tak guna dah {days} hari. Cancel dan jimat RM{annual}/tahun?",
        "actions": ["Tunjuk cara cancel", "Saya masih guna", "Remind later"],
        "priority": 4,
    },
    "food_overspend": {
        "title": "Makanan penghantaran tinggi minggu ni 🍔",
        "body": "Kamu dah spent RM{amount} pada GrabFood minggu ni — {pct}% of budget. Save RM{save} sekarang?",
        "actions": ["Save RM{save}", "Nanti lah"],
        "priority": 5,
    },
    "streak_day6": {
        "title": "Streak kamu hampir 7 hari! 🔥",
        "body": "Simpan apa-apa jumlah hari ni untuk kekalkan streak dan dapat bonus RM5.",
        "actions": ["Save RM5", "Save RM10", "Skip"],
        "priority": 6,
    },
    "weekend_pattern": {
        "title": "Pattern Jumaat malam detected 🍔",
        "body": "Kamu selalu spent RM{usual} malam Jumaat. Simpan RM{save} dulu sebelum mula?",
        "actions": ["Save RM{save}", "Maybe"],
        "priority": 7,
    },
}


class NudgeEngine:
    MAX_DAILY = 2

    def __init__(self, user_state: dict):
        self.state = user_state
        self.nudges_today = user_state.get("nudges_today", 0)

    def select_nudge(self) -> Optional[dict]:
        """Returns highest-priority applicable nudge, or None if daily limit reached."""
        if self.nudges_today >= self.MAX_DAILY:
            return None

        priority_checks = [
            ("ptptn_disbursed",   self.state.get("ptptn_credited_today", False)),
            ("salary_credit",     self.state.get("salary_credited_today", False)),
            ("bnpl_due",          (self.state.get("bnpl_due_72h", 0) or 0) > 0),
            ("subscription_idle", self.state.get("idle_subscription_found", False)),
            ("food_overspend",    self._food_overspent()),
            ("streak_day6",       self.state.get("streak", 0) == 6),
            ("weekend_pattern",   self.state.get("is_friday_evening", False)),
        ]

        for nudge_type, condition in priority_checks:
            if condition:
                return self.format_nudge(nudge_type)

        return None

    def _food_overspent(self) -> bool:
        food_7d = self.state.get("food_7d", 0) or 0
        budget  = self.state.get("food_budget", 80) or 80
        return food_7d > budget * 0.8

    def format_nudge(self, nudge_type: str) -> dict:
        """Returns nudge dict with all template vars filled."""
        template = dict(NUDGE_LIBRARY[nudge_type])
        s = self.state

        if nudge_type == "ptptn_disbursed":
            amt = s.get("ptptn_amount", 650)
            save = round(amt * 0.20)
            template["body"] = template["body"].format(amount=f"{amt:.0f}", save20pct=f"{save:.0f}")
            template["actions"] = [a.format(save20pct=f"{save:.0f}") for a in template["actions"]]

        elif nudge_type == "salary_credit":
            income = s.get("income", 2800)
            save = round(income * 0.15)
            template["body"] = template["body"].format(save15pct=f"{save:.0f}")
            template["actions"] = [a.format(save15pct=f"{save:.0f}") for a in template["actions"]]

        elif nudge_type == "bnpl_due":
            amt  = s.get("bnpl_due_72h", 89)
            date = s.get("bnpl_due_date", "15 Mei 2026")
            template["body"] = template["body"].format(amount=f"{amt:.0f}", date=date)
            template["actions"] = [a.format(amount=f"{amt:.0f}") for a in template["actions"]]

        elif nudge_type == "subscription_idle":
            name   = s.get("idle_subscription_name", "Netflix")
            amount = s.get("idle_subscription_amount", 17.0)
            days   = s.get("idle_subscription_days", 47)
            annual = round(amount * 12)
            template["body"] = template["body"].format(
                name=name, amount=f"{amount:.2f}", days=days, annual=annual
            )

        elif nudge_type == "food_overspend":
            food = s.get("food_7d", 87.5)
            budget = s.get("food_budget", 80)
            pct  = round(food / budget * 100)
            save = round(food - budget * 0.6)
            template["body"] = template["body"].format(amount=f"{food:.0f}", pct=pct, save=save)
            template["actions"] = [a.format(save=save) for a in template["actions"]]

        elif nudge_type == "weekend_pattern":
            usual = s.get("friday_usual_spend", 42)
            save  = round(usual * 0.4)
            template["body"] = template["body"].format(usual=usual, save=save)
            template["actions"] = [a.format(save=save) for a in template["actions"]]

        template["type"] = nudge_type
        return template


def get_demo_nudge() -> dict:
    """Returns a pre-filled food_overspend nudge for demo purposes."""
    engine = NudgeEngine({
        "food_7d": 87.50,
        "food_budget": 80.0,
        "nudges_today": 0,
        "bnpl_due_72h": 0,
        "idle_subscription_found": False,
        "ptptn_credited_today": False,
        "salary_credited_today": False,
        "streak": 5,
        "is_friday_evening": False,
    })
    return engine.select_nudge()


if __name__ == "__main__":
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
        "streak": 6,
        "is_friday_evening": False,
        "nudges_today": 0,
    }
    engine = NudgeEngine(user_state)
    nudge = engine.select_nudge()
    if nudge:
        print(f"Nudge: {nudge['title']}")
        print(f"Body:  {nudge['body']}")
        print(f"Actions: {nudge['actions']}")
