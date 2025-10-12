-- =====================================================
-- VERIFY AND FIX ADMIN USER
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if user exists in auth.users
SELECT 'Checking auth.users table:' as step;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'london3r@gmail.com';

-- Step 2: Check if profile exists
SELECT 'Checking profiles table:' as step;
SELECT id, name, email, role, is_admin, company_name 
FROM public.profiles 
WHERE email = 'london3r@gmail.com';

-- Step 3: If profile doesn't exist, create it
-- This will insert the profile using the auth user's ID
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = 'london3r@gmail.com';
    
    IF user_id IS NOT NULL THEN
        -- Insert or update profile
        INSERT INTO public.profiles (
            id, 
            name, 
            email, 
            role, 
            is_admin, 
            is_team_manager, 
            is_broker_admin, 
            company_name
        ) VALUES (
            user_id,
            'Admin User',
            'london3r@gmail.com',
            'BROKER',
            true,
            true,
            true,
            'Mortgage Tracker Pro'
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'BROKER',
            is_admin = true,
            is_team_manager = true,
            is_broker_admin = true,
            company_name = 'Mortgage Tracker Pro',
            name = 'Admin User';
        
        RAISE NOTICE 'Profile created/updated for user ID: %', user_id;
    ELSE
        RAISE NOTICE 'No auth user found with email london3r@gmail.com';
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT 'Verification - Profile should now exist:' as step;
SELECT p.id, p.name, p.email, p.role, p.is_admin, p.company_name,
       CASE WHEN au.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_auth_user
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'london3r@gmail.com';

-- Step 5: Confirm email if not confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'london3r@gmail.com'
AND email_confirmed_at IS NULL;

SELECT 'Email confirmation status:' as step;
SELECT email, email_confirmed_at, 
       CASE WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED' ELSE 'NOT CONFIRMED' END as status
FROM auth.users
WHERE email = 'london3r@gmail.com';
