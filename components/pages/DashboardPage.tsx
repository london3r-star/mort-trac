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
@@ -35,6 +36,8 @@
  });
  const [viewingBroker, setViewingBroker] = useState<User | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [resettingPasswordClient, setResettingPasswordClient] = useState<User | null>(null);
  const [cameFromManageBrokers, setCameFromManageBrokers] = useState(false);

  // Update sessionStorage when isManagingBrokers changes
  React.useEffect(() => {
@@ -59,6 +62,29 @@
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

@@ -115,6 +141,7 @@
        onBackToManageBrokers={viewingBroker ? handleBackToManageBrokers : undefined}
        theme={theme}
        toggleTheme={toggleTheme}
        onResetClientPassword={handleResetClientPassword}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
@@ -125,8 +152,15 @@
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
