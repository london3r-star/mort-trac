import { supabase } from '../lib/supabase';
import { User, Application, ApplicationStatus, Role, ApplicationHistory } from '../types';

// =====================================================
// USER SERVICE
// =====================================================

export const createUserProfile = async (
  userId: string,
  name: string,
  email: string,
  role: Role,
  additionalData?: {
    contactNumber?: string;
    currentAddress?: string;
    companyName?: string;
    isAdmin?: boolean;
    isTeamManager?: boolean;
    isBrokerAdmin?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name,
      email,
      role,
      contact_number: additionalData?.contactNumber,
      current_address: additionalData?.currentAddress,
      company_name: additionalData?.companyName,
      is_admin: additionalData?.isAdmin || false,
      is_team_manager: additionalData?.isTeamManager || false,
      is_broker_admin: additionalData?.isBrokerAdmin || false,
    })
    .select()
    .single();

  return { data, error };
};

// Create a simple client profile without auth user (for application clients)
export const createClientProfile = async (
  name: string,
  email: string,
  password: string,
  contactNumber?: string,
  currentAddress?: string,
  createdBy?: string
) => {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'CLIENT',
      }
    }
  });

  if (authError || !authData.user) {
    return { data: null, error: authError };
  }

  // Profile will be auto-created by trigger, but update it with additional data
  const { data, error } = await supabase
    .from('profiles')
    .update({
      contact_number: contactNumber,
      current_address: currentAddress,
      created_by: createdBy,
    })
    .eq('id', authData.user.id)
    .select()
    .single();

  return { data: data || authData.user, error };
};

// Create broker by team manager or admin
export const createBroker = async (
  name: string,
  email: string,
  password: string,
  companyName: string,
  createdBy: string,
  contactNumber?: string,
  isTeamManager?: boolean,
  isBrokerAdmin?: boolean
) => {
  try {
    console.log('🔵 Starting broker creation for:', email);
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'BROKER',
        },
        emailRedirectTo: undefined,
      }
    });

    console.log('🔵 Auth signup response:', { authData, authError });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      console.error('❌ No user returned from signup');
      return { data: null, error: new Error('No user returned from signup') };
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Wait for trigger to potentially create profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Insert or update profile directly (don't rely on trigger)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: name,
        email: email,
        role: 'BROKER',
        contact_number: contactNumber,
        company_name: companyName,
        is_admin: false,
        is_team_manager: isTeamManager || false,
        is_broker_admin: isBrokerAdmin || false,
        created_by: createdBy,
        must_change_password: true,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    console.log('🔵 Profile upsert response:', { profileData, profileError });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return { data: null, error: profileError };
    }

    console.log('✅ Broker created successfully:', profileData);

    return { 
      data: {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        contactNumber: profileData.contact_number,
        companyName: profileData.company_name,
        isAdmin: profileData.is_admin,
        isTeamManager: profileData.is_team_manager,
        isBrokerAdmin: profileData.is_broker_admin,
      }, 
      error: null 
    };
  } catch (err) {
    console.error('❌ Caught error in createBroker:', err);
    return { data: null, error: err as Error };
  }
};

// Create team manager by admin
export const createTeamManager = async (
  name: string,
  email: string,
  password: string,
  companyName: string,
  createdBy: string,
  contactNumber?: string
) => {
  return createBroker(name, email, password, companyName, createdBy, contactNumber, true, false);
};

export const getUserProfile = async (userId: string): Promise<{ data: User | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return { data: null, error };

  const user: User = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as Role,
    contactNumber: data.contact_number,
    currentAddress: data.current_address,
    companyName: data.company_name,
    isAdmin: data.is_admin,
    isTeamManager: data.is_team_manager,
    isBrokerAdmin: data.is_broker_admin,
  };

  return { data: user, error: null };
};

export const getAllUsers = async (): Promise<{ data: User[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  const users: User[] = data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as Role,
    contactNumber: profile.contact_number,
    currentAddress: profile.current_address,
    companyName: profile.company_name,
    isAdmin: profile.is_admin,
    isTeamManager: profile.is_team_manager,
    isBrokerAdmin: profile.is_broker_admin,
  }));

  return { data: users, error: null };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      contact_number: updates.contactNumber,
      current_address: updates.currentAddress,
      company_name: updates.companyName,
      is_admin: updates.isAdmin,
      is_team_manager: updates.isTeamManager,
      is_broker_admin: updates.isBrokerAdmin,
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  return { error };
};

