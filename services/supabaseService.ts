import { supabase } from '../lib/supabase';
import { User, Application, ApplicationStatus, Role, ApplicationHistory } from '../types';

// =====================================================
// USER SERVICE
// =====================================================

// Add this function to your supabaseService.ts file (in the USER SERVICE section)

export const adminResetUserPassword = async (
  userId: string,
  newPassword: string
) => {
  try {
    console.log('🔵 Admin resetting password for user:', userId);
    
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { userId, newPassword }
    });

    if (error) {
      console.error('❌ Password update error:', error);
      return { error };
    }

    console.log('✅ Password reset successful');
    return { error: null };
  } catch (err) {
    console.error('❌ Exception:', err);
    return { error: err as Error };
  }
};

// Add this function to your supabaseService.ts file (near the sendEmailToClient function)

export const sendPortalInvite = async (
  recipientEmail: string,
  subject: string,
  body: string,
  senderName: string,
  senderEmail: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Extract the password from the email body
    const passwordMatch = body.match(/Password:\s*(.+)/);
    const temporaryPassword = passwordMatch ? passwordMatch[1].trim() : null;

    if (!temporaryPassword) {
      throw new Error('Could not extract temporary password from email body');
    }

    // Reset the client's password to the temporary password
    await resetClientPassword(recipientEmail, temporaryPassword);

    // Now send the email with the portal invite
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject,
        html: body.replace(/\n/g, '<br>'),
        senderName,
        senderEmail,
      },
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendPortalInvite:', error);
    return { success: false, error };
  }
};

    if (error) {
      console.error('Error invoking send-email function:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendPortalInvite:', error);
    return { success: false, error };
  }
};

export const sendEmailToClient = async (
  to: string,
  subject: string,
  body: string,
  fromName?: string,
  fromEmail?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        body,
        fromName,
        fromEmail,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception sending email:', err);
    return { success: false, error: err };
  }
};

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

// Replace your createClientProfile function in supabaseService.ts with this improved version:

// Replace the createClientProfile function in supabaseService.ts with this:

// Replace your createClientProfile function with this ultra-fixed version:

export const createClientProfile = async (
  name: string,
  email: string,
  password: string,
  contactNumber?: string,
  currentAddress?: string,
  createdBy?: string
) => {
  // Store the tokens in variables that won't be affected by session changes
  let savedAccessToken: string | undefined;
  let savedRefreshToken: string | undefined;
  
  try {
    console.log('🔵 Creating client profile for:', email);
    
    // Save current session BEFORE creating the client
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession) {
      console.error('❌ No current session found');
      return { data: null, error: new Error('No active session') };
    }
    
    // Store tokens in local variables
    savedAccessToken = currentSession.access_token;
    savedRefreshToken = currentSession.refresh_token;
    const savedUserEmail = currentSession.user.email;
    
    console.log('🔵 Saved current broker/admin session:', savedUserEmail);
    
    // Create auth user (this will auto-login as the new user)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'CLIENT',
        },
        emailRedirectTo: undefined,
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Client auth error:', authError);
      return { data: null, error: authError };
    }

    console.log('✅ Client auth user created:', authData.user.id);
    
    // IMMEDIATELY restore the broker/admin session (first attempt)
    await supabase.auth.setSession({
      access_token: savedAccessToken,
      refresh_token: savedRefreshToken,
    });
    console.log('✅ First session restore attempted');
    
    // Small delay to let it settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // VERIFY and retry if needed (up to 3 times)
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data: { session: checkSession } } = await supabase.auth.getSession();
      
      if (checkSession?.user?.email === savedUserEmail) {
        console.log(`✅ Session verified on attempt ${attempt}`);
        break;
      }
      
      console.warn(`⚠️ Session not correct on attempt ${attempt}, retrying...`);
      
      await supabase.auth.setSession({
        access_token: savedAccessToken,
        refresh_token: savedRefreshToken,
      });
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (attempt === 3) {
        console.error('❌ Failed to restore session after 3 attempts');
      }
    }
    
    // Wait for the auth user to be committed to the database
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update/create the profile with additional data
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: name,
        email: email,
        role: 'CLIENT',
        contact_number: contactNumber,
        current_address: currentAddress,
        created_by: createdBy,
        must_change_password: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Profile upsert error:', error);
      return { data: null, error };
    }

    console.log('✅ Client profile created successfully');
    
    // FINAL session restore to be absolutely sure
    await supabase.auth.setSession({
      access_token: savedAccessToken,
      refresh_token: savedRefreshToken,
    });
    console.log('✅ Final session restore completed');

    return { data: data || authData.user, error: null };
  } catch (err) {
    console.error('❌ Exception in createClientProfile:', err);
    
    // Even on error, try to restore the session
    if (savedAccessToken && savedRefreshToken) {
      await supabase.auth.setSession({
        access_token: savedAccessToken,
        refresh_token: savedRefreshToken,
      });
    }
    
    return { data: null, error: err as Error };
  }
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
    
    // Save current session to restore later
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('🔵 Saved current session');
    
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
    
    // IMPROVED: Restore session immediately without signOut
    // This prevents the flicker by maintaining the current session throughout
    if (currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
      console.log('🔵 Restored admin session immediately');
    }

    // Step 2: Wait for auth user to be fully committed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Check if trigger already created the profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    console.log('🔵 Existing profile check:', existingProfile);

    let profileData;
    let profileError;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('profiles')
        .update({
          name: name,
          contact_number: contactNumber,
          company_name: companyName,
          is_team_manager: isTeamManager || false,
          is_broker_admin: isBrokerAdmin || false,
          created_by: createdBy,
          must_change_password: true,
        })
        .eq('id', authData.user.id)
        .select()
        .single();
      
      profileData = result.data;
      profileError = result.error;
    } else {
      // Insert new profile
      const result = await supabase
        .from('profiles')
        .insert({
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
        })
        .select()
        .single();
      
      profileData = result.data;
      profileError = result.error;
    }

    console.log('🔵 Profile operation response:', { profileData, profileError });

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

