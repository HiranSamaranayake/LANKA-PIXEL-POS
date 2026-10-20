-- ==============================================================================
-- LANKA PIXEL CREATIONS (PVT) LTD - COMPANY MANAGEMENT DATABASE SCHEMA
-- PostgreSQL / Supabase Migration with Hardened Row-Level Security (RLS)
-- ==============================================================================
-- Security Specifications:
-- 1. Initial Admin Security: assign_initial_admin(p_email) only promotes when ZERO
--    Admin accounts exist in the system. Refuses execution if an Admin already exists.
--    Protected against concurrency via explicit EXCLUSIVE table lock.
-- 2. Procedure Permissions: assign_initial_admin is restricted strictly to database
--    superuser (postgres). Permissions revoked from PUBLIC, anon, authenticated, service_role.
-- 3. Staff Account Creation: Trigger handle_new_user() honors roles only when called
--    by an active Admin or trusted service_role (Edge Function). Public signups strictly
--    default to 'Designer'.
-- 4. Empty Search Path: All SECURITY DEFINER functions use SET search_path = '' with
--    schema-qualified references (pg_catalog, public, auth) to prevent search-path injection.
-- 5. Complete RLS Enforcement: Deactivated users are blocked across all tables.
--    Designers cannot read financial records or other designers' post records.
-- 6. Profile Protection: Non-admins cannot alter their role, status, email, or id.
-- 7. Idempotent Migration: Safe to rerun repeatedly without duplicate errors or data loss.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLES AND INDEXES
-- ------------------------------------------------------------------------------

-- User Roles and Profiles Table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Call Center Operator', 'Designer')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Deactivated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Daily Income Records Table
CREATE TABLE IF NOT EXISTS public.income_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  source TEXT NOT NULL,
  client_project TEXT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  recorded_by TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_date ON public.income_records(date);
CREATE INDEX IF NOT EXISTS idx_income_user ON public.income_records(user_id);

-- Operational Expenses Table
CREATE TABLE IF NOT EXISTS public.expense_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN (
      'Facebook Boosting',
      'Advertising',
      'Salaries',
      'Software',
      'Internet',
      'Electricity',
      'Equipment',
      'Transport',
      'Office Expenses',
      'Other'
    )
  ),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  recorded_by TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expense_records(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expense_records(category);

-- Daily Designer Post Count Table (Completed Posts only; video counts excluded)
CREATE TABLE IF NOT EXISTS public.daily_post_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  designer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_name TEXT NOT NULL,
  completed_posts INTEGER NOT NULL CHECK (completed_posts >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_designer_date UNIQUE (date, designer_id)
);

CREATE INDEX IF NOT EXISTS idx_post_counts_date ON public.daily_post_counts(date);
CREATE INDEX IF NOT EXISTS idx_post_counts_designer ON public.daily_post_counts(designer_id);

-- Company Settings Table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'LANKA PIXEL CREATIONS (PVT) LTD',
  currency TEXT NOT NULL DEFAULT 'LKR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Colombo',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.company_settings (id, company_name, currency, timezone)
VALUES ('default', 'LANKA PIXEL CREATIONS (PVT) LTD', 'LKR', 'Asia/Colombo')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPER FUNCTIONS
-- All functions specify SET search_path = '' and use schema-qualified references
-- to completely prevent search-path hijacking (CWE-426).
-- ------------------------------------------------------------------------------

-- Retrieve role for an active user
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id pg_catalog.uuid)
RETURNS pg_catalog.text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = p_user_id AND status = 'Active' LIMIT 1;
$$;

-- Verify if the caller is an active staff user
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'Active'
  );
$$;

-- Verify if the caller is an active Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT public.get_user_role(auth.uid()) = 'Admin';
$$;

-- Verify if caller is an active Admin OR a trusted internal service_role process (Edge Function)
CREATE OR REPLACE FUNCTION public.is_admin_or_service_role()
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT 
    (auth.uid() IS NOT NULL AND public.get_user_role(auth.uid()) = 'Admin')
    OR
    (COALESCE(auth.role(), '') = 'service_role' OR COALESCE(pg_catalog.current_setting('request.jwt.claim.role', true), '') = 'service_role');
