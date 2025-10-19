import React, { useState } from 'react';
import { User, Application, Role } from '../../types';
import Header from '../ui/Header';
import BrokerDashboard from '../dashboard/BrokerDashboard';
import ClientDashboard from '../dashboard/ClientDashboard';
import ManageBrokersPage from './ManageBrokersPage';
import ChangePasswordModal from '../ui/ChangePasswordModal';

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
  const [isManagingBrokers, setIsManagingBrokers] = useState(false);
  const [viewingBroker, setViewingBroker] = useState<User | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [cameFromManageBrokers, setCameFromManageBrokers] = useState(false);
  
  // Update sessionStorage when isManagingBrokers changes
  React.useEffect(() => {
    sessionStorage.setItem('isManagingBrokers', isManagingBrokers.toString());
  }, [isManagingBrokers]);

  const handleViewBrokerDashboard = (broker: User) => {
    setViewingBroker(broker);
    setIsManagingBrokers(false);
    // Track if we came from Manage Brokers page or directly from dashboard
    setCameFromManageBrokers(isManagingBrokers);
  };

  const handleBackToManageBrokers = () => {
    setViewingBroker(null);
    setIsManagingBrokers(true);
    setCameFromManageBrokers(false);
  };

  const handleBackToDashboard = () => {
    setViewingBroker(null);
    setIsManagingBrokers(false);
    setCameFromManageBrokers(false);
  };
  
  const handleShowManageBrokers = () => {
    setIsManagingBrokers(true);
    setViewingBroker(null);
  }

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
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
        onBackToManageBrokers={viewingBroker && cameFromManageBrokers ? handleBackToManageBrokers : undefined}
        onBackToDashboardFromBroker={viewingBroker && !cameFromManageBrokers ? handleBackToDashboard : undefined}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default DashboardPage;
