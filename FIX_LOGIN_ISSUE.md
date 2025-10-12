# 🔧 Fix Login Issue - Profile Not Found

## 🐛 Problem

You're seeing the login page but when you enter credentials, nothing happens and you stay on the login page. No error message appears.

**Root Cause**: The user exists in Supabase authentication (`auth.users` table) but the profile record is missing from the `profiles` table.

---

## ✅ Quick Fix (1 minute)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/xuwhawmzzfotzhxycxpm
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Fix Script

1. Open file: `/app/verify-and-fix-user.sql`
2. **Copy ALL content**
3. **Paste** into Supabase SQL Editor
4. Click **Run**

**What it does:**
- ✅ Checks if user exists in auth.users
- ✅ Checks if profile exists in profiles table
- ✅ Creates/updates the profile record
- ✅ Links the profile to the auth user
- ✅ Confirms the email
- ✅ Shows verification results

### Step 3: Test Login

1. **Refresh your app** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Login with**:
   - Email: `london3r@gmail.com`
   - Password: `daredevil7!`
3. **Should work now!** 🎉

---

## 🔍 Why Did This Happen?

When you ran `complete-setup.sql`, one of two things happened:

1. **Option A**: The script created the user in `auth.users` but the trigger to create the profile failed silently
2. **Option B**: The profile creation was skipped due to a conflict or permission issue

The `verify-and-fix-user.sql` script fixes this by:
- Finding the authenticated user's ID
- Creating the profile record with that ID
- Ensuring they match

---

## 🧪 How to Verify It's Fixed

After running the script, you should see output like:

```
step: Checking auth.users table
id: [some-uuid]
email: london3r@gmail.com
email_confirmed_at: [timestamp]

step: Checking profiles table
id: [same-uuid]
name: Admin User
email: london3r@gmail.com
role: BROKER
is_admin: true

step: Verification - Profile should now exist
has_auth_user: YES
```

If you see `has_auth_user: YES`, you're all set!

---

## 🔧 Alternative: Manual Fix via Dashboard

If the script doesn't work:

### Option 1: Create Profile Manually

1. Get the user ID:
   ```sql
   SELECT id FROM auth.users WHERE email = 'london3r@gmail.com';
   ```
2. Copy the ID
3. Insert profile:
   ```sql
   INSERT INTO public.profiles (id, name, email, role, is_admin, company_name)
   VALUES (
       'PASTE_USER_ID_HERE',
       'Admin User',
       'london3r@gmail.com',
       'BROKER',
       true,
       'Mortgage Tracker Pro'
   );
   ```

### Option 2: Delete and Recreate User

1. Delete existing user:
   - Go to **Authentication** > **Users**
   - Find `london3r@gmail.com`
   - Click three dots > Delete
2. Run `complete-setup.sql` again
3. Make sure it completes without errors

---

## 📊 Check Browser Console

If it still doesn't work, check the browser console (F12):

**Look for these messages:**
- `"No profile found for user: [uuid]"` ← This confirms the issue
- `"Database query failed"` ← Database connection issue
- `"Invalid login credentials"` ← Wrong password or user doesn't exist

---

## 🎯 Expected Flow

**Correct Login Flow:**
1. Enter email + password
2. Supabase authenticates user ✅
3. App fetches profile from `profiles` table ✅
4. Sets user state ✅
5. Redirects to dashboard ✅

**Your Current Flow:**
1. Enter email + password
2. Supabase authenticates user ✅
3. App fetches profile from `profiles` table ❌ (not found)
4. App signs user out (security measure)
5. Stays on login page

---

## ✨ After Fix

Once fixed, you'll:
- ✅ Login successfully
- ✅ See the broker dashboard
- ✅ Have full admin privileges
- ✅ Can create applications
- ✅ Can manage users

---

## 🆘 Still Not Working?

If after running `verify-and-fix-user.sql` you still can't login:

1. **Check script output** - Look for error messages
2. **Verify tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. **Check RLS policies aren't blocking**:
   ```sql
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   ```
   (Try login, then re-enable)

4. **Open browser console** (F12) and look for red error messages

5. **Contact support** with:
   - Browser console errors
   - SQL script output
   - Supabase project ID: `xuwhawmzzfotzhxycxpm`

---

**Quick Link to SQL Editor:**
👉 https://supabase.com/dashboard/project/xuwhawmzzfotzhxycxpm/editor
