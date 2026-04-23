-- ============================================
-- AdCure CRM - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Date: April 23, 2026
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS (Type Safety)
-- ============================================

CREATE TYPE user_role AS ENUM ('agency_admin', 'client');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE organization_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_type AS ENUM (
  'wallet_topup',
  'account_topup',
  'withdrawal',
  'adjustment',
  'refund'
);
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'proof_uploaded',
  'verified',
  'sent_to_supplier',
  'completed',
  'failed',
  'cancelled'
);
CREATE TYPE currency_code AS ENUM ('EUR', 'USD');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'cancelled');

-- ============================================
-- ORGANIZATIONS (Client Companies)
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company details
  name TEXT NOT NULL,
  kvk_number TEXT UNIQUE NOT NULL,
  vat_number TEXT UNIQUE NOT NULL,
  iban TEXT,
  
  -- Address (optional, can be added later)
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'NL',
  
  -- Status
  status organization_status NOT NULL DEFAULT 'pending',
  
  -- Business config
  default_fee_percentage NUMERIC(5,2) DEFAULT 5.00, -- Default agency fee
  
  -- Migration tracking (for Base44 import)
  legacy_base44_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_kvk CHECK (kvk_number ~ '^[0-9]{8}$'),
  CONSTRAINT valid_vat CHECK (vat_number ~ '^NL[0-9]{9}B[0-9]{2}$'),
  CONSTRAINT valid_fee CHECK (default_fee_percentage >= 0 AND default_fee_percentage <= 20)
);

COMMENT ON TABLE organizations IS 'Client companies using AdCure platform';
COMMENT ON COLUMN organizations.default_fee_percentage IS 'Agency fee (2-5% typical, max 20%)';

-- ============================================
-- USERS (Auth + Profile)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Profile
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Role & Status
  role user_role NOT NULL DEFAULT 'client',
  status user_status NOT NULL DEFAULT 'active',
  
  -- Preferences
  language TEXT DEFAULT 'nl',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}'::jsonb,
  
  -- Terms acceptance
  terms_accepted_version TEXT,
  terms_accepted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'User profiles linked to Supabase auth.users';

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- ACCOUNT APPLICATIONS (Sign-up Pending)
-- ============================================

