-- Check if Dipan Patel exists
SELECT 'Checking auth.users:' as status;
SELECT id, email, created_at FROM auth.users WHERE email LIKE '%dipan%' OR email LIKE '%patel%';

SELECT 'Checking profiles:' as status;
SELECT id, name, email, role, company_name, created_at FROM public.profiles WHERE name LIKE '%Dipan%' OR name LIKE '%Patel%';

-- Clean up any orphaned auth users without profiles
SELECT 'Cleaning up orphaned users:' as status;
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
AND email NOT LIKE '%london3r%';
