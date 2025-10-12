import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NewLoginPage from './components/pages/NewLoginPage';
import DashboardPage from './components/pages/DashboardPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import { User, Application } from './types';
import { getAllUsers, getAllApplications, getApplicationsByClientId, subscribeToApplications, subscribeToProfiles } from './services/supabaseService';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = React.useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clientApplication, setClientApplication] = useState<Application | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  // Fetch data when user is logged in
  useEffect(() => {
    if (user) {
      fetchData();
      
      // Subscribe to real-time updates
      const appsSubscription = subscribeToApplications(() => {
        fetchData();
      });

      const profilesSubscription = subscribeToProfiles(() => {
        fetchData();
      });

      return () => {
        appsSubscription.unsubscribe();
        profilesSubscription.unsubscribe();
      };
    } else {
      setDataLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch all users
      const { data: usersData } = await getAllUsers();
      if (usersData) {
        setUsers(usersData);
      }

      // Fetch applications based on user role
      if (user?.role === 'CLIENT') {
        const { data: clientApp } = await getApplicationsByClientId(user.id);
        setClientApplication(clientApp);
      } else {
        const { data: appsData } = await getAllApplications();
        if (appsData) {
          setApplications(appsData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpdateApplications = (updatedApplications: Application[]) => {
    setApplications(updatedApplications);
  };

  const handleLogout = async () => {
    const { signOut } = useAuth();
    await signOut();
    setUsers([]);
    setApplications([]);
    setClientApplication(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (loading || (user && dataLoading)) {
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
    return <NewLoginPage />;
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
