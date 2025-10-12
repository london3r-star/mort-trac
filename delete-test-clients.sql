-- =====================================================
-- DELETE SPECIFIC CLIENTS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Show clients before deletion
SELECT 'Clients before deletion:' as status;
SELECT id, name, email, role 
FROM public.profiles 
WHERE name IN ('Test Client', 'Johnny Bravo')
ORDER BY name;

-- Step 2: Show applications that will be deleted
SELECT 'Applications that will be deleted:' as status;
SELECT a.id, a.client_name, a.property_address, a.status
FROM public.applications a
INNER JOIN public.profiles p ON a.client_id = p.id
WHERE p.name IN ('Test Client', 'Johnny Bravo');

-- Step 3: Delete the clients (will cascade delete applications and history)
DELETE FROM public.profiles
WHERE name IN ('Test Client', 'Johnny Bravo')
AND role = 'CLIENT';

-- Step 4: Also delete from auth.users if they have auth accounts
DELETE FROM auth.users
WHERE email IN (
    SELECT email FROM public.profiles 
    WHERE name IN ('Test Client', 'Johnny Bravo')
);

-- Step 5: Verify deletion
SELECT 'Verification - clients should be gone:' as status;
SELECT COUNT(*) as remaining_clients
FROM public.profiles 
WHERE name IN ('Test Client', 'Johnny Bravo');

-- Step 6: Show remaining clients
SELECT 'Remaining clients in database:' as status;
SELECT id, name, email, role, created_at
FROM public.profiles
WHERE role = 'CLIENT'
ORDER BY created_at DESC
LIMIT 10;

-- Note: This will also delete:
-- - Any applications created for these clients
-- - Application history for those applications
-- - This is due to CASCADE DELETE constraints