// =====================================================
// APPLICATION SERVICE
// =====================================================

export const createApplication = async (
  applicationData: Omit<Application, 'id' | 'history'>
): Promise<{ data: Application | null; error: any }> => {
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .insert({
      client_id: applicationData.clientId,
      broker_id: applicationData.brokerId,
      client_name: applicationData.clientName,
      client_email: applicationData.clientEmail,
      client_contact_number: applicationData.clientContactNumber,
      client_current_address: applicationData.clientCurrentAddress,
      property_address: applicationData.propertyAddress,
      loan_amount: applicationData.loanAmount,
      status: applicationData.status,
      mortgage_lender: applicationData.mortgageLender,
      interest_rate: applicationData.interestRate,
      interest_rate_expiry_date: applicationData.interestRateExpiryDate,
      solicitor_firm_name: applicationData.solicitor.firmName,
      solicitor_name: applicationData.solicitor.solicitorName,
      solicitor_contact_number: applicationData.solicitor.contactNumber,
      solicitor_email: applicationData.solicitor.email,
      notes: applicationData.notes,
    })
    .select()
    .single();

  if (appError) return { data: null, error: appError };

  // Create initial history entry
  const { error: historyError } = await supabase
    .from('application_history')
    .insert({
      application_id: appData.id,
      status: applicationData.status,
      date: new Date().toISOString(),
    });

  if (historyError) return { data: null, error: historyError };

  // Fetch the complete application with history
  return getApplicationById(appData.id);
};

