import React, { useState, useEffect } from 'react';
import { Application, User, AppStage } from '../../types';
import { getAllApplications, getBrokerInfo, deleteApplication } from '../../services/supabaseService';
import ApplicationCard from '../ui/ApplicationCard';
import PortalInviteModal from '../ui/PortalInviteModal';
import { useNavigate } from 'react-router-dom';

interface BrokerDashboardProps {
  user: User;
  onLogout: () => void;
}

// Helper function to generate temporary password
const generateTemporaryPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const BrokerDashboard: React.FC<BrokerDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<AppStage | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPortalInviteModalOpen, setIsPortalInviteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [brokerInfo, setBrokerInfo] = useState<User | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchBrokerInfo();
  }, [user.id]);

  useEffect(() => {
    filterApplications();
  }, [applications, selectedStage, searchTerm]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const apps = await getAllApplications(user.id);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerInfo = async () => {
    try {
      const info = await getBrokerInfo(user.id);
      setBrokerInfo(info);
    } catch (error) {
      console.error('Error fetching broker info:', error);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (selectedStage !== 'all') {
      filtered = filtered.filter((app) => app.appStage === selectedStage);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.clientName.toLowerCase().includes(lowerSearch) ||
          app.propertyAddress.toLowerCase().includes(lowerSearch) ||
          app.clientEmail.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleDeleteApplication = async (appId: string) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await deleteApplication(appId);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
      }
    }
  };

  const handleViewApplication = (app: Application) => {
    navigate(`/broker/application/${app.id}`, { state: { application: app, broker: user } });
  };

  const handleSendPortalInvite = (app: Application) => {
    // Generate temporary password when opening the modal
    const newTempPassword = generateTemporaryPassword();
    setTemporaryPassword(newTempPassword);
    
    setSelectedApplication(app);
    setIsPortalInviteModalOpen(true);
  };

  const handlePortalInviteSent = () => {
    setIsPortalInviteModalOpen(false);
    setSelectedApplication(null);
    setTemporaryPassword(''); // Clear password after sending
    fetchApplications();
  };

  const handlePortalInviteModalClose = () => {
    setIsPortalInviteModalOpen(false);
    setSelectedApplication(null);
    setTemporaryPassword(''); // Clear password when closing
  };

  const stageColorMap: Record<AppStage, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'documents-requested': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'submitted-to-lender': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'approved-in-principle': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'full-application': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'mortgage-offer': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary dark:text-gray-100">
              Mortgage Tracker - Broker Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {user.name}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Stage Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Stage:
          </label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as AppStage | 'all')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="documents-requested">Documents Requested</option>
            <option value="submitted-to-lender">Submitted to Lender</option>
            <option value="approved-in-principle">Approved in Principle</option>
            <option value="full-application">Full Application</option>
            <option value="mortgage-offer">Mortgage Offer</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search clients or properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No applications</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No applications match your search.' : 'No applications found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onEdit={() => {}}
                onDelete={handleDeleteApplication}
                onView={handleViewApplication}
                onUpdateStage={() => {}}
                onSendPortalInvite={handleSendPortalInvite}
                stageColorMap={stageColorMap}
              />
            ))}
          </div>
        )}
      </main>

      {/* Portal Invite Modal */}
      <PortalInviteModal
        isOpen={isPortalInviteModalOpen}
        onClose={handlePortalInviteModalClose}
        onSent={handlePortalInviteSent}
        application={selectedApplication}
        broker={brokerInfo}
        temporaryPassword={temporaryPassword}
      />
    </div>
  );
};

export default BrokerDashboard;