// Reset client password using Edge Function (secure with service role)
export const resetClientPassword = async (clientEmail: string, newPassword: string): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-client-password', {
      body: {
        clientEmail,
        newPassword,
      },
    });

    if (error) {
      console.error('Error invoking update-client-password function:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Error from update-client-password function:', data.error);
      throw new Error(data.error);
    }

    console.log('Password reset successful:', data);
  } catch (error) {
    console.error('Error resetting client password:', error);
    throw error;
  }
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
  // Get the application details first (we need client info for the email)
  const { data: app, error: fetchError } = await getApplicationById(applicationId);
  
  if (fetchError || !app) {
    return { data: null, error: fetchError };
  }

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

  // Send email if status is RATE_EXPIRY_REMINDER_SENT
  if (newStatus === ApplicationStatus.RATE_EXPIRY_REMINDER_SENT) {
    const subject = 'Mortgage Interest Rate Expiry Reminder';
    const body = `Dear ${app.clientName},

This is a friendly reminder that your mortgage interest rate is due to expire on ${new Date(app.interestRateExpiryDate).toLocaleDateString()}.

Current Rate: ${app.interestRate}%
Mortgage Lender: ${app.mortgageLender}
Property: ${app.propertyAddress}

Please contact us at your earliest convenience to discuss your options for renewal or remortgaging.

Best regards,
Mortgage Tracker Team`;

    await sendEmailToClient(
      app.clientEmail,
      subject,
      body,
      'Mortgage Tracker',
      'hello@mortgagetracker.net'
    );
  }

  return getApplicationById(applicationId);
};

// Replace your deleteApplication function in supabaseService.ts with this:

// Replace your deleteApplication function in supabaseService.ts with this:

export const deleteApplication = async (applicationId: string) => {
  try {
    // Save current session BEFORE any operations
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const currentUserId = currentSession?.user?.id;

    // First, get the application to find the client_id
    const { data: appData, error: fetchError } = await supabase
      .from('applications')
      .select('client_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return { error: fetchError };
    }

    const clientId = appData?.client_id;

    // Delete application history first
    await supabase
      .from('application_history')
      .delete()
      .eq('application_id', applicationId);

    // Delete the application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error('Error deleting application:', deleteError);
      return { error: deleteError };
    }

    // Check if the client has any other applications
    if (clientId) {
      const { data: otherApps, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('client_id', clientId)
        .limit(1);

      if (!checkError && (!otherApps || otherApps.length === 0)) {
        // No other applications, delete the client profile
        console.log('No other applications found for client, deleting client profile');
        
        // Delete from profiles table (this will trigger cascade delete)
        const { error: deleteProfileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', clientId)
          .eq('role', 'CLIENT'); // Safety check to only delete clients
        
        if (deleteProfileError) {
          console.error('Error deleting client profile:', deleteProfileError);
        } else {
          console.log('Client profile deleted successfully');
        }
      } else {
        console.log('Client has other applications, keeping profile');
      }
    }

    // RESTORE session if it changed
    const { data: { session: afterSession } } = await supabase.auth.getSession();
    
    if (currentSession && afterSession?.user?.id !== currentUserId) {
      console.log('⚠️ Session changed during delete, restoring...');
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
      console.log('✅ Session restored');
    }

    return { error: null };
  } catch (err) {
    console.error('Exception in deleteApplication:', err);
    return { error: err as Error };
  }
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
