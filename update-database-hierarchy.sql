-- =====================================================
-- UPDATE DATABASE FOR USER HIERARCHY
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add new columns to profiles table for hierarchy
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_at_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.created_by IS 'ID of the user who created this profile (Admin creates Team Managers, Team Managers create Brokers)';

-- Update existing admin user to have no creator (self-created)
UPDATE public.profiles
SET created_by = NULL
WHERE is_admin = true;

-- Verify the changes
SELECT 'Schema updated successfully!' as status;
SELECT 
    id, 
    name, 
    email, 
    role, 
    is_admin, 
    is_team_manager, 
    company_name,
    created_by,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
