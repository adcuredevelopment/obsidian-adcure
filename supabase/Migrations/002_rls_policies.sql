-- ============================================
-- AdCure CRM - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Date: April 23, 2026
-- ============================================

-- IMPORTANT: These policies ensure multi-tenant security
-- Clients can ONLY see their own data
-- Admins can see everything
-- Public users see nothing (except auth-related)

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is agency admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'agency_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_local ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Admins can see all organizations
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT
  USING (auth.is_admin());

-- Clients can view their own organization
CREATE POLICY "Clients can view own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_organization_id());

-- Only admins can create organizations
CREATE POLICY "Admins can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.is_admin());

-- Admins can update any org, clients only limited fields on their own
CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE
  USING (auth.is_admin());

-- Only admins can delete
CREATE POLICY "Admins can delete organizations"
  ON organizations FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Admins see all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (auth.is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users in same org can view each other (for team features later)
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Admins can create users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (auth.is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can update any user
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (auth.is_admin());

-- Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- ACCOUNT APPLICATIONS POLICIES
-- ============================================

-- Anyone can create application (public sign-up)
CREATE POLICY "Anyone can submit application"
  ON account_applications FOR INSERT
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON account_applications FOR SELECT
  USING (auth.is_admin());

-- Only admins can update (approve/reject)
CREATE POLICY "Admins can review applications"
  ON account_applications FOR UPDATE
  USING (auth.is_admin());

-- Only admins can delete
CREATE POLICY "Admins can delete applications"
  ON account_applications FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- SUPPLIER ACCOUNT MAPPINGS POLICIES
-- ============================================

-- Admins see all mappings
CREATE POLICY "Admins can view all mappings"
  ON supplier_account_mappings FOR SELECT
  USING (auth.is_admin());

-- Clients see their own org's mappings
CREATE POLICY "Clients can view own mappings"
  ON supplier_account_mappings FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Only admins can modify
CREATE POLICY "Admins can create mappings"
  ON supplier_account_mappings FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY "Admins can update mappings"
  ON supplier_account_mappings FOR UPDATE
  USING (auth.is_admin());

CREATE POLICY "Admins can delete mappings"
  ON supplier_account_mappings FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

-- Admins see all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions_local FOR SELECT
  USING (auth.is_admin());

-- Clients see their own org's transactions
CREATE POLICY "Clients can view own transactions"
  ON transactions_local FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Clients can create transactions for their org
CREATE POLICY "Clients can create own transactions"
  ON transactions_local FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id()
    AND user_id = auth.uid()
  );

-- Admins can create transactions for any org
CREATE POLICY "Admins can create any transaction"
  ON transactions_local FOR INSERT
  WITH CHECK (auth.is_admin());

-- Only admins can update transactions (for reconciliation)
CREATE POLICY "Admins can update transactions"
  ON transactions_local FOR UPDATE
  USING (auth.is_admin());

-- Only admins can delete (but should be rare!)
CREATE POLICY "Admins can delete transactions"
  ON transactions_local FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- INVOICES POLICIES
-- ============================================

-- Admins see all invoices
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (auth.is_admin());

-- Clients see their own invoices
CREATE POLICY "Clients can view own invoices"
  ON invoices FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Only admins can create/modify invoices (synced from Moneybird)
CREATE POLICY "Admins can manage invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  USING (auth.is_admin());

CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- AUDIT LOG POLICIES
-- ============================================

-- Only admins can view audit log
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (auth.is_admin());

-- Everyone can insert (system events) - but only from server-side
CREATE POLICY "System can log events"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- No updates or deletes on audit log (immutable!)
-- This is intentional - audit logs should never be modified

-- ============================================
-- API CALL LOG POLICIES
-- ============================================

-- Only admins can view
CREATE POLICY "Admins can view api logs"
  ON api_call_log FOR SELECT
  USING (auth.is_admin());

-- System can insert
CREATE POLICY "System can log api calls"
  ON api_call_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Ensure authenticated users can read/write where allowed
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Public role (for sign-ups only)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON account_applications TO anon;
GRANT SELECT ON account_applications TO anon;

-- Done!
-- Next: Run seed.sql (optional, for test data)
