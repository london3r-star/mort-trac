-- =====================================================
-- EMERGENCY FIX - DISABLE RLS TEMPORARILY
-- Use this if fix-rls-policies.sql doesn't work
-- This will allow you to login immediately
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN '✅ DISABLED (You can login now!)'
        ELSE '❌ STILL ENABLED'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'applications', 'application_history')
ORDER BY tablename;

-- Note: This removes security but allows the app to work
-- You can re-enable and fix policies later once logged in
