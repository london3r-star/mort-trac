import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SecureLoginPage from './components/pages/SecureLoginPage';
import DashboardPage from './components/pages/DashboardPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';
import ErrorBoundary from './components/ErrorBoundary';
import DatabaseSetupNotice from './components/DatabaseSetupNotice';
import { User, Application } from './types';
import { getAllUsers, getAllApplications, getApplicationsByClientId, subscribeToApplications, subscribeToProfiles } from './services/supabaseService';

const AppContent: React.FC = () => {
  const { user, loading, databaseError } = useAuth();
  const [isResetPassword, setIsResetPassword] = React.useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clientApplication, setClientApplication] = useState<Application | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isStableState, setIsStableState] = useState(true);
  const [hadUserBefore, setHadUserBefore] = useState(false);
  const userStabilityTimeout = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  // Debounce user state changes to prevent flickering during session switches
  useEffect(() => {
    // Track if we've had a user before
    if (user) {
      setHadUserBefore(true);
    }

    // Clear any existing timeout
    if (userStabilityTimeout.current) {
      clearTimeout(userStabilityTimeout.current);
    }

    // If user changes, mark as unstable temporarily
    setIsStableState(false);

    // Set a short timeout to mark state as stable
    userStabilityTimeout.current = setTimeout(() => {
      setIsStableState(true);
    }, 300);

    return () => {
      if (userStabilityTimeout.current) {
        clearTimeout(userStabilityTimeout.current);
      }
    };
  }, [user]);

  // Fetch data function
const fetchData = React.useCallback(async () => {
  if (!user) {
    setDataLoading(false);
    return;
  }

  setDataLoading(true);
  try {
    // Fetch all users
    const usersData = await getAllUsers();
    setUsers(usersData || []); // Add fallback

    // Fetch applications based on user role
    if (user.role === 'CLIENT') {
      console.log('📱 Fetching client application');
      const clientApps = await getApplicationsByClientId(user.id);
      setClientApplication(clientApps?.[0] || null);
      console.log('📱 Client app:', clientApps);
    } else {
      console.log('📊 Fetching all applications');
      const appsData = await getAllApplications(user.id);
      console.log('📊 Applications received:', appsData?.length || 0, 'apps');
      setApplications(appsData || []); // Add fallback
      console.log('✅ Applications set in state');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Set empty arrays on error
    setUsers([]);
    setApplications([]);
    setClientApplication(null);
  } finally {
    setDataLoading(false);
  }
}, [user]);

  // Fetch data when user is logged in
  useEffect(() => {
    if (user) {
      fetchData();

      // Subscribe to real-time updates
      let appsUnsubscribe: (() => void) | undefined;
      let profilesUnsubscribe: (() => void) | undefined;

      if (user.role !== 'CLIENT') {
        appsUnsubscribe = subscribeToApplications(user.id, () => {
          fetchData();
        });
      }

      profilesUnsubscribe = subscribeToProfiles(() => {
        fetchData();
      });

      return () => {
        if (appsUnsubscribe) appsUnsubscribe();
        if (profilesUnsubscribe) profilesUnsubscribe();
      };
    } else {
      setDataLoading(false);
    }
  }, [user, fetchData]);

  const handleUpdateApplications = (updatedApplications: Application[]) => {
    setApplications(updatedApplications);
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setUsers([]);
    setApplications([]);
    setClientApplication(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (databaseError) {
    return <DatabaseSetupNotice />;
  }

  // Show loading only on initial load, not during brief session transitions
  const shouldShowLoading = loading || (user && dataLoading) || (!isStableState && !hadUserBefore);

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-primary">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isResetPassword) {
    return <ResetPasswordPage />;
  }

  if (!user) {
    return <SecureLoginPage />;
  }

  // Check if user needs to change password
  if (user.mustChangePassword) {
    const handlePasswordChanged = async () => {
      // Force reload the page to refresh user session
      window.location.reload();
    };
    return <ChangePasswordPage user={user} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <div className="min-h-screen">
      <DashboardPage 
        user={user}
        users={users}
        setUsers={setUsers}
        applications={applications}
        clientApplication={clientApplication}
        onLogout={handleLogout}
        onUpdateApplications={handleUpdateApplications}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;