import { supabase } from '../lib/supabase';
import { User, Role } from '../types';

export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data.map((profile: any) => ({
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
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.contactNumber !== undefined) updateData.contact_number = updates.contactNumber;
  if (updates.currentAddress !== undefined) updateData.current_address = updates.currentAddress;
  if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
  if (updates.isAdmin !== undefined) updateData.is_admin = updates.isAdmin;
  if (updates.isTeamManager !== undefined) updateData.is_team_manager = updates.isTeamManager;
  if (updates.isBrokerAdmin !== undefined) updateData.is_broker_admin = updates.isBrokerAdmin;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating user:', error);
    return false;
  }

  return true;
};

export const createBroker = async (broker: Omit<User, 'id'>): Promise<User | null> => {
  const tempPassword = Math.random().toString(36).slice(-12);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: broker.email,
    password: tempPassword,
    options: {
      data: {
        name: broker.name,
        role: Role.BROKER,
      },
    },
  });

  if (authError || !authData.user) {
    console.error('Error creating broker auth:', authError);
    return null;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      contact_number: broker.contactNumber,
      company_name: broker.companyName,
      is_admin: broker.isAdmin || false,
      is_team_manager: broker.isTeamManager || false,
      is_broker_admin: broker.isBrokerAdmin || false,
    })
    .eq('id', authData.user.id);

  if (updateError) {
    console.error('Error updating broker profile:', updateError);
  }

  const users = await fetchUsers();
  return users.find(u => u.id === authData.user.id) || null;
};