$$;

-- Verify if the caller is an active Admin or Call Center Operator
CREATE OR REPLACE FUNCTION public.is_call_center_or_admin()
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT public.get_user_role(auth.uid()) IN ('Admin', 'Call Center Operator');
$$;

-- Verify if the caller is an active Designer
CREATE OR REPLACE FUNCTION public.is_designer()
RETURNS pg_catalog.bool
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT public.get_user_role(auth.uid()) = 'Designer';
$$;

-- ------------------------------------------------------------------------------
-- 4. PROFILE PROTECTION & PRIVILEGE ENFORCEMENT TRIGGER
-- Enforces field-level immutability before write: non-admins cannot change
-- their role, status, email, or id. Eliminates recursive RLS queries completely.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_initial_bootstrap pg_catalog.bool := false;
  v_is_authorized pg_catalog.bool := false;
BEGIN
  -- 1. Initial Admin bootstrap authorization:
  -- Permitted ONLY if initiated by assign_initial_admin() in this transaction,
  -- executed by a database administrator (postgres/supabase_admin), AND zero Admins exist.
  IF pg_catalog.current_setting('lp.in_initial_admin_setup', true) = 'true' THEN
    IF pg_catalog.session_user IN ('postgres', 'supabase_admin') AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'Admin') THEN
      v_is_initial_bootstrap := true;
    END IF;
  END IF;

  -- 2. Standard administrative authorization (Active Admin JWT, service_role, or direct DBA)
  IF v_is_initial_bootstrap 
     OR public.is_admin_or_service_role() 
     OR pg_catalog.session_user IN ('postgres', 'supabase_admin') THEN
    v_is_authorized := true;
  END IF;

  -- If caller is not authorized, strictly block role, status, id, and email modifications
  IF NOT v_is_authorized THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security Policy Violation: Only Administrators may modify staff roles.';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Security Policy Violation: Only Administrators may modify account status.';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Security Policy Violation: User identifier cannot be altered.';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Security Policy Violation: Corporate email cannot be changed by user.';
    END IF;
  END IF;

  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_profile_updates ON public.profiles;
CREATE TRIGGER trg_check_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_updates();

-- ------------------------------------------------------------------------------
-- 5. SECURE USER PROVISIONING TRIGGER (auth.users)
-- Strictly prevents privilege escalation:
-- 1. NO automatic first-user Admin bootstrap.
-- 2. Metadata role is ONLY honored if creator is an active Admin or trusted service_role.
-- 3. Any other signup is assigned the unprivileged 'Designer' role by default.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role pg_catalog.text := 'Designer';
  v_full_name pg_catalog.text;
BEGIN
  -- Only if caller is an active Admin or service_role do we honor the requested role from metadata
  IF public.is_admin_or_service_role() AND (NEW.raw_user_meta_data->>'role') IN ('Admin', 'Call Center Operator', 'Designer') THEN
    v_role := NEW.raw_user_meta_data->>'role';
  ELSE
    -- Default to least-privileged role 'Designer'. Never automatically elevate to Admin.
    v_role := 'Designer';
  END IF;

  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    pg_catalog.split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    'Active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    -- Prevent non-admins from modifying full_name via repeated signups
    full_name = CASE WHEN public.is_admin_or_service_role() THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    updated_at = pg_catalog.now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. SECURE INITIAL ADMINISTRATOR ASSIGNMENT PROCEDURE
