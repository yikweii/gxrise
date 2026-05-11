# gxrise

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
uvicorn main:app --reload
```

### Setup Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npx expo start --web (* For web)
npx expo start --clear (*For mobile)
```

### Generate Mock Data
```bash
cd mock-data
python generate_transactions.py
```

---





