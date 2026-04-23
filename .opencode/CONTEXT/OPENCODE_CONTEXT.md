# OpenCode Context Document - AdCure CRM

**Purpose:** Complete context for OpenCode om het project af te bouwen  
**Read this FIRST:** Bij elke nieuwe OpenCode sessie  
**Last Updated:** April 23, 2026

---

## 🎯 Project Overview

**Wat:** Client portal voor AdCure Agency (Nederlandse ad agency)  
**Stack:** TanStack Start + Cloudflare Workers + Supabase  
**Frontend:** Compleet (Lovable) - 26 pages, 11,110+ lines  
**Backend:** TODO (OpenCode job)  
**Target:** Vervangen van huidige Base44 CRM

---

## 🏗️ Architecture

```
┌────────────────────────────────────────┐
│  CLIENT BROWSER                         │
│  → TanStack React App                  │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  CLOUDFLARE WORKERS                    │
│  → Edge serverless functions           │
└────────────────────────────────────────┘
           ↓ ↓ ↓
┌─────────────┐ ┌──────────────┐ ┌─────────────┐
│  SUPABASE   │ │  SUPPLIER    │ │  MONEYBIRD  │
│  (our DB)   │ │  API         │ │  (invoices) │
└─────────────┘ └──────────────┘ └─────────────┘
```

**Data Split:**
- **Supabase (ons):** users, orgs, applications, audit, invoices_local
- **Supplier (theirs):** ad_accounts, balances, topups (source of truth)
- **Mapping:** `supplier_account_mappings` table koppelt beide

---

## 💼 Business Model

### **Fee Structure:**
```
Client pays:        €100 (ad budget)
                  + €5   (5% agency fee, variable per account)
                  + €1.05 (21% VAT on fee only)
                  = €106.05 total

Agency sends:       €102 (€100 + 2% supplier fee)
Agency margin:      €3 (after VAT to government)

IMPORTANT:
- VAT is ONLY on fee, NOT on top-up amount
- Supplier always charges 2%
- Agency fee varies per account (2-5%)
```

### **Payment Flow:**
- Bank transfer ONLY (no iDEAL/Stripe/etc.)
- Client → Revolut (NL14REV0766119691)
- Agency bundles → Supplier wallet
- Supplier → Ad account

### **Onboarding:**
- Self-registration at /sign-up
- Admin approval required
- No admin-initiated user creation
- KVK + VAT validation (format only, no API)
- Immutable after registration (contact support to change)

---

## 🗂️ Database Schema (Supabase)

### **Core Tables:**

```sql
-- Organizations (clients)
organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  kvk_number TEXT UNIQUE,
  vat_number TEXT UNIQUE,
  iban TEXT,
  status TEXT, -- pending, active, suspended
  legacy_base44_id TEXT, -- for migration
  created_at TIMESTAMPTZ
)

-- Users (linked to auth.users)
users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  organization_id UUID REFERENCES organizations,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT, -- agency_admin, client
  status TEXT,
  created_at TIMESTAMPTZ
)

-- Account Applications (pending sign-ups)
account_applications (
  id UUID PRIMARY KEY,
  company_name TEXT,
  kvk_number TEXT,
  vat_number TEXT,
  iban TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT, -- pending, approved, rejected
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- Supplier Account Mappings
supplier_account_mappings (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  supplier_ad_account_id TEXT UNIQUE,
  custom_fee_percentage NUMERIC(5,2), -- 2-5%
  is_external BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Local Transactions (audit log)
transactions_local (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  type TEXT, -- wallet_topup, account_topup, withdrawal
  client_amount NUMERIC(10,2),
  client_fee NUMERIC(10,2),
  client_vat NUMERIC(10,2),
  client_total NUMERIC(10,2),
  supplier_fee NUMERIC(10,2),
  supplier_amount NUMERIC(10,2),
  currency TEXT, -- EUR, USD
  reference_code TEXT UNIQUE,
  supplier_reference TEXT,
  payment_proof_url TEXT,
  status TEXT, -- pending, verified, sent, completed, failed
  ai_validation JSONB,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- Invoices (Moneybird sync)
invoices (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions_local,
  moneybird_invoice_id TEXT UNIQUE,
  invoice_number TEXT,
  amount NUMERIC(10,2),
  pdf_url TEXT,
  status TEXT, -- draft, sent, paid
  created_at TIMESTAMPTZ
)

-- Audit Log
audit_log (
  id UUID PRIMARY KEY,
  event_type TEXT,
  initiated_by UUID,
  organization_id UUID,
  transaction_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ
)
```

---

## 🔌 Supplier API

### **Base:**
```
URL: [TO BE PROVIDED]
Auth: Header "authtoken: XXX"
Rate Limit: [TBD]
```

### **Endpoints (13 total):**

```typescript
// Ad Accounts (5)
GET    /v1/adaccounts              // List all
GET    /v1/adaccounts/:id          // Details
POST   /v1/adaccounts              // Request new
GET    /v1/adaccounts/search       // Search
GET    /v1/adaccounts/:id/topups   // Top-up history

// Wallets (2)
POST   /v1/wallets/charge          // Charge wallet
GET    /v1/wallets/balance         // Get balance (EUR+USD)

// Topups (3)
GET    /v1/topups                  // All top-ups
GET    /v1/topups/:id              // Specific
POST   /v1/topups                  // Request new

// Withdrawals (2)
POST   /v1/withdrawls              // Request
GET    /v1/withdrawls/:id          // Status
```

