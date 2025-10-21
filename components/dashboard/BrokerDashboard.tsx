import React, { useState, useEffect } from 'react';
import { Application, User, AppStage } from '../../types';
import { getAllApplications, getBrokerInfo, deleteApplication } from '../../services/supabaseService';
import ApplicationCard from './ApplicationCard';
import Sidebar from './Sidebar';
import BrokerModal from './BrokerModal';
import ClientModal from './ClientModal';
import StageUpdateModal from './StageUpdateModal';
import PortalInviteModal from './PortalInviteModal';
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
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isStageUpdateModalOpen, setIsStageUpdateModalOpen] = useState(false);
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

  const handleAddClient = () => {
    setIsClientModalOpen(true);
  };

  const handleEditApplication = (app: Application) => {
    setSelectedApplication(app);
    setIsClientModalOpen(true);
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

  const handleUpdateStage = (app: Application) => {
    setSelectedApplication(app);
    setIsStageUpdateModalOpen(true);
  };

  const handleSendPortalInvite = (app: Application) => {
    // Generate temporary password when opening the modal
    const newTempPassword = generateTemporaryPassword();
    setTemporaryPassword(newTempPassword);
    
    setSelectedApplication(app);
    setIsPortalInviteModalOpen(true);
  };

  const handleClientModalClose = () => {
    setIsClientModalOpen(false);
    setSelectedApplication(null);
  };

  const handleClientSaved = () => {
    setIsClientModalOpen(false);
    setSelectedApplication(null);
    fetchApplications();
  };

  const handleStageUpdateModalClose = () => {
    setIsStageUpdateModalOpen(false);
    setSelectedApplication(null);
  };

  const handleStageUpdated = () => {
    setIsStageUpdateModalClose(false);
    setSelectedApplication(null);
    fetchApplications();
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        user={user}
        onLogout={onLogout}
        selectedStage={selectedStage}
        onStageSelect={setSelectedStage}
        applications={applications}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary dark:text-gray-100">
                {selectedStage === 'all' ? 'All Applications' : selectedStage.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your mortgage applications
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search clients or properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              />
              <button
                onClick={handleAddClient}
                className="bg-brand-secondary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors whitespace-nowrap"
              >
                + Add Client
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
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
                {searchTerm ? 'No applications match your search.' : 'Get started by adding a new client.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleAddClient}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90"
                  >
                    + Add Client
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                  onView={handleViewApplication}
                  onUpdateStage={handleUpdateStage}
                  onSendPortalInvite={handleSendPortalInvite}
                  stageColorMap={stageColorMap}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        onSave={(brokerData) => {
          console.log('Broker saved:', brokerData);
          setIsBrokerModalOpen(false);
        }}
        existingUsers={[]}
        loggedInUser={user}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleClientModalClose}
        onSave={handleClientSaved}
        brokerId={user.id}
        applicationToEdit={selectedApplication}
      />

      <StageUpdateModal
        isOpen={isStageUpdateModalOpen}
        onClose={handleStageUpdateModalClose}
        onUpdate={handleStageUpdated}
        application={selectedApplication}
        stageColorMap={stageColorMap}
      />

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
