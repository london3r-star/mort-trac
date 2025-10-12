import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, Role } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  databaseError: boolean;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState(false);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('👤 Fetching profile for user:', authUser.id, authUser.email);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('📊 Profile query result:', { data, error });

      if (error) {
        // If table doesn't exist or other database error, log and continue
        console.error('❌ Database query failed:', error.message);
        console.error('Full error:', error);
        
        // Check if it's a table not found error
        if (error.message.includes('relation "public.profiles" does not exist') || 
            error.message.includes('does not exist')) {
          console.error('🔴 CRITICAL: profiles table does not exist!');
          setDatabaseError(true);
        }
        // Sign out the user since we can't fetch their profile
        console.log('🚪 Signing out user due to profile fetch error');
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        return;
      }

      if (data) {
        console.log('✅ Profile found:', data.email, 'Role:', data.role, 'Admin:', data.is_admin);
        setUser({
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
        });
        console.log('✅ User state set successfully');
      } else {
        // Profile not found for authenticated user
        console.error('❌ No profile data returned for user:', authUser.id);
        console.error('🔴 CRITICAL: User exists in auth.users but not in profiles table');
        console.error('📝 Action needed: Run verify-and-fix-user.sql in Supabase SQL Editor');
        console.error('🔗 URL: https://supabase.com/dashboard/project/xuwhawmzzfotzhxycxpm/editor');
        
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setDatabaseError(true);
      }
    } catch (error) {
      console.error('❌ Exception in fetchUserProfile:', error);
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📥 Initial session:', session?.user?.email || 'No session');
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('❌ Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
      
      (async () => {
        setSession(session);
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          await fetchUserProfile(session.user);
        } else {
          console.log('🚫 No authenticated user');
          setUser(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, role: Role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ Sign in successful:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in caught error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        databaseError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
