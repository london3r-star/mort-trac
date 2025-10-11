/*
  # Initial Schema for Mortgage Tracker Pro

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `role` (text: CLIENT or BROKER)
      - `contact_number` (text, optional)
      - `current_address` (text, optional)
      - `company_name` (text, optional)
      - `is_admin` (boolean, default false)
      - `is_team_manager` (boolean, default false)
      - `is_broker_admin` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `applications`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references profiles)
      - `broker_id` (uuid, references profiles)
      - `client_name` (text)
      - `client_email` (text)
      - `client_contact_number` (text)
      - `client_current_address` (text)
      - `property_address` (text)
      - `loan_amount` (numeric)
      - `status` (text)
      - `mortgage_lender` (text)
      - `interest_rate` (numeric)
      - `interest_rate_expiry_date` (date)
      - `solicitor_firm_name` (text)
      - `solicitor_name` (text)
      - `solicitor_contact_number` (text)
      - `solicitor_email` (text)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `application_history`
      - `id` (uuid, primary key)
      - `application_id` (uuid, references applications)
      - `status` (text)
      - `date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles:
      - Users can read their own profile
      - Brokers can read client profiles
      - Users can update their own profile
    - Applications:
      - Clients can read their own applications
      - Brokers can read applications they manage
      - Brokers can create and update applications
    - Application History:
      - Readable by application owner (client or broker)
      - Created automatically when application status changes

  3. Important Notes
    - Uses Supabase Auth for user authentication
    - Profiles are linked to auth.users via triggers
    - Application history tracks status changes over time
    - Role-based access control implemented via RLS
*/

-- Create enum types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'BROKER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM (
      'AWAITING_DOCUMENTS',
      'AIP_IN_PROGRESS',
      'AIP_APPROVED',
      'FULL_APPLICATION_SUBMITTED',
      'MORTGAGE_OFFERED',
      'CONTRACTS_EXCHANGED',
      'PURCHASE_COMPLETED',
      'RATE_EXPIRY_REMINDER_SENT'
    );
  END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL,
  contact_number text,
  current_address text,
  company_name text,
  is_admin boolean DEFAULT false,
  is_team_manager boolean DEFAULT false,
  is_broker_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  broker_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_contact_number text NOT NULL,
  client_current_address text NOT NULL,
  property_address text NOT NULL,
  loan_amount numeric NOT NULL,
  status application_status NOT NULL DEFAULT 'AWAITING_DOCUMENTS',
  mortgage_lender text NOT NULL,
  interest_rate numeric NOT NULL,
  interest_rate_expiry_date date NOT NULL,
  solicitor_firm_name text NOT NULL,
  solicitor_name text NOT NULL,
  solicitor_contact_number text NOT NULL,
  solicitor_email text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create application_history table
CREATE TABLE IF NOT EXISTS application_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  status application_status NOT NULL,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_client_id ON applications(client_id);
CREATE INDEX IF NOT EXISTS idx_applications_broker_id ON applications(broker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_application_history_application_id ON application_history(application_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Brokers can view client profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'CLIENT' AND EXISTS (
      SELECT 1 FROM profiles AS broker_profile
      WHERE broker_profile.id = auth.uid()
      AND broker_profile.role = 'BROKER'
    )
  );

CREATE POLICY "Brokers can view other broker profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'BROKER' AND EXISTS (
      SELECT 1 FROM profiles AS viewing_profile
      WHERE viewing_profile.id = auth.uid()
      AND viewing_profile.role = 'BROKER'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Brokers can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'BROKER'
    )
  );

-- Applications policies
CREATE POLICY "Clients can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Brokers can view applications they manage"
  ON applications FOR SELECT
  TO authenticated
  USING (broker_id = auth.uid());

CREATE POLICY "Brokers can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'BROKER'
    )
  );

CREATE POLICY "Brokers can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    broker_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'BROKER'
    )
  );

CREATE POLICY "Brokers can update applications they manage"
  ON applications FOR UPDATE
  TO authenticated
  USING (broker_id = auth.uid())
  WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can delete applications they manage"
  ON applications FOR DELETE
  TO authenticated
  USING (
    broker_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'BROKER'
    )
  );

-- Application history policies
CREATE POLICY "Users can view history of their applications"
  ON application_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_history.application_id
      AND (applications.client_id = auth.uid() OR applications.broker_id = auth.uid())
    )
  );

CREATE POLICY "Brokers can insert application history"
  ON application_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_history.application_id
      AND applications.broker_id = auth.uid()
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'CLIENT')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically add history entry when application status changes
CREATE OR REPLACE FUNCTION add_application_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO application_history (application_id, status, date)
    VALUES (NEW.id, NEW.status, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for application history
DROP TRIGGER IF EXISTS track_application_status_changes ON applications;
CREATE TRIGGER track_application_status_changes
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION add_application_history();