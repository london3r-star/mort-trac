-- =====================================================
-- FIX USER CREATION ISSUES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Update the trigger function to handle all metadata properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile for new user
    INSERT INTO public.profiles (
        id, 
        name, 
        email, 
        role, 
        contact_number, 
        current_address, 
        company_name, 
        is_admin, 
        is_team_manager, 
        is_broker_admin,
        must_change_password
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
        NEW.raw_user_meta_data->>'contact_number',
        NEW.raw_user_meta_data->>'current_address',
        NEW.raw_user_meta_data->>'company_name',
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'is_team_manager')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'is_broker_admin')::boolean, false),
        true -- New users must change password by default
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        company_name = EXCLUDED.company_name,
        is_team_manager = EXCLUDED.is_team_manager,
        is_broker_admin = EXCLUDED.is_broker_admin;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.applications TO anon, authenticated;
GRANT ALL ON public.application_history TO anon, authenticated;

-- Step 4: Verify trigger exists
SELECT 'Trigger verification:' as status;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Setup complete!' as status;