### **Key Response Fields:**
```typescript
AdAccount {
  ad_account_id: string
  name: string
  balance: number
  currency: "EUR" | "USD"
  fee_percentage: "2"  // Always 2% supplier fee
  status: string
}

Wallet {
  usd_balance: number
  eur_balance: number
}

TopupResponse {
  id: string
  invoice_id: string
  reference: string
  total_amount: number
  topup_amount: number
  topup_fee: number
}
```

---

## 🔑 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Supplier API
VITE_SUPPLIER_API_URL=
SUPPLIER_AUTH_TOKEN=

# Moneybird
MONEYBIRD_API_KEY=
MONEYBIRD_ADMINISTRATION_ID=

# Resend (email)
RESEND_API_KEY=

# Anthropic (AI validation)
ANTHROPIC_API_KEY=

# Revolut (optional - Phase 5)
REVOLUT_API_KEY=
REVOLUT_ACCOUNT_ID=

# Business Config
REVOLUT_IBAN=NL14REV0766119691
REVOLUT_BIC=REV0NL22
DEFAULT_SUPPLIER_FEE=2
VAT_RATE=21

# Safety Limits
MAX_TOPUP_AMOUNT=10000
MAX_DAILY_VOLUME=50000
```

---

## 📁 Current Code Structure

```
obsidian-adcure/
├── src/
│   ├── components/
│   │   ├── AppShell.tsx              # Agency layout
│   │   ├── ClientShell.tsx           # Client layout
│   │   ├── PublicShell.tsx           # Public layout
│   │   ├── AgencySidebar.tsx         # Admin nav
│   │   ├── ClientSidebar.tsx         # Client nav
│   │   ├── UserMenu.tsx              # Dropdown + role switcher
│   │   ├── GlassCard.tsx             # Design system
│   │   ├── KpiCard.tsx               # Stats display
│   │   ├── StatusPill.tsx            # Badges
│   │   └── ui/                       # shadcn components
│   ├── lib/
│   │   ├── auth-mock.ts              # REPLACE with real auth
│   │   ├── mock-data.ts              # REPLACE with queries
│   │   ├── theme.ts                  # Dark/light mode
│   │   └── utils.ts                  # cn() helper
│   └── routes/
│       ├── agency.*.tsx              # 11 admin pages
│       ├── portal.*.tsx              # 6 client pages
│       └── [auth + public].tsx       # 7 public pages
```

---

## ⚠️ Critical Implementation Rules

### **1. NEVER Break:**
- Fee calculation accuracy
- VAT rules (only on fee!)
- Audit log completeness
- RLS policies (clients see only own data)

### **2. ALWAYS:**
- Log every financial operation
- Validate amounts server-side
- Check user permissions
- Use transactions for DB writes
- Handle API failures gracefully
- Send confirmation emails

### **3. TESTING:**
- Start with small amounts (€1-10)
- Use test supplier accounts
- Monitor audit log constantly
- Mismatch = immediate alert

---

## 🎨 Design System

**Use these existing components:**
- `<GlassCard>` for containers
- `<KpiCard>` for stats
- `<StatusPill>` for badges
- `<AppShell>` / `<ClientShell>` / `<PublicShell>` for layouts

**Color conventions:**
- `success` (green): Approved, Paid, Completed
- `warning` (yellow): Pending, Processing
- `destructive` (red): Rejected, Failed, Mismatch
- `muted`: Inactive, Archived

**Never:**
- Add new UI frameworks
- Break dark/light mode
- Use non-Lucide icons
- Skip `tabular-nums` for numbers

---

## 🔐 Authentication Rules

```
Public routes: /, /login, /sign-up, /forgot-password, /terms, /privacy
Agency routes: /agency/* → requires role: agency_admin
Client routes: /portal/* → requires role: client

ALWAYS check role via beforeLoad guard
NEVER trust client-side role claims
ALWAYS verify via Supabase RLS
```

---

## 📝 Task Conventions

**Format voor OpenCode tasks:**

```
TASK: [Duidelijke titel]
CONTEXT: [Wat is er al, wat moet erbij]
REQUIREMENTS:
  - Must do X
  - Must not do Y
FILES TO MODIFY:
  - path/to/file.ts
FILES TO CREATE:
  - new/file.ts
TEST:
  - How to verify it works
```

---

## 🎯 Current Phase

**Phase 1: Foundation (Week 1)**

Next tasks:
1. ✅ Clone repo
2. ⏳ Setup Supabase
3. ⏳ Database schema
4. ⏳ Replace mock auth

See: `DEVELOPMENT_ROADMAP.md` for full plan

---

## 📞 Key People

- **Joey Dekker** - Developer/Owner
  - Located: Gouda, Netherlands
  - Dev environment: Windows PC
  - Mac Mini as SSH server
  - Primary AI: OpenCode (Claude via API)

- **Partner** - Designer
  - Works in Lovable
  - Handles UI/UX changes

---

## 🚨 Red Flags / Stop Signs

**STOP and ask Joey if:**
- About to modify fee calculation logic
- Making changes to RLS policies
- Breaking change to API contract
- Spending real money in tests (>€10)
- Removing audit logging
- Changing authentication flow

---

## ✅ Definition of Done

**A feature is complete when:**
```
□ Works end-to-end
□ Handles errors gracefully
□ Logs to audit_log
□ Has TypeScript types
□ Tested with real data (small amounts)
□ Committed to GitHub
□ No console errors
□ No TypeScript errors
```

---

**This document is the source of truth. Always reference it before starting work.**
