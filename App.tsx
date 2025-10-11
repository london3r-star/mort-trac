import React, { useState, useEffect } from 'react';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import { User, Application } from './types';
import { MOCK_USERS, MOCK_APPLICATIONS } from './services/mockData';
import { Role } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateApplications = (updatedApplications: Application[]) => {
    setApplications(updatedApplications);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} setUsers={setUsers} />;
  }

  const clientApplication = currentUser.role === Role.CLIENT 
    ? applications.find(app => app.clientId === currentUser.id) || null
    : null;

  return (
    <div className="min-h-screen">
      <DashboardPage
        user={currentUser}
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

export default App;