export const getApplicationById = async (applicationId: string): Promise<{ data: Application | null; error: any }> => {
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (appError) return { data: null, error: appError };

  const { data: historyData, error: historyError } = await supabase
    .from('application_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('date', { ascending: true });

  if (historyError) return { data: null, error: historyError };

  const application: Application = {
    id: appData.id,
    clientId: appData.client_id,
    brokerId: appData.broker_id,
    clientName: appData.client_name,
    clientEmail: appData.client_email,
    clientContactNumber: appData.client_contact_number,
    clientCurrentAddress: appData.client_current_address,
    propertyAddress: appData.property_address,
    loanAmount: parseFloat(appData.loan_amount),
    status: appData.status as ApplicationStatus,
    mortgageLender: appData.mortgage_lender,
    interestRate: parseFloat(appData.interest_rate),
    interestRateExpiryDate: appData.interest_rate_expiry_date,
    solicitor: {
      firmName: appData.solicitor_firm_name,
      solicitorName: appData.solicitor_name,
      contactNumber: appData.solicitor_contact_number,
      email: appData.solicitor_email,
    },
    history: historyData.map(h => ({
      status: h.status as ApplicationStatus,
      date: h.date,
    })),
    notes: appData.notes,
  };

  return { data: application, error: null };
};

export const getAllApplications = async (): Promise<{ data: Application[] | null; error: any }> => {
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (appsError) return { data: null, error: appsError };

  // Fetch history for all applications
  const applications: Application[] = [];
  for (const appData of appsData) {
    const { data: historyData } = await supabase
      .from('application_history')
      .select('*')
      .eq('application_id', appData.id)
      .order('date', { ascending: true });

    applications.push({
      id: appData.id,
      clientId: appData.client_id,
      brokerId: appData.broker_id,
      clientName: appData.client_name,
      clientEmail: appData.client_email,
      clientContactNumber: appData.client_contact_number,
      clientCurrentAddress: appData.client_current_address,
      propertyAddress: appData.property_address,
      loanAmount: parseFloat(appData.loan_amount),
      status: appData.status as ApplicationStatus,
      mortgageLender: appData.mortgage_lender,
      interestRate: parseFloat(appData.interest_rate),
      interestRateExpiryDate: appData.interest_rate_expiry_date,
      solicitor: {
        firmName: appData.solicitor_firm_name,
        solicitorName: appData.solicitor_name,
        contactNumber: appData.solicitor_contact_number,
        email: appData.solicitor_email,
      },
      history: historyData?.map(h => ({
        status: h.status as ApplicationStatus,
        date: h.date,
      })) || [],
      notes: appData.notes,
    });
  }

  return { data: applications, error: null };
};

export const getApplicationsByBrokerId = async (brokerId: string): Promise<{ data: Application[] | null; error: any }> => {
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .eq('broker_id', brokerId)
    .order('created_at', { ascending: false });

  if (appsError) return { data: null, error: appsError };

  const applications: Application[] = [];
  for (const appData of appsData) {
    const { data: historyData } = await supabase
      .from('application_history')
      .select('*')
      .eq('application_id', appData.id)
      .order('date', { ascending: true });

    applications.push({
      id: appData.id,
      clientId: appData.client_id,
      brokerId: appData.broker_id,
      clientName: appData.client_name,
      clientEmail: appData.client_email,
      clientContactNumber: appData.client_contact_number,
      clientCurrentAddress: appData.client_current_address,
      propertyAddress: appData.property_address,
      loanAmount: parseFloat(appData.loan_amount),
      status: appData.status as ApplicationStatus,
      mortgageLender: appData.mortgage_lender,
      interestRate: parseFloat(appData.interest_rate),
      interestRateExpiryDate: appData.interest_rate_expiry_date,
      solicitor: {
        firmName: appData.solicitor_firm_name,
        solicitorName: appData.solicitor_name,
        contactNumber: appData.solicitor_contact_number,
        email: appData.solicitor_email,
      },
      history: historyData?.map(h => ({
        status: h.status as ApplicationStatus,
        date: h.date,
      })) || [],
      notes: appData.notes,
    });
  }

  return { data: applications, error: null };
};

export const getApplicationsByClientId = async (clientId: string): Promise<{ data: Application | null; error: any }> => {
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (appsError) return { data: null, error: appsError };
  if (!appsData) return { data: null, error: null };

  const { data: historyData } = await supabase
    .from('application_history')
    .select('*')
    .eq('application_id', appsData.id)
    .order('date', { ascending: true });

  const application: Application = {
    id: appsData.id,
    clientId: appsData.client_id,
    brokerId: appsData.broker_id,
    clientName: appsData.client_name,
    clientEmail: appsData.client_email,
    clientContactNumber: appsData.client_contact_number,
    clientCurrentAddress: appsData.client_current_address,
    propertyAddress: appsData.property_address,
    loanAmount: parseFloat(appsData.loan_amount),
    status: appsData.status as ApplicationStatus,
    mortgageLender: appsData.mortgage_lender,
    interestRate: parseFloat(appsData.interest_rate),
    interestRateExpiryDate: appsData.interest_rate_expiry_date,
    solicitor: {
      firmName: appsData.solicitor_firm_name,
      solicitorName: appsData.solicitor_name,
      contactNumber: appsData.solicitor_contact_number,
      email: appsData.solicitor_email,
    },
    history: historyData?.map(h => ({
      status: h.status as ApplicationStatus,
      date: h.date,
    })) || [],
    notes: appsData.notes,
  };

  return { data: application, error: null };
};

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>
): Promise<{ data: Application | null; error: any }> => {
  const updateData: any = {
    client_name: updates.clientName,
    client_email: updates.clientEmail,
    client_contact_number: updates.clientContactNumber,
    client_current_address: updates.clientCurrentAddress,
    property_address: updates.propertyAddress,
    loan_amount: updates.loanAmount,
    status: updates.status,
    mortgage_lender: updates.mortgageLender,
    interest_rate: updates.interestRate,
    interest_rate_expiry_date: updates.interestRateExpiryDate,
    notes: updates.notes,
  };

  if (updates.solicitor) {
    updateData.solicitor_firm_name = updates.solicitor.firmName;
    updateData.solicitor_name = updates.solicitor.solicitorName;
    updateData.solicitor_contact_number = updates.solicitor.contactNumber;
    updateData.solicitor_email = updates.solicitor.email;
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId);

  if (updateError) return { data: null, error: updateError };

  return getApplicationById(applicationId);
};

export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<{ data: Application | null; error: any }> => {
  // Update application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId);

  if (updateError) return { data: null, error: updateError };

  // Add history entry
  const { error: historyError } = await supabase
    .from('application_history')
    .insert({
      application_id: applicationId,
      status: newStatus,
      date: new Date().toISOString(),
    });

  if (historyError) return { data: null, error: historyError };

  return getApplicationById(applicationId);
};

export const deleteApplication = async (applicationId: string) => {
  // Delete history first (CASCADE should handle this, but being explicit)
  await supabase
    .from('application_history')
    .delete()
    .eq('application_id', applicationId);

  // Delete application
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId);

  return { error };
};

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export const subscribeToApplications = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('applications_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'applications' },
      callback
    )
    .subscribe();

  return subscription;
};

export const subscribeToProfiles = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('profiles_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      callback
    )
    .subscribe();

  return subscription;
};