-- Runs ONLY when ZERO Admin accounts currently exist in public.profiles.
-- Safe against concurrent executions via exclusive table lock.
-- Executable exclusively by database superuser (postgres role) in SQL Editor.
-- API access via PostgREST/anon/authenticated/service_role is strictly revoked.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE public.assign_initial_admin(p_email pg_catalog.text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id pg_catalog.uuid;
  v_clean_email pg_catalog.text;
BEGIN
  v_clean_email := pg_catalog.lower(TRIM(p_email));

  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RAISE EXCEPTION 'Input Error: An email address must be provided.';
  END IF;

  -- Concurrency Protection: Acquire exclusive lock on profiles table during check and promotion
  LOCK TABLE public.profiles IN EXCLUSIVE MODE;

  -- Security Gate: Refuse execution if an Admin already exists in the system
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'Admin'
  ) THEN
    RAISE EXCEPTION 'Security Refusal: An Administrator account already exists. For security reasons, this initial bootstrap procedure can only be executed when zero Admin accounts exist in the system.';
  END IF;

  -- Match user in profiles table
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE pg_catalog.lower(email) = v_clean_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist in profiles. Please create the user account in Supabase Auth first, then execute this command.', p_email;
  END IF;

  -- Set transaction-local flag authorizing the initial bootstrap promotion
  PERFORM pg_catalog.set_config('lp.in_initial_admin_setup', 'true', true);

  UPDATE public.profiles
  SET
    role = 'Admin',
    status = 'Active',
    updated_at = pg_catalog.now()
  WHERE id = v_user_id;

  RAISE NOTICE 'Success: User % (ID: %) has been securely granted the initial Admin role.', p_email, v_user_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_post_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 8. RLS POLICIES (Idempotent: drops existing before creating)
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- A. PROFILES TABLE POLICIES
-- ==============================================================================
-- 1. SELECT: Users can read their own profile; Admins can view all staff
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- 2. INSERT: Only Admins can directly insert profile records (Trigger handles signup)
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 3. UPDATE: Admins can update any profile; Active users can update their own row
-- (Trigger trg_check_profile_updates strictly blocks non-admins from changing role/status)
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR (auth.uid() = id AND public.is_active_user()))
  WITH CHECK (public.is_admin() OR (auth.uid() = id AND public.is_active_user()));

-- 4. DELETE: Only Admins can delete staff profiles
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- B. DAILY INCOME RECORDS POLICIES
-- Designers and deactivated users are strictly barred at the database level.
-- ==============================================================================
-- 1. SELECT: Only active Admins and Call Center Operators
DROP POLICY IF EXISTS "income_select_policy" ON public.income_records;
CREATE POLICY "income_select_policy"
  ON public.income_records
  FOR SELECT
  TO authenticated
  USING (public.is_call_center_or_admin());

-- 2. INSERT: Only active Admins and Call Center Operators
DROP POLICY IF EXISTS "income_insert_policy" ON public.income_records;
CREATE POLICY "income_insert_policy"
  ON public.income_records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_call_center_or_admin());

-- 3. UPDATE: Only active Admins can edit income records
DROP POLICY IF EXISTS "income_update_policy" ON public.income_records;
CREATE POLICY "income_update_policy"
  ON public.income_records
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. DELETE: Only active Admins can delete income records
DROP POLICY IF EXISTS "income_delete_policy" ON public.income_records;
CREATE POLICY "income_delete_policy"
  ON public.income_records
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- C. EXPENSE RECORDS POLICIES
-- Designers and deactivated users are strictly barred at the database level.
-- ==============================================================================
-- 1. SELECT: Only active Admins and Call Center Operators
DROP POLICY IF EXISTS "expenses_select_policy" ON public.expense_records;
CREATE POLICY "expenses_select_policy"
  ON public.expense_records
  FOR SELECT
  TO authenticated
  USING (public.is_call_center_or_admin());

-- 2. INSERT: Only active Admins and Call Center Operators
DROP POLICY IF EXISTS "expenses_insert_policy" ON public.expense_records;
CREATE POLICY "expenses_insert_policy"
  ON public.expense_records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_call_center_or_admin());

