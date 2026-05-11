git# GX Rise — AI Financial Resilience for Malaysian Youth

> Built for **UTMxHackathon'26** | Case Study 2: Youth Financial Resilience Challenge

**GX Rise** is an AI-powered financial coaching module for GXBank, designed to break the debt cycle among Malaysian university students and fresh graduates through intelligent nudges, automated savings, and behavioural accountability.

---

## 🎯 One-Line Pitch

*"GXBank already has your money. GX Rise makes it work for you."*

---

## 📊 The Problem

- **400,000** PTPTN borrowers have never repaid (RM5B default)
- **877** youth declared bankrupt in 2024 (+21% YoY)
- **40%** of Malaysia's RM9.3B BNPL spending is from youth
- **70%** of Malaysians save <RM500/month
- **GXBank has 1M+ users** but no AI coaching layer

---

## 💡 The Solution: 8 Core Features

### 1️⃣ **AI Financial Health Score**
Personalised 0–100 score across 4 dimensions:
- Savings Rate
- Spending Control
- Debt Risk
- Emergency Buffer

### 2️⃣ **Smart Nudge Engine**
Context-aware notifications triggered by real spending patterns:
- GrabFood overspend → save suggestion
- PTPTN disbursement → auto-save offer
- BNPL accumulation → debt warning

### 3️⃣ **Automated Savings Triggers**
Remove willpower from saving:
- Round-up saves on every transaction
- PTPTN disbursement auto-lock
- Salary sweep to savings pocket
- Category budget overflow auto-save

### 4️⃣ **PTPTN Repayment Tracker**
Dedicated tracker for student loan repayment:
- Disbursement calendar
- Interest calculator
- Repayment schedule planner
- Default risk alerts

### 5️⃣ **BNPL Debt Aggregation**
Unified view of all hidden instalments:
- Atome, Split, Shopee PayLater, Lazada
- Total committed debt vs. free cash
- Payment due dates
- Pause recommendations

### 6️⃣ **Weekly AI Digest (Claude Haiku)**
Personalised financial summary in **Bahasa Malaysia**:
- Weekly spending review
- Savings progress
- Actionable recommendations
- Natural language insights

### 7️⃣ **Pocket with Kawan + Auto Bill Split**
Social savings layer:
- Create shared savings goals with friends
- Transparent progress (amounts hidden, streaks visible)
- Group bill splitting with OCR receipt parsing
- Savings accountability streaks

### 8️⃣ **Smart Subscription Tracker**
Subscription management:
- Auto-detect recurring charges
- Categorise by usage (active/unused/forgotten)
- Cancel guidance per platform
- Annual cost aggregation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GX RISE MOBILE APP                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  AI Engine   │  │    Nudge     │  │  Auto-Save    │  │
│  │              │  │   & Gamify   │  │   Engine      │  │
│  │ • Classifier │  │              │  │               │  │
│  │ • Scorer     │  │ • Streaks    │  │ • Round-up    │  │
│  │ • Detector   │  │ • Badges     │  │ • Triggers    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────▼─────────────────▼───────────────────▼───────┐  │
│  │           Transaction Data Processing               │  │
│  │  • Classification (Food, Transport, BNPL, etc.)    │  │
│  │  • Pattern detection (subscriptions, seasonal)      │  │
│  │  • Multi-bank aggregation (SMS-based parsing)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Backend API (FastAPI/Node)            │  │
│  │  • User profiles • Transactions • Goals • Nudges │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         GXBank API + Grab Ecosystem              │  │
│  │    Savings Pockets • Transactions • Rewards      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native / Expo (cross-platform iOS/Android) |
| **Backend** | FastAPI (Python) with async processing |
| **Database** | Firebase Firestore (real-time sync + offline) |
| **AI Engine** | MiniLM (ONNX) for on-device spending classification |
| **LLM Integration** | Claude Haiku 4.5 for digest generation |
| **Analytics** | Firebase Analytics for behaviour tracking |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Data Aggregation** | Notification parsing + Open Finance (BNM framework) |

---

## 📁 Project Structure

