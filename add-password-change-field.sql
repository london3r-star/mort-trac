-- =====================================================
-- ADD PASSWORD CHANGE TRACKING
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add column to track if user needs to change password
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Set existing users to not require password change
UPDATE public.profiles
SET must_change_password = FALSE
WHERE must_change_password IS NULL;

-- Admin should not need to change password
UPDATE public.profiles
SET must_change_password = FALSE
WHERE is_admin = TRUE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_must_change_password ON public.profiles(must_change_password);

-- Verify
SELECT 'Password change tracking added!' as status;
SELECT id, name, email, role, must_change_password 
FROM public.profiles
LIMIT 10;
