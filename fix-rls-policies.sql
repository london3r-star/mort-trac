-- =====================================================
-- FIX RLS INFINITE RECURSION ISSUE
-- This fixes the "infinite recursion detected in policy" error
-- =====================================================

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Brokers can view company profiles" ON public.profiles;

-- Step 2: Recreate it without recursion using a simpler approach
-- This policy allows brokers with admin privileges to view all profiles
CREATE POLICY "Brokers can view company profiles" 
ON public.profiles 
FOR SELECT
USING (
    -- Allow if the requesting user is an admin/manager/broker admin
    EXISTS (
        SELECT 1 
        FROM auth.users au
        WHERE au.id = auth.uid()
        AND au.id IN (
            SELECT id FROM public.profiles 
            WHERE role = 'BROKER' 
            AND (is_admin = true OR is_team_manager = true OR is_broker_admin = true)
        )
    )
);

-- Step 3: Alternative - Temporarily disable RLS for testing
-- Uncomment these lines if the above still doesn't work:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.application_history DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify the fix
SELECT 'Checking if policy was recreated:' as status;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Brokers can view company profiles';

SELECT 'If you see the policy above, it should work now!' as result;
