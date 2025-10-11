import React from 'react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onManageBrokers?: () => void; // Optional for admin brokers
  isManagingBrokers?: boolean;
  onBackToDashboard?: () => void;
  viewingBroker?: User | null;
  onBackToManageBrokers?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onManageBrokers, isManagingBrokers, onBackToDashboard, viewingBroker, onBackToManageBrokers }) => {
  return (
    <header className="bg-brand-primary shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="ml-3 text-xl font-bold text-white">Mortgage Tracker Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            {viewingBroker && onBackToManageBrokers && (
                <button
                    onClick={onBackToManageBrokers}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-brand-secondary hover:bg-opacity-90 transition"
                >
                    &larr; Back to Manage Brokers
                </button>
            )}
            {isManagingBrokers && onBackToDashboard && (
                <button
                    onClick={onBackToDashboard}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-brand-secondary hover:bg-opacity-90 transition"
                >
                    &larr; Back to Dashboard
                </button>
            )}
            {onManageBrokers && !isManagingBrokers && !viewingBroker && (
              <button
                onClick={onManageBrokers}
                className="hidden md:block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-brand-secondary transition"
              >
                Manage Brokers
              </button>
            )}
            <span className="hidden sm:block text-sm text-white">Welcome, <span className="font-semibold">{user.name}</span></span>
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