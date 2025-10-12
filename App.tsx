import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = React.useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  if (loading) {
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
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      <DashboardPage user={user} />
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
