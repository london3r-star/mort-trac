import React from 'react';
import { User } from '../../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onChangePassword: () => void; // NEW
  onChangePassword: () => void;
  onManageBrokers?: () => void;
  isManagingBrokers?: boolean;
  onBackToDashboard?: () => void;
  viewingBroker?: User | null;
  onBackToManageBrokers?: () => void;
  onBackToDashboardFromBroker?: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onResetClientPassword?: (clientId: string, notificationId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
@@ -24,8 +27,12 @@
  viewingBroker, 
  onBackToManageBrokers, 
  theme, 
  toggleTheme 
  toggleTheme,
  onResetClientPassword
}) => {
  // Show notifications for admins, team managers, and broker admins
  const canSeeNotifications = user.isAdmin || user.isTeamManager || user.isBrokerAdmin || user.role === 'BROKER';

  return (
    <header className="bg-brand-primary dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
@@ -61,40 +68,43 @@
                Manage Brokers
              </button>
            )}
            {canSeeNotifications && onResetClientPassword && (
              <NotificationBell onResetClientPassword={onResetClientPassword} />
            )}
            <button
              onClick={toggleTheme}
              className="px-2 py-2 rounded-md text-sm font-medium text-white hover:bg-brand-secondary dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <span className="hidden sm:block text-sm text-white">Welcome, <span className="font-semibold">{user.name}</span></span>
            <button
              onClick={onChangePassword}
              className="hidden sm:block px-3 py-2 rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition"
              title="Change Password"
            >
              Change Password
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
