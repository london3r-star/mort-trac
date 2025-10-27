import React, { useState, useEffect } from 'react';
import { Application, User, AppStage } from '../../types';
import { 
  getAllApplications, 
  getBrokerInfo, 
  deleteApplication,
  updateApplicationStage,
  saveApplication
} from '../../services/supabaseService';
import ApplicationModal from '../ui/ApplicationModal';
import NotesModal from '../ui/NotesModal';
import EmailClientModal from '../ui/EmailClientModal';
import PortalInviteModal from '../ui/PortalInviteModal';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<AppStage | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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
      setApplications(apps || []);
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

  // Check if rate expires within 6 months
  const isExpiringWithin6Months = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiry <= sixMonthsFromNow && expiry >= new Date();
  };

  // Calculate pipeline counts
  const getPipelineCounts = () => {
    const stages = {
      'documents-requested': 0,
      'approved-in-principle': 0,
      'full-application': 0,
      'mortgage-offer': 0,
      'completed': 0
    };

    applications.forEach(app => {
      if (app.appStage in stages) {
        stages[app.appStage as keyof typeof stages]++;
      }
    });

    return stages;
  };

  const pipelineCounts = getPipelineCounts();

  // Handlers
  const handleAddNew = () => {
    setSelectedApplication(null);
    setIsApplicationModalOpen(true);
  };

  const handleEdit = (app: Application) => {
    setSelectedApplication(app);
    setIsApplicationModalOpen(true);
  };

  const handleDelete = async (appId: string) => {
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

  const handleNotes = (app: Application) => {
    setSelectedApplication(app);
    setIsNotesModalOpen(true);
  };

  const handleEmail = (app: Application) => {
    setSelectedApplication(app);
    setIsEmailModalOpen(true);
  };

  const handleInvite = (app: Application) => {
    const newTempPassword = generateTemporaryPassword();
    setTemporaryPassword(newTempPassword);
    setSelectedApplication(app);
    setIsPortalInviteModalOpen(true);
  };

  const handleStageChange = async (appId: string, newStage: AppStage) => {
    try {
      await updateApplicationStage(appId, newStage);
      fetchApplications();
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage. Please try again.');
    }
  };

  const handleApplicationSaved = async (applicationData: any) => {
    try {
      await saveApplication(applicationData, user.id);
      setIsApplicationModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save application. Please try again.');
    }
  };

  const handleNotesSaved = async (notes: string) => {
    if (!selectedApplication) return;
    try {
      await saveApplication({ ...selectedApplication, notes }, user.id);
      setIsNotesModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleEmailSent = () => {
    // Email sending is handled by EmailClientModal via Edge Function
    setIsEmailModalOpen(false);
    setSelectedApplication(null);
  };

  const handlePortalInviteSent = () => {
    setIsPortalInviteModalOpen(false);
    setSelectedApplication(null);
    setTemporaryPassword('');
    fetchApplications();
  };

  const formatStageName = (stage: string) => {
    return stage.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.name}'s Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mortgage Tracker Pro
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as AppStage | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              >
                <option value="all">All Statuses</option>
                <option value="documents-requested">Awaiting Documents</option>
                <option value="approved-in-principle">AIP in Progress</option>
                <option value="full-application">Full Application Submitted</option>
                <option value="mortgage-offer">Mortgage Offered</option>
                <option value="completed">Purchase Completed</option>
              </select>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
              >
                New Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pipeline Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Documents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{pipelineCounts['documents-requested']}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">AIP in Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{pipelineCounts['approved-in-principle']}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Full Application Submitted</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{pipelineCounts['full-application']}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Mortgage Offered</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{pipelineCounts['mortgage-offer']}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Purchase Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{pipelineCounts['completed']}</p>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client / Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Solicitor Firm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Loan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rate / Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                        <p className="font-medium">No applications found</p>
                        <p className="text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new application'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {app.clientName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {app.propertyAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {app.mortgageLender || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {app.solicitorFirmName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        £{app.loanAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {app.interestRate ? `${app.interestRate}%` : '-'}
                        </div>
                        {app.interestRateExpiryDate && (
                          <div className={`text-sm ${isExpiringWithin6Months(app.interestRateExpiryDate) ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                            Expires: {new Date(app.interestRateExpiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={app.appStage}
                          onChange={(e) => handleStageChange(app.id, e.target.value as AppStage)}
                          className="text-sm border-0 bg-blue-900 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        >
                          <option value="new">New</option>
                          <option value="documents-requested">Awaiting Documents</option>
                          <option value="submitted-to-lender">Submitted to Lender</option>
                          <option value="approved-in-principle">AIP Approved</option>
                          <option value="full-application">Full Application</option>
                          <option value="mortgage-offer">Mortgage Offer</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {isExpiringWithin6Months(app.interestRateExpiryDate) && (
                            <button
                              onClick={() => handleEmail(app)}
                              className="text-yellow-600 hover:text-yellow-800 font-medium"
                              title="Send rate expiry email"
                            >
                              Email
                            </button>
                          )}
                          <button
                            onClick={() => handleNotes(app)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => handleEdit(app)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleInvite(app)}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Invite
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplication(null);
        }}
        onSave={handleApplicationSaved}
        application={selectedApplication}
        brokerId={user.id}
      />

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedApplication(null);
        }}
        onSave={handleNotesSaved}
        application={selectedApplication}
      />

      <EmailClientModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedApplication(null);
        }}
        onSend={handleEmailSent}
        application={selectedApplication}
        broker={brokerInfo}
      />

      <PortalInviteModal
        isOpen={isPortalInviteModalOpen}
        onClose={() => {
          setIsPortalInviteModalOpen(false);
          setSelectedApplication(null);
          setTemporaryPassword('');
        }}
        onSent={handlePortalInviteSent}
        application={selectedApplication}
        broker={brokerInfo}
        temporaryPassword={temporaryPassword}
      />
    </div>
  );
};

export default BrokerDashboard;
