-- =====================================================
-- TEST SUPABASE CONNECTION AND DATA
-- Run this to see what's in your database
-- =====================================================

-- 1. Check if tables exist
SELECT 'Tables that exist:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'applications', 'application_history')
ORDER BY table_name;

-- 2. Check auth.users table
SELECT '---' as separator;
SELECT 'Users in auth.users:' as info;
SELECT id, email, email_confirmed_at, created_at,
       CASE WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED' ELSE 'NOT CONFIRMED' END as status
FROM auth.users 
WHERE email = 'london3r@gmail.com';

-- 3. Check profiles table
SELECT '---' as separator;
SELECT 'Profiles in public.profiles:' as info;
SELECT id, name, email, role, is_admin, is_team_manager, is_broker_admin, company_name
FROM public.profiles 
WHERE email = 'london3r@gmail.com';

-- 4. Check if IDs match
SELECT '---' as separator;
SELECT 'ID Match Check:' as info;
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    p.id as profile_id,
    p.email as profile_email,
    CASE 
        WHEN au.id = p.id THEN '✅ IDs MATCH' 
        WHEN p.id IS NULL THEN '❌ NO PROFILE'
        ELSE '❌ IDs DO NOT MATCH' 
    END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'london3r@gmail.com';

-- 5. Check RLS policies
SELECT '---' as separator;
SELECT 'RLS Policies on profiles table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. Test if we can read from profiles (as anon user)
SELECT '---' as separator;
SELECT 'Can anonymous user read profiles? (should show 0 rows if RLS is working):' as info;
SELECT COUNT(*) as visible_profiles
FROM public.profiles;
