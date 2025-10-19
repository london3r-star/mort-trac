import React, { useState } from 'react';
import { User, Application, Role } from '../../types';
import Header from '../ui/Header';
import BrokerDashboard from '../dashboard/BrokerDashboard';
import ClientDashboard from '../dashboard/ClientDashboard';
import ManageBrokersPage from './ManageBrokersPage';
import ChangePasswordModal from '../ui/ChangePasswordModal';
import ResetPasswordModal from '../ui/ResetPasswordModal';

interface DashboardPageProps {
  user: User;
  users: User[];
  setUsers: (users: User[]) => void;
  applications: Application[];
  clientApplication: Application | null;
  onLogout: () => void;
  onUpdateApplications: (updatedApplications: Application[]) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  users,
  setUsers,
  applications,
  clientApplication,
  onLogout,
  onUpdateApplications,
  theme,
  toggleTheme,
}) => {
  // Persist navigation state to prevent reset during session changes
  const [isManagingBrokers, setIsManagingBrokers] = useState(() => {
    return sessionStorage.getItem('isManagingBrokers') === 'true';
  });
  const [viewingBroker, setViewingBroker] = useState<User | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [resettingPasswordClient, setResettingPasswordClient] = useState<User | null>(null);
  const [cameFromManageBrokers, setCameFromManageBrokers] = useState(false);
  
  // Update sessionStorage when isManagingBrokers changes
  React.useEffect(() => {
    sessionStorage.setItem('isManagingBrokers', isManagingBrokers.toString());
  }, [isManagingBrokers]);

  const handleViewBrokerDashboard = (broker: User) => {
    setViewingBroker(broker);
    setIsManagingBrokers(false);
  };

  const handleBackToManageBrokers = () => {
    setViewingBroker(null);
    setIsManagingBrokers(true);
  };
  
  const handleShowManageBrokers = () => {
    setIsManagingBrokers(true);
    setViewingBroker(null);
  }

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleResetClientPassword = (clientId: string, notificationId: string) => {
    const client = users.find(u => u.id === clientId);
    if (client) {
      setResettingPasswordClient(client);
    }
  };

  const handleClientPasswordReset = async (newPassword: string) => {
    if (!resettingPasswordClient) return;
    
    const { adminResetUserPassword } = await import('../services/supabaseService');
    const { error } = await adminResetUserPassword(resettingPasswordClient.id, newPassword);
    
    if (error) {
      console.error('Error resetting client password:', error);
      alert('Failed to reset client password. Please try again.');
      return;
    }
    
    alert(`Password reset successfully for ${resettingPasswordClient.name}. They can now log in with the new password.`);
    setResettingPasswordClient(null);
  };
  
  const canManageBrokers = user.isAdmin || user.isTeamManager || user.isBrokerAdmin;

  const renderContent = () => {
    if (user.role === Role.BROKER) {
      if (viewingBroker && canManageBrokers) {
        return (
          <BrokerDashboard
            user={user}
            viewedBroker={viewingBroker}
            applications={applications}
            onUpdateApplications={onUpdateApplications}
            users={users}
            setUsers={setUsers}
            onViewBrokerDashboard={canManageBrokers ? handleViewBrokerDashboard : undefined}
          />
        );
      }

      if (isManagingBrokers && canManageBrokers) {
        return <ManageBrokersPage user={user} users={users} setUsers={setUsers} onViewBrokerDashboard={handleViewBrokerDashboard} applications={applications} />;
      }

      return (
        <BrokerDashboard
          user={user}
          applications={applications}
          onUpdateApplications={onUpdateApplications}
          users={users}
          setUsers={setUsers}
          onViewBrokerDashboard={canManageBrokers ? handleViewBrokerDashboard : undefined}
        />
      );
    }
    
    if (user.role === Role.CLIENT) {
      const broker = clientApplication ? users.find(u => u.id === clientApplication.brokerId) ?? null : null;
      return <ClientDashboard user={user} application={clientApplication} broker={broker} />;
    }

    return null;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header
        user={user}
        onLogout={onLogout}
        onChangePassword={handleChangePassword}
        onManageBrokers={canManageBrokers ? handleShowManageBrokers : undefined}
        isManagingBrokers={isManagingBrokers}
        onBackToDashboard={isManagingBrokers ? () => setIsManagingBrokers(false) : undefined}
        viewingBroker={viewingBroker}
        onBackToManageBrokers={viewingBroker ? handleBackToManageBrokers : undefined}
        theme={theme}
        toggleTheme={toggleTheme}
        onResetClientPassword={handleResetClientPassword}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        user={user}
      />

      <ResetPasswordModal
        isOpen={!!resettingPasswordClient}
        onClose={() => setResettingPasswordClient(null)}
        onConfirm={handleClientPasswordReset}
        user={resettingPasswordClient!}
      />
    </div>
  );
};

export default DashboardPage;
