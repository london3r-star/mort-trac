-- =====================================================
-- FORCE ADD must_change_password COLUMN
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if column exists
SELECT 'Checking if column exists:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'must_change_password';

-- Step 2: Drop column if it exists (to recreate it fresh)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS must_change_password CASCADE;

-- Step 3: Add column fresh
ALTER TABLE public.profiles 
ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE NOT NULL;

-- Step 4: Set all existing users to not require password change
UPDATE public.profiles
SET must_change_password = FALSE;

-- Step 5: Set admin to not require password change
UPDATE public.profiles
SET must_change_password = FALSE
WHERE is_admin = TRUE;

-- Step 6: Create index
DROP INDEX IF EXISTS idx_profiles_must_change_password;
CREATE INDEX idx_profiles_must_change_password ON public.profiles(must_change_password);

-- Step 7: Verify column exists now
SELECT 'Column verification (should show must_change_password):' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'must_change_password';

-- Step 8: Test query to ensure it works
SELECT 'Test query on profiles:' as status;
SELECT id, name, email, role, must_change_password
FROM public.profiles
LIMIT 5;

SELECT 'Setup complete! Column added successfully.' as status;
