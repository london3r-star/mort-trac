import { supabase } from './supabaseClient';
import { Application, User } from '../types';

// User Authentication
export const signUp = async (email: string, password: string, name: string, role: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }
    }
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, name, email, role }]);

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return { user: data.user, profile };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return profile;
};

// Application Management
export const saveApplication = async (applicationData: any, brokerId: string) => {
  const isUpdate = !!applicationData.id;

  if (isUpdate) {
    // Update existing application
    const { data, error } = await supabase
      .from('applications')
      .update({
        client_name: applicationData.clientName,
        client_email: applicationData.clientEmail,
        client_contact_number: applicationData.clientContactNumber,
        client_current_address: applicationData.clientCurrentAddress,
        property_address: applicationData.propertyAddress,
        loan_amount: applicationData.loanAmount,
        status: applicationData.appStage,
        mortgage_lender: applicationData.mortgageLender,
        interest_rate: applicationData.interestRate,
        interest_rate_expiry_date: applicationData.interestRateExpiryDate,
        solicitor_firm_name: applicationData.solicitorFirmName,
        solicitor_name: applicationData.solicitorName,
        solicitor_contact_number: applicationData.solicitorContactNumber,
        solicitor_email: applicationData.solicitorEmail,
        notes: applicationData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationData.id)
      .select();

    if (error) throw error;
    return data;
  } else {
    // Create new application with client
    // First, check if client already exists
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', applicationData.clientEmail)
      .eq('role', 'CLIENT')
      .single();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client user
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: applicationData.clientEmail,
        password: tempPassword,
        options: {
          data: {
            name: applicationData.clientName,
            role: 'CLIENT'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create client user');

      clientId = authData.user.id;

      // Create client profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: clientId,
          name: applicationData.clientName,
          email: applicationData.clientEmail,
          role: 'CLIENT',
          contact_number: applicationData.clientContactNumber,
          current_address: applicationData.clientCurrentAddress,
        }]);

      if (profileError) throw profileError;
    }

    // Create application
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        client_id: clientId,
        broker_id: brokerId,
        client_name: applicationData.clientName,
        client_email: applicationData.clientEmail,
        client_contact_number: applicationData.clientContactNumber,
        client_current_address: applicationData.clientCurrentAddress,
        property_address: applicationData.propertyAddress,
        loan_amount: applicationData.loanAmount,
        status: applicationData.appStage,
        mortgage_lender: applicationData.mortgageLender,
        interest_rate: applicationData.interestRate,
        interest_rate_expiry_date: applicationData.interestRateExpiryDate,
        solicitor_firm_name: applicationData.solicitorFirmName,
        solicitor_name: applicationData.solicitorName,
        solicitor_contact_number: applicationData.solicitorContactNumber,
        solicitor_email: applicationData.solicitorEmail,
        notes: applicationData.notes,
      }])
      .select();

    if (error) throw error;
    return data;
  }
};

export const getAllApplications = async (brokerId: string): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('broker_id', brokerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((app: any) => ({
    id: app.id,
    clientId: app.client_id,
    brokerId: app.broker_id,
    clientName: app.client_name,
    clientEmail: app.client_email,
    clientContactNumber: app.client_contact_number,
    clientCurrentAddress: app.client_current_address,
    propertyAddress: app.property_address,
    loanAmount: app.loan_amount,
    appStage: app.status,
    mortgageLender: app.mortgage_lender,
    interestRate: app.interest_rate,
    interestRateExpiryDate: app.interest_rate_expiry_date,
    solicitorFirmName: app.solicitor_firm_name,
    solicitorName: app.solicitor_name,
    solicitorContactNumber: app.solicitor_contact_number,
    solicitorEmail: app.solicitor_email,
    notes: app.notes,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
  }));
};

export const deleteApplication = async (applicationId: string): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId);

  if (error) throw error;
};

// Get broker information
export const getBrokerInfo = async (brokerId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', brokerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching broker info:', error);
    return null;
  }
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

// Send portal invitation email
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
        body: body.replace(/\n/g, '<br>'),
        fromName: senderName,
        fromEmail: senderEmail,
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

export const updateApplicationStage = async (applicationId: string, newStage: string): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .update({ status: newStage, updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) throw error;
};
