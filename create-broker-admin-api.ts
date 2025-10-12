// Alternative broker creation using admin operations
// This bypasses email confirmation requirements

import { supabase } from '../lib/supabase';

export const createBrokerWithAdmin = async (
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
    console.log('🔵 Creating broker with admin API:', email);
    
    // Create user with auto-confirm using admin createUser
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role: 'BROKER',
      }
    });

    console.log('🔵 Admin createUser response:', { authData, authError });

    if (authError || !authData.user) {
      console.error('❌ Admin API error:', authError);
      return { data: null, error: authError || new Error('No user created') };
    }

    console.log('✅ User created with admin API:', authData.user.id);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Insert profile
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
      })
      .select()
      .single();

    console.log('🔵 Profile upsert response:', { profileData, profileError });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return { data: null, error: profileError };
    }

    console.log('✅ Broker created successfully with admin API');

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
    console.error('❌ Caught error:', err);
    return { data: null, error: err as Error };
  }
};
