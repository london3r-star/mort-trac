-- =====================================================
-- DELETE ALL USERS EXCEPT ADMIN
-- Fresh start with only admin user
-- =====================================================

-- Step 1: Show current users
SELECT 'Current users in database:' as status;
SELECT id, name, email, role, is_admin FROM public.profiles ORDER BY created_at;

-- Step 2: Delete all non-admin profiles (will cascade delete applications)
DELETE FROM public.profiles
WHERE is_admin = false OR is_admin IS NULL;

-- Step 3: Delete all non-admin auth users
DELETE FROM auth.users
WHERE email != 'london3r@gmail.com';

-- Step 4: Verify only admin remains
SELECT 'Remaining users (should be only admin):' as status;
SELECT id, name, email, role, is_admin FROM public.profiles;

-- Step 5: Show auth users
SELECT 'Auth users remaining:' as status;
SELECT id, email, created_at FROM auth.users;

SELECT 'Database cleaned! Only admin user remains.' as status;
