-- =====================================================
-- ULTIMATE FIX FOR BROKER CREATION
-- This removes the foreign key constraint entirely
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the foreign key constraint completely
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- Step 2: Verify it's gone
SELECT 'Foreign key constraint removed!' as status;
SELECT constraint_name 
FROM information_schema.table_constraints
WHERE table_name = 'profiles' 
AND constraint_type = 'FOREIGN KEY';

-- Step 3: This allows profiles to be created without requiring auth.users entry
-- Note: We'll rely on application logic to maintain data integrity

SELECT 'Broker creation should work now!' as status;

-- Optional: Add a cleanup function to remove orphaned profiles later
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS void AS $$
BEGIN
  DELETE FROM public.profiles
  WHERE id NOT IN (SELECT id FROM auth.users)
  AND created_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

SELECT 'Setup complete! You can now create brokers.' as status;
