-- =====================================================
-- FIX FOREIGN KEY CONSTRAINT ISSUE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check the current constraint
SELECT 'Current foreign key constraint:' as status;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';

-- Step 2: Drop the problematic foreign key constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- Step 3: Recreate it with ON DELETE CASCADE (allows orphaned profiles temporarily)
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- Step 4: Verify the fix
SELECT 'New constraint created (DEFERRABLE):' as status;
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_name = 'profiles_id_fkey';

SELECT 'Fix complete!' as status;