CREATE TABLE account_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company details
  company_name TEXT NOT NULL,
  kvk_number TEXT NOT NULL,
  vat_number TEXT NOT NULL,
  iban TEXT,
  
  -- Contact details
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Terms acceptance
  terms_accepted_version TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  
  -- Review
  status application_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Created organization (after approval)
  organization_id UUID REFERENCES organizations(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_kvk_app CHECK (kvk_number ~ '^[0-9]{8}$'),
  CONSTRAINT valid_vat_app CHECK (vat_number ~ '^NL[0-9]{9}B[0-9]{2}$'),
  CONSTRAINT valid_email_app CHECK (contact_email ~ '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE account_applications IS 'Pending sign-up applications awaiting admin approval';

CREATE INDEX idx_applications_status ON account_applications(status);
CREATE INDEX idx_applications_created ON account_applications(created_at DESC);

-- ============================================
-- SUPPLIER ACCOUNT MAPPINGS
-- ============================================

CREATE TABLE supplier_account_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Supplier reference
  supplier_ad_account_id TEXT NOT NULL UNIQUE,
  supplier_ad_account_name TEXT,
  
  -- Custom fee (overrides organization default)
  custom_fee_percentage NUMERIC(5,2),
  
  -- Flags
  is_external BOOLEAN DEFAULT false, -- True = manual supplier, not API
  is_active BOOLEAN DEFAULT true,
  
  -- Platform info (cached from supplier)
  platform TEXT, -- 'meta', 'google', 'tiktok', 'linkedin'
  currency currency_code DEFAULT 'EUR',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_custom_fee CHECK (
    custom_fee_percentage IS NULL OR 
    (custom_fee_percentage >= 0 AND custom_fee_percentage <= 20)
  )
);

COMMENT ON TABLE supplier_account_mappings IS 'Links local organizations to supplier ad accounts';

CREATE INDEX idx_mappings_organization ON supplier_account_mappings(organization_id);
CREATE INDEX idx_mappings_supplier ON supplier_account_mappings(supplier_ad_account_id);

-- ============================================
-- TRANSACTIONS (Audit Log for All Money Movement)
-- ============================================

CREATE TABLE transactions_local (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Transaction type & classification
  type transaction_type NOT NULL,
  
  -- Related entities
  user_id UUID REFERENCES users(id), -- Who initiated
  supplier_account_mapping_id UUID REFERENCES supplier_account_mappings(id),
  
  -- Amounts (EUR base, full precision)
  client_amount NUMERIC(10,2) NOT NULL, -- What client requested (ad budget)
  client_fee NUMERIC(10,2) NOT NULL DEFAULT 0, -- Agency fee
  client_vat NUMERIC(10,2) NOT NULL DEFAULT 0, -- VAT on fee
  client_total NUMERIC(10,2) NOT NULL, -- Total client pays
  
  supplier_fee NUMERIC(10,2) NOT NULL DEFAULT 0, -- Supplier's 2%
  supplier_amount NUMERIC(10,2) NOT NULL, -- What we send to supplier
  
  currency currency_code NOT NULL DEFAULT 'EUR',
  
  -- References
  reference_code TEXT UNIQUE NOT NULL, -- Our internal ref (ADC-XXXX-YYYY)
  supplier_reference TEXT, -- Supplier's transaction ID
  
  -- Payment proof
  payment_proof_url TEXT,
  payment_proof_uploaded_at TIMESTAMPTZ,
  
  -- AI validation
  ai_validation JSONB, -- {confidence: 0.95, checks: {...}, risk_score: 10}
  ai_validated_at TIMESTAMPTZ,
  
  -- Status tracking
  status transaction_status NOT NULL DEFAULT 'pending',
  status_history JSONB DEFAULT '[]'::jsonb, -- Array of status changes
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES users(id),
  reconciliation_notes TEXT,
  
  -- Mismatch detection
  expected_amount NUMERIC(10,2),
  actual_amount NUMERIC(10,2),
  mismatch_amount NUMERIC(10,2),
  mismatch_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT positive_amounts CHECK (
    client_amount >= 0 AND
    client_fee >= 0 AND
    client_vat >= 0 AND
    client_total >= 0 AND
    supplier_amount >= 0
  )
);

COMMENT ON TABLE transactions_local IS 'Complete audit log of all financial transactions';

CREATE INDEX idx_transactions_org ON transactions_local(organization_id);
CREATE INDEX idx_transactions_status ON transactions_local(status);
CREATE INDEX idx_transactions_type ON transactions_local(type);
CREATE INDEX idx_transactions_created ON transactions_local(created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions_local(reference_code);
CREATE INDEX idx_transactions_unreconciled ON transactions_local(reconciled) WHERE reconciled = false;

-- ============================================
-- INVOICES (Moneybird Sync)
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  transaction_id UUID REFERENCES transactions_local(id),
  
  -- Moneybird reference
  moneybird_invoice_id TEXT UNIQUE,
  moneybird_administration_id TEXT,
  
  -- Invoice details
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency currency_code DEFAULT 'EUR',
  
  -- PDF
  pdf_url TEXT,
  
  -- Status
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Dates
  issued_date DATE,
  due_date DATE,
  paid_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

COMMENT ON TABLE invoices IS 'Invoices synced from Moneybird';

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_transaction ON invoices(transaction_id);
CREATE INDEX idx_invoices_moneybird ON invoices(moneybird_invoice_id);

-- ============================================
-- AUDIT LOG (All System Events)
-- ============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event classification
  event_type TEXT NOT NULL, -- 'user.login', 'topup.requested', 'application.approved', etc.
  event_category TEXT, -- 'auth', 'financial', 'admin', 'system'
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  
  -- Actor
  initiated_by UUID REFERENCES users(id),
  initiated_by_type TEXT DEFAULT 'user', -- 'user', 'system', 'webhook', 'cron'
  
  -- Related entities
  organization_id UUID REFERENCES organizations(id),
  transaction_id UUID REFERENCES transactions_local(id),
  
  -- Event data
  description TEXT,
  data JSONB, -- Flexible event-specific data
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Complete audit trail of system events';

CREATE INDEX idx_audit_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_org ON audit_log(organization_id);
CREATE INDEX idx_audit_user ON audit_log(initiated_by);
CREATE INDEX idx_audit_severity ON audit_log(severity) WHERE severity IN ('error', 'critical');

-- ============================================
-- API CALL LOG (Supplier API Tracking)
-- ============================================

CREATE TABLE api_call_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request
  method TEXT NOT NULL, -- GET, POST, etc.
  endpoint TEXT NOT NULL,
  request_body JSONB,
  
  -- Response
  status_code INTEGER,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- Error tracking
  error_message TEXT,
  
  -- Context
  transaction_id UUID REFERENCES transactions_local(id),
  
  -- Timestamps
  called_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE api_call_log IS 'Log of all supplier API calls for debugging';

CREATE INDEX idx_api_log_endpoint ON api_call_log(endpoint);
CREATE INDEX idx_api_log_called ON api_call_log(called_at DESC);
CREATE INDEX idx_api_log_status ON api_call_log(status_code);
CREATE INDEX idx_api_log_errors ON api_call_log(status_code) WHERE status_code >= 400;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON account_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mappings_updated_at BEFORE UPDATE ON supplier_account_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions_local
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate unique reference code
CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
  year_part TEXT;
  random_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
  ref_code := 'ADC-' || year_part || '-' || random_part;
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate reference code on transaction insert
CREATE OR REPLACE FUNCTION set_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := generate_reference_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_reference_code
  BEFORE INSERT ON transactions_local
  FOR EACH ROW
  EXECUTE FUNCTION set_reference_code();

-- ============================================
-- COMMENTS / DOCUMENTATION
-- ============================================

COMMENT ON DATABASE postgres IS 'AdCure CRM - Production Database';

-- Done!
-- Next: Run 002_rls_policies.sql
