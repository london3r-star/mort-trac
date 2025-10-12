# 🚀 Quick Start Guide

## Welcome to Your Mortgage Tracker Pro!

Your application is **running and ready**! Follow these 3 simple steps to complete the setup.

---

## ⚡ Step 1: Setup Database (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Run Setup Script**
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**
   - Open file: `/app/database-setup.sql`
   - Copy ALL content
   - Paste into SQL editor
   - Click **Run**
   - ✅ Wait for "Success. No rows returned"

---

## 👤 Step 2: Create Admin User (1 minute)

### Option A: Dashboard Method (Easiest)

1. In Supabase, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - Email: `london3r@gmail.com`
   - Password: `daredevil7!`
   - ✅ Check "Auto Confirm User"
4. Click **Create user**
5. **Copy the User ID** (the long UUID)
6. Go back to **SQL Editor**
7. Run this (replace `YOUR_USER_ID`):

```sql
UPDATE public.profiles
SET 
    name = 'Admin User',
    role = 'BROKER',
    is_admin = true,
    company_name = 'Mortgage Tracker Pro'
WHERE id = 'YOUR_USER_ID';
```

### Option B: Quick SQL Method

1. Go to **SQL Editor**
2. Run this complete script:

```sql
-- This creates the admin user directly
-- Note: May require elevated Supabase permissions

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
    confirmation_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'london3r@gmail.com',
    crypt('daredevil7!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    ''
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Then update the profile (replace the ID if needed)
UPDATE public.profiles
SET 
    role = 'BROKER',
    is_admin = true,
    company_name = 'Mortgage Tracker Pro'
WHERE email = 'london3r@gmail.com';
```

---

## 🎉 Step 3: Login & Start Using (30 seconds)

1. **Open your app** (should already be running)
2. **Login with**:
   ```
   Email: london3r@gmail.com
   Password: daredevil7!
   ```
3. **You're in!** 🎊

---

## ✨ What You Can Do Now

### As Admin Broker
- ✅ Create mortgage applications
- ✅ Manage all applications across the system
- ✅ Add and manage brokers
- ✅ Track application progress
- ✅ Generate reports
- ✅ Full system access

### First Actions to Try
1. Click **New Application** to create your first mortgage application
2. Fill in client details, loan amount, property address
3. Add solicitor information
4. Watch it appear in your pipeline!
5. Try updating the status
6. Add notes to track progress

---

## 🎯 Your Admin Credentials

```
Email: london3r@gmail.com
Password: daredevil7!
```

**Important**: Change this password after first login!
- Click your name (top right)
- Go to Profile settings
- Update password

---

## 📊 What's Different Now?

### Before (Demo Mode)
- ❌ Fake demo users
- ❌ No real database
- ❌ Data lost on refresh
- ❌ Mock data only

### Now (Production Ready)
- ✅ Real authentication
- ✅ Supabase database
- ✅ Persistent data
- ✅ Multi-user support
- ✅ Real-time updates
- ✅ Secure & scalable

---

## 🐛 Quick Troubleshooting

### Can't see SQL Editor?
- Make sure you're logged into Supabase
- Select the correct project
- Look for SQL Editor in left sidebar

### Script fails to run?
- Make sure you copied the ENTIRE `database-setup.sql` file
- Check for syntax errors in the SQL editor
- Try running smaller sections if needed

### Can't login?
1. Check email is confirmed in Supabase
2. Run this to verify:
```sql
SELECT * FROM public.profiles WHERE email = 'london3r@gmail.com';
```
3. Make sure `is_admin = true`

### Still having issues?
- Check browser console (F12)
- Look at Supabase logs: **Logs** > **Database**
- Review `DATABASE_README.md` for detailed troubleshooting

---

## 📚 Need More Details?

- **Full Documentation**: See `DATABASE_README.md`
- **Detailed Setup**: See `setup-instructions.md`
- **Supabase Help**: https://supabase.com/docs

---

## 🎊 That's It!

You're all set! Your Mortgage Tracker Pro is now:
- ✅ Connected to real database
- ✅ Secured with authentication
- ✅ Ready for production use
- ✅ Scalable for multiple users

**Enjoy your new mortgage tracking system!** 🏠💼

---

**Questions?** Check the troubleshooting section above or review the full documentation in `DATABASE_README.md`.