```
gxrise-app/
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HealthScore.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Nudges.tsx
│   │   │   ├── Savings.tsx
│   │   │   ├── BNPL.tsx
│   │   │   ├── PTPTN.tsx
│   │   │   ├── Subscriptions.tsx
│   │   │   ├── PocketKawan.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── HealthScoreCard.tsx
│   │   │   ├── NudgeCard.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── GoalProgress.tsx
│   │   │   └── Charts.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── firebase.ts
│   │   │   └── notifications.ts
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── services/
│   │   │   ├── health_score.py
│   │   │   ├── nudge_engine.py
│   │   │   ├── transaction_classifier.py
│   │   │   └── subscription_detector.py
│   │   ├── routes/
│   │   │   ├── users.py
│   │   │   ├── transactions.py
│   │   │   ├── health.py
│   │   │   ├── nudges.py
│   │   │   └── digest.py
│   │   └── middleware/
│   │       └── auth.py
│   └── requirements.txt
│
├── ai-engine/
│   ├── spending_classifier.py
│   ├── health_scorer.py
│   ├── nudge_selector.py
│   ├── subscription_detector.py
│   ├── ptptn_calculator.py
│   └── bnpl_aggregator.py
│
├── mock-data/
│   ├── generate_transactions.py
│   ├── merchant_database.py
│   ├── bnpl_fixtures.py
│   └── user_profiles.py
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_SPEC.md
│   ├── UI_DESIGN.md
│   ├── BEHAVIOURAL_ECONOMICS.md
│   └── DEPLOYMENT.md
│
└── README.md
```

---

## 🚀 Quick Start (Development)

### Prerequisites
```bash
Node.js 18+
Python 3.9+
Firebase account
Anthropic API key (for Claude Haiku)
```

### Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Setup Frontend
```bash
cd frontend
npm install
npx expo start
```

### Generate Mock Data
```bash
cd mock-data
python generate_transactions.py
```

---

## 📊 Key Metrics (Success Criteria)

| Metric | Target |
|---|---|
| **Video Quality** | 5:00 exactly, smooth product demo |
| **Feature Completeness** | All 8 features implemented (at least demo-grade) |
| **AI Quality** | Real spending classification, visible nudges |
| **Design Polish** | GXBank brand alignment, no placeholder text |
| **Rubric Score** | 95+ / 100 |

---

## 📹 Video Demonstration Outline (5 minutes)

```
0:00–0:30  → Hook: "400K PTPTN borrowers, RM5B default"
0:30–1:00  → Problem: Passive banking, BNPL trap, subscription drain
1:00–1:30  → Solution intro: GX Rise
1:30–3:30  → Live demo:
            • Onboarding + Health Score
            • GrabFood nudge in action
            • BNPL dashboard
            • PTPTN tracker
            • Weekly digest
3:30–4:00  → Market + Architecture
4:00–5:00  → Call to action + Closing
```

---

## 🎨 Design System

**GXBank Brand Alignment:**
- **Primary:** Navy Blue (#1a2b4d)
- **Secondary:** Teal (#00a8a8)
- **Accent:** Bright Cyan (#00d9ff)
- **Typography:** Clean sans-serif (SF Pro, Segoe UI)
- **Tone:** Friendly, non-judgmental, conversational

---

## 📋 Submission Checklist

- [ ] All 8 features have a working screen (not necessarily fully polished)
- [ ] Health score calculated and displayed
- [ ] At least 1 smart nudge triggered on demo transaction
- [ ] Mock transaction data loaded and categorised
- [ ] API endpoints working (tested with Postman)
- [ ] Firebase integration complete
- [ ] Video recorded, edited, uploaded (unlisted on YouTube)
- [ ] GitHub repo is public and has complete README
- [ ] Both links (GitHub + YouTube) submitted via Koo'Q before 11 May, 10:00 PM

---

## 🔗 Links

- **GitHub:** [gxrise-app](https://github.com/yourusername/gxrise-app)
- **YouTube Demo:** [5-minute walkthrough](https://youtube.com/watch?v=your-video-id)
- **Submission:** Koo'Q Platform

---

## 📖 References & Research

- [UTMxHackathon'26 Case Study](https://utm.edu.my/hackathon)
- [GXBank Official](https://gxbank.my/)
- [PTPTN Statistics — The Rakyat Post, Jun 2025](https://www.therakyatpost.com/)
- [BNPL Market Malaysia — The Vibes, 2025](https://www.thevibes.com/)
- [Behavioural Economics in Finance — Kahneman & Tversky](https://en.wikipedia.org/wiki/Behavioural_economics)

---

## 👥 Team

**GX Rise Development Team**  
UTMxHackathon'26 Preliminary Round Submission

---

**Built with ❤️ for Malaysian Youth**  
*Rise above the debt cycle.*
