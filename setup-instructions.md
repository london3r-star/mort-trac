# Mortgage Tracker Pro - Database Setup Instructions

## Step 1: Run Database Schema Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `database-setup.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create:
- `profiles` table for user information
- `applications` table for mortgage applications
- `application_history` table for status tracking
- Row Level Security (RLS) policies for data protection
- Automatic triggers for user profile creation

## Step 2: Create Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase dashboard, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - **Email**: `london3r@gmail.com`
   - **Password**: `daredevil7!`
   - **Auto Confirm User**: ✅ (check this box)
4. Click **Create user**
5. Copy the **User ID** (UUID) that appears
6. Go back to **SQL Editor**
7. Run this SQL query (replace `YOUR_USER_ID` with the copied ID):

```sql
-- Update the admin user profile
UPDATE public.profiles
SET 
    name = 'Admin User',
    role = 'BROKER',
    is_admin = true,
    company_name = 'Mortgage Tracker Pro'
WHERE id = 'YOUR_USER_ID';
```

### Option B: Using SQL Script (Alternative)

If you prefer to create the user directly through SQL:

1. Go to **SQL Editor** in Supabase
2. Run the following script:

```sql
-- Insert admin user into auth.users
-- Note: This requires admin privileges and may not work in all Supabase configurations
-- If this fails, use Option A above

DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'london3r@gmail.com',
        crypt('daredevil7!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Admin User","role":"BROKER","is_admin":true,"company_name":"Mortgage Tracker Pro"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;

    -- Profile will be created automatically by trigger
    
    RAISE NOTICE 'Admin user created with ID: %', new_user_id;
END $$;
```

## Step 3: Verify Setup

1. Open your application
2. Try logging in with:
   - **Email**: `london3r@gmail.com`
   - **Password**: `daredevil7!`
3. You should see the broker dashboard with full admin privileges

## Admin User Privileges

The admin user has the following capabilities:
- ✅ Full admin access (`is_admin = true`)
- ✅ Can view all applications across all companies
- ✅ Can manage all brokers and users
- ✅ Can create, edit, and delete applications
- ✅ Can view any broker's dashboard
- ✅ Company: "Mortgage Tracker Pro"
- ✅ Role: BROKER (with admin privileges)

## Troubleshooting

### If you can't log in:
1. Check that the email is confirmed in **Authentication** > **Users**
2. Verify the user exists in the `profiles` table:
   ```sql
   SELECT * FROM public.profiles WHERE email = 'london3r@gmail.com';
   ```
3. Make sure `is_admin = true` for this user

### If RLS policies block access:
1. Verify the policies are created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'applications', 'application_history');
   ```
2. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

### To reset the admin password:
1. Go to **Authentication** > **Users**
2. Find `london3r@gmail.com`
3. Click the three dots (•••) > **Reset Password**
4. Or use the forgot password feature in the app

## Next Steps

After setup:
1. **Log in** with the admin credentials
2. **Create test data**: Add sample brokers and applications
3. **Test features**: Try creating, editing, and deleting applications
4. **Invite users**: Add other brokers or clients through the registration page

## Support

If you encounter any issues:
- Check browser console for error messages
- Review Supabase logs in **Logs** > **Database** or **Logs** > **Auth**
- Ensure your Supabase project is on a plan that supports the required features
