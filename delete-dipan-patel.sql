-- Delete Dipan Patel from database

-- Step 1: Find Dipan Patel
SELECT 'Finding Dipan Patel:' as status;
SELECT id, email, created_at FROM auth.users WHERE email LIKE '%dipan%' OR email LIKE '%patel%';

-- Step 2: Delete from profiles (will cascade delete applications)
DELETE FROM public.profiles 
WHERE name LIKE '%Dipan%' AND name LIKE '%Patel%';

-- Step 3: Delete from auth.users
DELETE FROM auth.users 
WHERE email LIKE '%dipan%' OR email LIKE '%patel%';

-- Step 4: Verify deletion
SELECT 'Verification - should be empty:' as status;
SELECT COUNT(*) as count FROM auth.users WHERE email LIKE '%dipan%' OR email LIKE '%patel%';
SELECT COUNT(*) as count FROM public.profiles WHERE name LIKE '%Dipan%' AND name LIKE '%Patel%';

SELECT 'Dipan Patel deleted!' as status;
