import React, { useState, useEffect } from 'react';
import { User, Application, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fetchApplications } from '../../services/applicationService';
import { fetchUsers } from '../../services/userService';
import Header from '../ui/Header';
import BrokerDashboard from '../dashboard/BrokerDashboard';
import ClientDashboard from '../dashboard/ClientDashboard';
import ManageBrokersPage from './ManageBrokersPage';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const { signOut } = useAuth();
  const [isManagingBrokers, setIsManagingBrokers] = useState(false);
  const [viewingBroker, setViewingBroker] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [appsData, usersData] = await Promise.all([
      fetchApplications(),
      fetchUsers(),
    ]);
    setApplications(appsData);
    setUsers(usersData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
  };

  const handleUpdateApplications = async () => {
    await loadData();
  };

  const handleUpdateUsers = async () => {
    await loadData();
  };

  const canManageBrokers = user.isAdmin || user.isTeamManager || user.isBrokerAdmin;

  const clientApplication = user.role === Role.CLIENT
    ? applications.find(app => app.clientId === user.id) || null
    : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      );
    }

    if (user.role === Role.BROKER) {
      if (viewingBroker && canManageBrokers) {
        return (
          <BrokerDashboard
            user={user}
            viewedBroker={viewingBroker}
            applications={applications}
            onUpdateApplications={handleUpdateApplications}
            users={users}
            setUsers={handleUpdateUsers}
          />
        );
      }
      if (isManagingBrokers && canManageBrokers) {
        return (
          <ManageBrokersPage
            user={user}
            users={users}
            setUsers={handleUpdateUsers}
            onViewBrokerDashboard={handleViewBrokerDashboard}
            applications={applications}
          />
        );
      }
      return (
        <BrokerDashboard
          user={user}
          applications={applications}
          onUpdateApplications={handleUpdateApplications}
          users={users}
          setUsers={handleUpdateUsers}
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
    <div className="bg-gray-50 min-h-screen">
      <Header
        user={user}
        onLogout={signOut}
        onManageBrokers={canManageBrokers ? handleShowManageBrokers : undefined}
        isManagingBrokers={isManagingBrokers}
        onBackToDashboard={isManagingBrokers ? () => setIsManagingBrokers(false) : undefined}
        viewingBroker={viewingBroker}
        onBackToManageBrokers={viewingBroker ? handleBackToManageBrokers : undefined}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;