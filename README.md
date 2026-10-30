# BitDev IMS 13 - Complete Web ERP & Installment Management System

A high-performance, full-stack web edition of **BitDev IMS 13 Enterprise ERP**, providing specialized mobile phone wholesale, retail, and installment workflows. It features an **11-panel Analytical KPI Dashboard**, an **automated Equated Monthly Installment (EMI) engine**, **smart Urdu WhatsApp recovery reminders**, **lump-sum cascading installment vouchers**, **IMEI lifecycle tracking**, and a **4-level double-entry financial accounting system**.

---

## 🌟 Key Features

### 1. 11-Card Analytical KPI Dashboard (`F12`)
- **Today's Sales vs. Yesterday**: Real-time sales growth rate and units sold.
- **Cash & EMI Recovery (%)**: Daily and Month-to-Date recovery velocity.
- **Total Receivables & Red Risk Warning**: Flags potential liquidity risks when credit growth outpaces collections.
- **Receivables Aging**: 14–29 days and 30+ days overdue analysis with inactive payer flags.
- **Active Installment Dues Tracker**: Monitors due dates, overdue counts, and recovery percentages.
- **Liquid Cash & Multi-Bank Balances**: Real-time balances for Cash in Hand, Meezan Bank, HBL, and JazzCash Merchant accounts.
- **Inventory Velocity & Dead Stock Alerts**: Automatic warnings for fast-moving models (< 7 days) and idle dead stock (> 60 days).
- **Universal Google-Style Search**: Instant lookup across 15-digit IMEIs, customer CNICs, mobile numbers, and contracts.

### 2. BitDev IMS 13 Installment Engine (`F2`)
- **Transaction Mode Switcher**: Toggle between `[Regular Cash/Credit Sale]` and `[BitDev IMS 13 Installment Contract]`.
- **Equated Monthly Installment (EMI) Generator**:
  - Flexible plans (3, 6, 10, or 12 months).
  - Advance down payment deduction with automatic double-entry journal posting.
  - Custom monthly payment day (e.g. 1st, 5th, 10th of each month).
  - Real-time calculated EMI preview and sequential schedule generation.
- **Guarantor (ضامن) Particulars**: Captures guarantor name, father's name, CNIC, mobile, and relation directly at checkout.

### 3. Smart Urdu WhatsApp Recovery Center (`F7`)
- **Proximity-Based Urgent Urdu Reminders**: Automatically crafts tailored Urdu WhatsApp messages based on due date proximity (Upcoming, Due Tomorrow, Overdue).
- **1-Click WhatsApp Dispatch**: Formats phone numbers (`+92`) and opens WhatsApp Web with the pre-filled contract reminder.
- **Call Center Feedback Logger**: Records recovery officer call notes, excuses, and customer promised payment dates/amounts.

### 4. Installment Receipt Voucher with Lump-Sum Auto-Allocation (`F10`)
- **Cascading Payment Engine**: Irregular lump-sum payments automatically cascade down unpaid EMIs in chronological sequence.
- **Multi-Status Splitting**: Fully settles cleared installments to `PAID` and applies residual amounts to the next installment as `PARTIAL`.
- **Split Payment Tender**: Supports splitting between Counter Cash and Bank Transfer (Meezan, HBL) in a single receipt.

### 5. Dual Interface Theme (Modern Web + Classic Desktop)
- **Modern Web ERP**: Clean SaaS interface featuring responsive cards, sidebar, and SVG donut charts.
- **Classic Windows Desktop Shell**: Visual Basic 6 desktop experience featuring MDI windows, classic 3D bevels, toolbars, and status bar.
- Toggle between themes with a single click.

---

## ⌨️ Function Key Shortcuts

| Key | Module | Description |
|:---|:---|:---|
| **`F12`** | **KPI Dashboard** | 11-tile analytical dashboard & universal search |
| **`F2`** | **Sale Counter (`frmItemSale`)** | POS billing with Installment Contract generation |
| **`F3`** | **Purchases (`frmItemPurchase2`)** | Handset purchase invoices & Goods Receipt Notes (GRN) |
| **`F4`** | **IMEI Tracking (`frmSearchIMEI`)** | 15-digit serial lifecycle audit from supplier to customer |
| **`F5`** | **Stock Register (`frmStockRegister`)** | Running inventory with IMEI counts and valuations |
| **`F6`** | **Party Ledger (`frmAccLedger`)** | Running debit/credit balance with Crystal Reports print |
| **`F7`** | **Installment Recovery (`frmInstDues`)** | Dues monitoring & smart Urdu WhatsApp reminders |
| **`F8`** | **Price Protection (`frmRebate`)** | Brand price drop rebates across IMEI batches |
| **`F9`** | **Excel Import (`frmImportExcel`)** | Bulk purchase IMEI import from distributor spreadsheets |
| **`F10`** | **Installment Receipt (`frmInstReceipt`)** | Lump-sum EMI voucher with auto-cascade |
| **`F11`** | **Customer Registration (`frmCustReg`)** | Customer & Guarantor verification & legal contracts |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/indigopearl88-crypto/cellon-ims-13-web.git
cd cellon-ims-13-web

# Install server dependencies
npm install

# Install client dependencies & build frontend
cd client
npm install
npm run build
cd ..
```

### 3. Launch the Server
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🏗️ Architecture & Tech Stack

```
bitdev-ims-13/
├── client/                     # React Frontend (Vite, Tailwind CSS, Lucide)
│   ├── src/
│   │   ├── components/         # MDI Windows, Modern Dashboard, POS, Recovery
│   │   ├── utils/              # Sound effects, Crystal Report generator
│   │   └── App.jsx             # Shell router with Modern & Classic switcher
│   └── public/                 # Authentic extracted icons, logos, audio cues
├── server/
│   ├── db.js                   # SQLite WAL Database schema, tables & seeders
│   └── index.js                # Express REST API, installment engine, analytics
├── package.json
└── README.md
```

- **Backend**: Node.js & Express with clean REST endpoints.
- **Database**: SQLite in high-concurrency WAL (Write-Ahead Logging) mode (`better-sqlite3`).
- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons.
- **Reporting**: Crystal Reports-styled dual printable formats (A4 Tax Invoice & 80mm Thermal Receipt).

---

## 📄 License
MIT License. BitDev Enterprise ERP.
