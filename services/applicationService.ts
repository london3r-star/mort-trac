import { supabase } from '../lib/supabase';
import { Application, ApplicationStatus, Solicitor, ApplicationHistory } from '../types';

export const fetchApplications = async (): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      application_history (
        status,
        date
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data.map((app: any) => ({
    id: app.id,
    clientId: app.client_id,
    brokerId: app.broker_id,
    clientName: app.client_name,
    clientEmail: app.client_email,
    clientContactNumber: app.client_contact_number,
    clientCurrentAddress: app.client_current_address,
    propertyAddress: app.property_address,
    loanAmount: parseFloat(app.loan_amount),
    status: app.status as ApplicationStatus,
    mortgageLender: app.mortgage_lender,
    interestRate: parseFloat(app.interest_rate),
    interestRateExpiryDate: app.interest_rate_expiry_date,
    solicitor: {
      firmName: app.solicitor_firm_name,
      solicitorName: app.solicitor_name,
      contactNumber: app.solicitor_contact_number,
      email: app.solicitor_email,
    } as Solicitor,
    history: app.application_history.map((h: any) => ({
      status: h.status as ApplicationStatus,
      date: h.date,
    })) as ApplicationHistory[],
    notes: app.notes,
  }));
};

export const createApplication = async (application: Omit<Application, 'id' | 'history'>): Promise<Application | null> => {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      client_id: application.clientId,
      broker_id: application.brokerId,
      client_name: application.clientName,
      client_email: application.clientEmail,
      client_contact_number: application.clientContactNumber,
      client_current_address: application.clientCurrentAddress,
      property_address: application.propertyAddress,
      loan_amount: application.loanAmount,
      status: application.status,
      mortgage_lender: application.mortgageLender,
      interest_rate: application.interestRate,
      interest_rate_expiry_date: application.interestRateExpiryDate,
      solicitor_firm_name: application.solicitor.firmName,
      solicitor_name: application.solicitor.solicitorName,
      solicitor_contact_number: application.solicitor.contactNumber,
      solicitor_email: application.solicitor.email,
      notes: application.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    return null;
  }

  const apps = await fetchApplications();
  return apps.find(a => a.id === data.id) || null;
};

export const updateApplication = async (id: string, updates: Partial<Application>): Promise<boolean> => {
  const updateData: any = {};

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
  if (updates.clientEmail !== undefined) updateData.client_email = updates.clientEmail;
  if (updates.clientContactNumber !== undefined) updateData.client_contact_number = updates.clientContactNumber;
  if (updates.clientCurrentAddress !== undefined) updateData.client_current_address = updates.clientCurrentAddress;
  if (updates.propertyAddress !== undefined) updateData.property_address = updates.propertyAddress;
  if (updates.loanAmount !== undefined) updateData.loan_amount = updates.loanAmount;
  if (updates.mortgageLender !== undefined) updateData.mortgage_lender = updates.mortgageLender;
  if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
  if (updates.interestRateExpiryDate !== undefined) updateData.interest_rate_expiry_date = updates.interestRateExpiryDate;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  if (updates.solicitor) {
    if (updates.solicitor.firmName !== undefined) updateData.solicitor_firm_name = updates.solicitor.firmName;
    if (updates.solicitor.solicitorName !== undefined) updateData.solicitor_name = updates.solicitor.solicitorName;
    if (updates.solicitor.contactNumber !== undefined) updateData.solicitor_contact_number = updates.solicitor.contactNumber;
    if (updates.solicitor.email !== undefined) updateData.solicitor_email = updates.solicitor.email;
  }

  const { error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating application:', error);
    return false;
  }

  return true;
};

export const deleteApplication = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
    return false;
  }

  return true;
};