-- 3. UPDATE: Only active Admins can edit expense records
DROP POLICY IF EXISTS "expenses_update_policy" ON public.expense_records;
CREATE POLICY "expenses_update_policy"
  ON public.expense_records
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. DELETE: Only active Admins can delete expense records
DROP POLICY IF EXISTS "expenses_delete_policy" ON public.expense_records;
CREATE POLICY "expenses_delete_policy"
  ON public.expense_records
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- D. DAILY POST COUNTS POLICIES
-- Designers only see and manage their own counts. Deactivated designers barred.
-- Only Admins can view/manage all designers' records and delete counts.
-- ==============================================================================
-- 1. SELECT: Admins can view all; Active Designers can view only their own records
DROP POLICY IF EXISTS "post_counts_select_policy" ON public.daily_post_counts;
CREATE POLICY "post_counts_select_policy"
  ON public.daily_post_counts
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    (public.is_designer() AND designer_id = auth.uid())
  );

-- 2. INSERT: Admins can log for any designer; Designers can log only for themselves
DROP POLICY IF EXISTS "post_counts_insert_policy" ON public.daily_post_counts;
CREATE POLICY "post_counts_insert_policy"
  ON public.daily_post_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR
    (public.is_designer() AND designer_id = auth.uid())
  );

-- 3. UPDATE: Admins can edit any; Designers can edit only their own record
DROP POLICY IF EXISTS "post_counts_update_policy" ON public.daily_post_counts;
CREATE POLICY "post_counts_update_policy"
  ON public.daily_post_counts
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    (public.is_designer() AND designer_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin() OR
    (public.is_designer() AND designer_id = auth.uid())
  );

-- 4. DELETE: Strictly Admins only
DROP POLICY IF EXISTS "post_counts_delete_policy" ON public.daily_post_counts;
CREATE POLICY "post_counts_delete_policy"
  ON public.daily_post_counts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- E. COMPANY SETTINGS POLICIES
-- Read-only for active authenticated staff; updates strictly restricted to Admins.
-- ==============================================================================
-- 1. SELECT: Active authenticated staff can read company settings
DROP POLICY IF EXISTS "settings_select_policy" ON public.company_settings;
CREATE POLICY "settings_select_policy"
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (public.is_active_user());

-- 2. INSERT: Admins only
DROP POLICY IF EXISTS "settings_insert_policy" ON public.company_settings;
CREATE POLICY "settings_insert_policy"
  ON public.company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 3. UPDATE: Admins only
DROP POLICY IF EXISTS "settings_update_policy" ON public.company_settings;
CREATE POLICY "settings_update_policy"
  ON public.company_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. DELETE: Disallow deletion of the settings row
DROP POLICY IF EXISTS "settings_delete_policy" ON public.company_settings;
CREATE POLICY "settings_delete_policy"
  ON public.company_settings
  FOR DELETE
  TO authenticated
  USING (false);

-- ------------------------------------------------------------------------------
-- 9. STRICT PERMISSION GRANTS & REVOCATIONS
-- Default public execution is revoked to prevent unauthenticated RPC exploitation.
-- ------------------------------------------------------------------------------

-- 1. Revoke all table permissions from anonymous & public
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.income_records FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.expense_records FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.daily_post_counts FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.company_settings FROM PUBLIC, anon;

-- 2. Grant table verbs to authenticated role (row access is enforced by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.income_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expense_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_post_counts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.company_settings TO authenticated;

-- 3. Explicitly revoke EXECUTE on all functions & procedures from PUBLIC and anon
REVOKE ALL ON FUNCTION public.get_user_role(pg_catalog.uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_active_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_service_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_call_center_or_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_designer() FROM PUBLIC, anon;

-- Trigger functions & setup procedure must NOT be executable over PostgREST API
REVOKE ALL ON FUNCTION public.check_profile_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON PROCEDURE public.assign_initial_admin(pg_catalog.text) FROM PUBLIC, anon, authenticated, service_role;

-- 4. Grant EXECUTE on RLS helper functions strictly to authenticated role
GRANT EXECUTE ON FUNCTION public.get_user_role(pg_catalog.uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_service_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_call_center_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_designer() TO authenticated;

-- 5. Grant internal trigger execution to trusted postgres and service_role
GRANT EXECUTE ON FUNCTION public.check_profile_updates() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- 6. Grant initial admin procedure strictly to postgres (manual SQL Editor execution only)
GRANT EXECUTE ON PROCEDURE public.assign_initial_admin(pg_catalog.text) TO postgres;
