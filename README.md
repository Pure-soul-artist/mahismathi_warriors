# ✈️ Automated Inventory Replenishment Agent
### Mahismathi Warriors — Hackathon Project · Airport/Lounge #49

> **"The only inventory agent that thinks like an airport — predicting demand spikes before peak flights and restocking automatically, so lounges never run dry when it matters most."**

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [USP](#usp)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [How It Works](#how-it-works)
- [Peak Hour Intelligence](#peak-hour-intelligence)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Demo Flow](#demo-flow)
- [Team](#team)

---

## 🚨 Problem Statement

Airport lounges serve hundreds of passengers per hour during peak flight times. Current inventory management is entirely manual — staff check shelves infrequently, orders are placed **after** stock runs out, and there is no awareness of peak flight schedules.

**The result:** Empty shelves, revenue loss, and unhappy passengers at the worst possible moment.

### Pain Points
- 👁️ **No Real-Time Visibility** — Staff manually check shelves every few hours, far too slow during peak travel windows
- ⏰ **Reactive, Not Proactive** — Orders placed after stockouts, by which time passenger experience is already damaged
- 📊 **No Demand Intelligence** — Systems don't account for peak flight schedules when deciding reorder thresholds

---

## 💡 Solution Overview

An AI-powered agent built with **Python + FastAPI + SQLite** that continuously monitors airport lounge inventory and automatically triggers restock orders before stock runs out — with special intelligence during peak flight hours.

### Solution Approach

- **Continuous Monitoring** → Agent scans all inventory items every 60 seconds automatically without any human involvement
- **Peak Hour Intelligence** → During high-traffic flight windows (6–9 AM, 11 AM–2 PM, 5–9 PM), reorder thresholds are raised **1.5×** to order earlier before demand hits
- **Smart Stock Classification** → Every item is instantly classified as **OK**, **Low**, or **Critical** based on real-time stock levels
- **Duplicate Prevention** → System checks for existing pending orders before creating a new one — no order spam to warehouse
- **Auto Order Generation** → Restock quantity calculated automatically as `max_capacity − current_stock` and saved to database
- **Instant Warehouse Notification** → Email alert sent immediately with item name, quantity, and **URGENT** tag during peak hours
- **WhatsApp Alerts** → Lounge managers automatically receive a Twilio WhatsApp message when stock drops Low or Critical
- **WhatsApp Chatbot** → Lounge managers can chat directly with the agent via WhatsApp — ask stock status, trigger manual reorders, and receive peak hour notifications without opening the dashboard
- **Live Dashboard** → Staff see real-time stock badges, alert ticker, and full order history refreshing every 30 seconds
- **Manual Override** → Staff can trigger orders, edit stock, or mark orders as fulfilled anytime

---

## 🏆 USP

> **"The only inventory agent that thinks like an airport — predicting demand spikes before peak flights and restocking automatically, so lounges never run dry when it matters most."**

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🤖 Auto-Reorder Agent | Scheduler runs every 60s, scanning all items and triggering orders automatically |
| ⏰ Peak Hour Intelligence | Thresholds scale 1.5× during peak flight windows |
| 📧 Email Alerts | Async Gmail SMTP alerts to warehouse with urgency tagging |
| 📱 WhatsApp Alerts | Twilio WhatsApp messages to lounge managers instantly |
| 🤖 WhatsApp Chatbot | Managers can query and control inventory via WhatsApp chat |
| 📊 Live Dashboard | Real-time stock charts, alert tickers, status badges — refresh every 30s |
| 👤 Manual Override | Staff can trigger, edit, and fulfill orders manually |
| 🔴 Critical Detection | Items below 50% threshold flagged as CRITICAL with urgent notifications |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python 3.10+ | Core language |
| FastAPI | REST API framework |
| aiosqlite | Async SQLite database |
| APScheduler | Background job scheduler |
| aiosmtplib | Async email via Gmail SMTP |
| Twilio | WhatsApp alerts + chatbot |
| python-dotenv | Environment variable management |
| uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool + dev server |
| TailwindCSS | Utility-first styling |

---

## 📁 Project Structure

```
mahismathi_warriors/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # DB init, connection, schema
│   ├── config.py                # Environment config
│   ├── scheduler.py             # APScheduler background job
│   ├── seed.py                  # Seed demo data
│   ├── requirements.txt         # Python dependencies
│   ├── routes/
│   │   ├── inventory.py         # /inventory endpoints
│   │   └── orders.py            # /orders endpoints
│   └── services/
│       ├── inventory_service.py # Core monitoring logic
│       ├── order_service.py     # Order creation logic
│       ├── email_service.py     # Gmail SMTP email
│       └── peak_hours.py        # Peak hour detection + threshold scaling
├── frontend/
│   ├── src/                     # React components
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example                 # Environment variable template
└── .gitignore
```

---

## 🗄️ Database Schema

### `inventory_items`

| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| name | TEXT | NOT NULL | Item name (e.g. Johnnie Walker Black) |
| category | TEXT | NOT NULL | liquor / beverage / food |
| current_stock | INTEGER | NOT NULL | Current quantity in lounge |
| base_threshold | INTEGER | NOT NULL | Minimum stock level before reorder |
| max_capacity | INTEGER | NOT NULL | Maximum storage capacity |
| unit | TEXT | NOT NULL | bottles / cartons / units |
| status | TEXT | DEFAULT 'ok' | ok / low / critical |
| last_updated | TIMESTAMP | DEFAULT NOW | Last stock update time |

### `restock_orders`

| Column | Type | Constraint | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| item_id | INTEGER | FK → inventory_items | Linked inventory item |
| item_name | TEXT | NOT NULL | Item name (denormalized) |
| quantity_ordered | INTEGER | NOT NULL | max_capacity − current_stock |
| triggered_by | TEXT | DEFAULT 'auto' | auto / manual |
| is_peak_hour | INTEGER | DEFAULT 0 | 0 = No, 1 = Yes |
| email_sent | INTEGER | DEFAULT 0 | 0 = No, 1 = Yes |
| status | TEXT | DEFAULT 'pending' | pending / fulfilled |
| triggered_at | TIMESTAMP | DEFAULT NOW | Order creation time |

### Relationship
```
inventory_items.id  ──(ONE TO MANY)──  restock_orders.item_id
```
One item can have many restock orders over time.

---

## ⚙️ How It Works

```
App Boots (main.py)
       ↓
Database Initialized (inventory_items + restock_orders tables created)
       ↓
Scheduler Starts (every 60 seconds)
       ↓
Check Peak Hour? → YES: threshold × 1.5  |  NO: base threshold
       ↓
Compare current_stock vs effective_threshold for each item
       ↓
Classify: OK / LOW / CRITICAL
       ↓
Pending order already exists? → YES: skip  |  NO: create order
       ↓
Calculate quantity = max_capacity − current_stock
       ↓
Send Email + WhatsApp alert to warehouse & manager
       ↓
Dashboard updates in real time ✅
```

---

## ⏰ Peak Hour Intelligence

The most innovative feature of this agent — dynamic threshold scaling based on flight schedules.

```python
PEAK_WINDOWS = [
    (6, 9),    # Morning rush — early flights
    (11, 14),  # Midday peak
    (17, 21),  # Evening — most flights depart
]

def get_effective_threshold(base_threshold: int) -> int:
    return int(base_threshold * 1.5) if is_peak_hour() else base_threshold
```

| Time | Mode | Threshold | Priority |
|---|---|---|---|
| Normal hours | Base | 20 units | Normal |
| Peak hours | 1.5× scaled | 30 units | URGENT |

This means the agent **reorders earlier** during peak windows — ensuring stock arrives before the rush, not during it.

---

## 🔌 API Endpoints

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/inventory/` | Get all inventory items |
| POST | `/inventory/` | Add new item |
| PUT | `/inventory/{id}` | Update stock level |
| DELETE | `/inventory/{id}` | Remove item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders/` | Get all restock orders |
| POST | `/orders/manual/{item_id}` | Manually trigger restock order |
| PUT | `/orders/{order_id}/fulfill` | Mark order as fulfilled |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | App health + peak hour status |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gmail account (for email alerts)
- Twilio account (for WhatsApp alerts)

### 1. Clone the Repository
```bash
git clone https://github.com/Pure-soul-artist/mahismathi_warriors.git
cd mahismathi_warriors
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Email (Gmail SMTP)
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
WAREHOUSE_EMAIL=warehouse@example.com

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MANAGER_WHATSAPP_TO=whatsapp:+91XXXXXXXXXX
```

> ⚠️ Never commit your `.env` file — it's already in `.gitignore`

---

## ▶️ Running the Project

### Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Seed Demo Data
```bash
cd backend
python seed.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Access
- **Frontend Dashboard** → `http://localhost:5173`
- **Backend API** → `http://localhost:8000`
- **API Docs (Swagger)** → `http://localhost:8000/docs`

---

## 🎬 Demo Flow

1. **Open Dashboard** — View live stock levels, peak hours banner, alert ticker
2. **Browse Inventory** — 15 items with color-coded status badges (OK / LOW / CRITICAL)
3. **Lower Stock Manually** — Reduce stock below threshold, watch badge change instantly
4. **Auto-Order Fires** — Wait 60 seconds — scheduler detects change and auto-creates restock order
5. **WhatsApp Alert** — Manager receives Twilio WhatsApp message with URGENT tag
6. **Manual Order** — Click Order on any item for instant restock
7. **Fulfill Order** — Click Fulfill on pending order — status changes to FULFILLED

---

## 👥 Team

**Mahismathi Warriors**
- Hackathon Project — Airport/Lounge #49
- Date: 27 Feb 2026 - 28 Feb 2026

---

*Built with ❤️ by Mahismathi Warriors · ✈️ Never let the lounge run dry*
