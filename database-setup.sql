-- =====================================================
-- MORTGAGE TRACKER PRO - DATABASE SETUP
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This will create all necessary tables and security policies
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- This extends the auth.users table with additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('CLIENT', 'BROKER')),
    contact_number TEXT,
    current_address TEXT,
    company_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_team_manager BOOLEAN DEFAULT FALSE,
    is_broker_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_contact_number TEXT,
    client_current_address TEXT,
    property_address TEXT NOT NULL,
    loan_amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'AWAITING_DOCUMENTS',
        'AIP_IN_PROGRESS',
        'AIP_APPROVED',
        'FULL_APPLICATION_SUBMITTED',
        'MORTGAGE_OFFERED',
        'CONTRACTS_EXCHANGED',
        'PURCHASE_COMPLETED',
        'RATE_EXPIRY_REMINDER_SENT'
    )),
    mortgage_lender TEXT NOT NULL,
    interest_rate NUMERIC NOT NULL,
    interest_rate_expiry_date DATE NOT NULL,
    solicitor_firm_name TEXT NOT NULL,
    solicitor_name TEXT NOT NULL,
    solicitor_contact_number TEXT NOT NULL,
    solicitor_email TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPLICATION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.application_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_applications_client_id ON public.applications(client_id);
CREATE INDEX IF NOT EXISTS idx_applications_broker_id ON public.applications(broker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_application_history_application_id ON public.application_history(application_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Brokers can view all profiles in their company
CREATE POLICY "Brokers can view company profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role = 'BROKER'
            AND (is_admin = true OR is_team_manager = true OR is_broker_admin = true)
        )
    );

-- Applications Policies
-- Clients can view their own applications
CREATE POLICY "Clients can view own applications"
    ON public.applications FOR SELECT
    USING (client_id = auth.uid());

-- Brokers can view their own applications
CREATE POLICY "Brokers can view own applications"
    ON public.applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'BROKER'
        )
        AND (
            broker_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.profiles p1
                INNER JOIN public.profiles p2 ON p1.company_name = p2.company_name
                WHERE p1.id = auth.uid() 
                AND p2.id = broker_id
                AND p1.role = 'BROKER'
                AND (p1.is_admin = true OR p1.is_team_manager = true OR p1.is_broker_admin = true)
            )
        )
    );

-- Brokers can insert applications
CREATE POLICY "Brokers can insert applications"
    ON public.applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'BROKER'
        )
    );

-- Brokers can update their applications
CREATE POLICY "Brokers can update applications"
    ON public.applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'BROKER'
        )
        AND (
            broker_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.profiles p1
                INNER JOIN public.profiles p2 ON p1.company_name = p2.company_name
                WHERE p1.id = auth.uid() 
                AND p2.id = broker_id
                AND p1.role = 'BROKER'
                AND (p1.is_admin = true OR p1.is_team_manager = true OR p1.is_broker_admin = true)
            )
        )
    );

-- Brokers can delete their applications
CREATE POLICY "Brokers can delete applications"
    ON public.applications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'BROKER'
        )
        AND (
            broker_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.profiles p1
                INNER JOIN public.profiles p2 ON p1.company_name = p2.company_name
                WHERE p1.id = auth.uid() 
                AND p2.id = broker_id
                AND p1.role = 'BROKER'
                AND (p1.is_admin = true OR p1.is_team_manager = true OR p1.is_broker_admin = true)
            )
        )
    );

-- Application History Policies
-- Users can view history for applications they can see
CREATE POLICY "Users can view application history"
    ON public.application_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE id = application_id
            AND (client_id = auth.uid() OR broker_id = auth.uid())
        )
    );

-- Brokers can insert history
CREATE POLICY "Brokers can insert history"
    ON public.application_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'BROKER'
        )
    );

-- =====================================================
-- FUNCTION: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, contact_number, current_address, company_name, is_admin, is_team_manager, is_broker_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
        NEW.raw_user_meta_data->>'contact_number',
        NEW.raw_user_meta_data->>'current_address',
        NEW.raw_user_meta_data->>'company_name',
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'is_team_manager')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'is_broker_admin')::boolean, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================
-- Next step: Create your admin user by signing up through the app
-- Then run the admin-user-setup.sql script with your user ID
