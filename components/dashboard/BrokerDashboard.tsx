import React, { useState, useMemo } from 'react';
import { User, Application, ApplicationStatus, Role, STATUS_ORDER, STATUS_DISPLAY_NAMES } from '../../types';
import ApplicationModal from '../ui/ApplicationModal';
import ConfirmModal from '../ui/ConfirmModal';
import HistoryModal from '../ui/HistoryModal';
import SolicitorInfoModal from '../ui/SolicitorInfoModal';
import NotesModal from '../ui/NotesModal';
import EmailClientModal from '../ui/EmailClientModal';

interface BrokerDashboardProps {
  user: User; // The logged-in user
  viewedBroker?: User; // The broker whose dashboard is being viewed (for admins)
  applications: Application[];
  onUpdateApplications: (updatedApplications: Application[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

type SortableKeys = 'clientName' | 'mortgageLender' | 'loanAmount' | 'interestRateExpiryDate' | 'status' | 'solicitor.firmName';

const BrokerDashboard: React.FC<BrokerDashboardProps> = ({ user, viewedBroker, applications, onUpdateApplications, users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null);
  const [historyModalApp, setHistoryModalApp] = useState<Application | null>(null);
  const [viewingSolicitorApp, setViewingSolicitorApp] = useState<Application | null>(null);
  const [notesModalApp, setNotesModalApp] = useState<Application | null>(null);
  const [emailModalApp, setEmailModalApp] = useState<Application | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  const [emailedClients, setEmailedClients] = useState<Set<string>>(new Set());

  const displayUser = viewedBroker || user;

// Add this near the top of the component, after the displayUser definition (around line 37):

const shouldShowBrokerColumn = useMemo(() => {
  // Show broker column if:
  // 1. User is admin/team manager/broker admin AND
  // 2. They're viewing ALL applications (not just their own)
  return (user.isAdmin || user.isTeamManager || user.isBrokerAdmin) && !viewedBroker;
}, [user, viewedBroker]);

// Helper function to get broker name
const getBrokerName = (brokerId: string) => {
  const broker = users.find(u => u.id === brokerId);
  return broker?.name || 'Unknown';
};

  
console.log('🔍 Debug Info:', {
  userName: user.name,
  isAdmin: user.isAdmin,
  isTeamManager: user.isTeamManager,
  isBrokerAdmin: user.isBrokerAdmin,
  companyName: user.companyName,
  totalApplications: applications.length,
  totalUsers: users.length
});
  
  const brokerVisibleApplications = useMemo(() => {
    // If an admin/manager is viewing a specific broker's dashboard, show only that broker's applications.
    if (viewedBroker) {
      return applications.filter(app => app.brokerId === viewedBroker.id);
    }

    // Default dashboard views based on role:
    // Head admin sees all applications across all companies.
    if (user.isAdmin) {
      return applications;
    }
    
    // Team Managers and Broker Admins see all applications from their own company.
    if (user.isTeamManager || user.isBrokerAdmin) {
      const companyBrokerIds = users
        .filter(u => u.role === Role.BROKER && u.companyName === user.companyName)
        .map(u => u.id);
      return applications.filter(app => companyBrokerIds.includes(app.brokerId));
    }

    // Default for a standard broker: see only their own applications.
    return applications.filter(app => app.brokerId === user.id);
  }, [applications, user, users, viewedBroker]);

  const statusCounts = useMemo(() => {
    const counts = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    brokerVisibleApplications.forEach(app => {
        if (counts[app.status] !== undefined) {
            counts[app.status]++;
        }
    });

    return counts;
  }, [brokerVisibleApplications]);

  const sortedAndFilteredApplications = useMemo(() => {
    let filtered = brokerVisibleApplications;

    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filtered = filtered.filter(app => {
            return (
                app.clientName.toLowerCase().includes(lowercasedFilter) ||
                app.clientEmail.toLowerCase().includes(lowercasedFilter) ||
                app.propertyAddress.toLowerCase().includes(lowercasedFilter) ||
                app.mortgageLender.toLowerCase().includes(lowercasedFilter) ||
                (app.solicitor && app.solicitor.firmName.toLowerCase().includes(lowercasedFilter)) ||
                STATUS_DISPLAY_NAMES[app.status].toLowerCase().includes(lowercasedFilter)
            );
        });
    }
    
    if (sortConfig !== null) {
      const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o || {})[k], obj);
      
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (sortConfig.key === 'status') {
            aValue = STATUS_ORDER.indexOf(a.status);
            bValue = STATUS_ORDER.indexOf(b.status);
        } else {
            aValue = getNestedValue(a, sortConfig.key);
            bValue = getNestedValue(b, sortConfig.key);
        }

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        let comparison = 0;
        if (aValue > bValue) {
            comparison = 1;
        } else if (aValue < bValue) {
            comparison = -1;
        }
        
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    } else {
      filtered.sort((a, b) => {
  const aDate = a.history && a.history.length > 0 ? new Date(a.history[a.history.length-1].date).getTime() : 0;
  const bDate = b.history && b.history.length > 0 ? new Date(b.history[b.history.length-1].date).getTime() : 0;
  return bDate - aDate;
});
    }

    return filtered;

  }, [brokerVisibleApplications, searchTerm, sortConfig, statusFilter]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleOpenCreateModal = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: Application) => {
    setEditingApplication(app);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
  };

  const handleSaveApplication = async (appData: Omit<Application, 'id' | 'history' | 'clientId' | 'brokerId'> & { id?: string; clientPassword?: string }) => {
    if (appData.id) { // Editing existing application
      const { updateApplication } = await import('../../services/supabaseService');
      const { data, error } = await updateApplication(appData.id, appData);
      
      if (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application. Please try again.');
        return;
      }
      
      if (data) {
        const updatedApplications = applications.map(app =>
          app.id === appData.id ? data : app
        );
        onUpdateApplications(updatedApplications);
      }
    } else { // Creating new application
      const { createClientProfile, createApplication } = await import('../../services/supabaseService');
      const clientUser = users.find(u => u.email.toLowerCase() === appData.clientEmail.toLowerCase());
      let clientId: string;
      
      if (!clientUser) {
        // Ensure we have a password for new client
        const clientPassword = appData.clientPassword || `Client${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 100)}`;
        
        // Create a new client profile in Supabase with auth user
        const { data: newClientData, error: clientError } = await createClientProfile(
          appData.clientName,
          appData.clientEmail,
          clientPassword,
          appData.clientContactNumber,
          appData.clientCurrentAddress,
          displayUser.id
        );
        
        if (clientError || !newClientData) {
          console.error('Error creating client:', clientError);
          alert('Failed to create client profile. Please try again.');
          return;
        }
        
        const newClient: User = {
          id: newClientData.id,
          name: newClientData.name || appData.clientName,
          email: newClientData.email || appData.clientEmail,
          role: Role.CLIENT,
          contactNumber: newClientData.contact_number || appData.clientContactNumber,
          currentAddress: newClientData.current_address || appData.clientCurrentAddress,
        };
        setUsers([...users, newClient]);
        clientId = newClientData.id;
      } else {
        clientId = clientUser.id;
      }

      const newApplicationData: Omit<Application, 'id' | 'history'> = {
        ...appData,
        clientId: clientId,
        brokerId: displayUser.id,
        notes: appData.notes || '',
      };
      
      const { data: newApp, error: appError } = await createApplication(newApplicationData);
      
      if (appError || !newApp) {
        console.error('Error creating application:', appError);
        alert('Failed to create application. Please try again.');
        return;
      }
      
      onUpdateApplications([...applications, newApp]);
    }
    handleCloseModal();
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === appId);
    if (!app || app.status === newStatus) return;
    
    const { updateApplicationStatus } = await import('../../services/supabaseService');
    const { data, error } = await updateApplicationStatus(appId, newStatus);
    
    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
      return;
    }
    
    if (data) {
      const updatedApplications = applications.map(app =>
        app.id === appId ? data : app
      );
      onUpdateApplications(updatedApplications);
    }
  };

  const handleDeleteApplication = async () => {
    if (deletingApplicationId) {
      const { deleteApplication } = await import('../../services/supabaseService');
      const { error } = await deleteApplication(deletingApplicationId);
      
      if (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
        return;
      }
      
      const updatedApplications = applications.filter(app => app.id !== deletingApplicationId);
      onUpdateApplications(updatedApplications);
      setDeletingApplicationId(null);
    }
  };

  const handleSaveNotes = async (appId: string, newNotes: string) => {
    const { updateApplication } = await import('../../services/supabaseService');
    const { data, error } = await updateApplication(appId, { notes: newNotes });
    
    if (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes. Please try again.');
      return;
    }
    
    if (data) {
      const updatedApplications = applications.map(app => 
        app.id === appId ? data : app
      );
      onUpdateApplications(updatedApplications);
    }
    setNotesModalApp(null);
  };
  
  const handleSendEmail = async (app: Application) => {
    const { updateApplicationStatus } = await import('../../services/supabaseService');
    const { data, error } = await updateApplicationStatus(app.id, ApplicationStatus.RATE_EXPIRY_REMINDER_SENT);
    
    if (error) {
      console.error('Error sending email notification:', error);
      alert('Failed to send notification. Please try again.');
      return;
    }
    
    if (data) {
      const updatedApplications = applications.map(currentApp =>
        currentApp.id === app.id ? data : currentApp
      );
      onUpdateApplications(updatedApplications);
    }
    
    alert(`An expiry notification has been sent to ${app.clientName}.`);
    setEmailedClients(prev => new Set(prev).add(app.id));
    setEmailModalApp(null);
  };


  return (
    <div className="container mx-auto">
       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark dark:text-gray-100">
                        {viewedBroker ? `${viewedBroker.name}'s Dashboard` : `${user.name}'s Dashboard`}
                        {viewedBroker && <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-2">(Viewing as {user.name})</span>}
                    </h1>
                    {displayUser.companyName && (
                        <p className="text-md text-gray-600 dark:text-gray-400 font-medium">{displayUser.companyName}</p>
                    )}
                </div>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by name, email, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    aria-label="Filter by status"
                >
                    <option value="">All Statuses</option>
                    {STATUS_ORDER.map(status => (
                        <option key={status} value={status}>
                            {STATUS_DISPLAY_NAMES[status]}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors flex-shrink-0"
                >
                    New Application
                </button>
                </div>
            </div>
       </div>

       <div className="mb-8">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-gray-200 mb-4">Pipeline Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {STATUS_ORDER.map(status => (
                    <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate" title={STATUS_DISPLAY_NAMES[status]}>{STATUS_DISPLAY_NAMES[status]}</p>
                        <p className="text-3xl font-bold text-brand-primary dark:text-blue-400 mt-2">{statusCounts[status]}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
           <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th onClick={() => requestSort('clientName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Client / Property{getSortIndicator('clientName')}</th>
                {shouldShowBrokerColumn && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Broker</th>
                )}
                <th onClick={() => requestSort('mortgageLender')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Lender{getSortIndicator('mortgageLender')}</th>
                <th onClick={() => requestSort('solicitor.firmName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Solicitor Firm{getSortIndicator('solicitor.firmName')}</th>
                <th onClick={() => requestSort('loanAmount')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Loan{getSortIndicator('loanAmount')}</th>
                <th onClick={() => requestSort('interestRateExpiryDate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Rate / Expiry{getSortIndicator('interestRateExpiryDate')}</th>
                <th onClick={() => requestSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[200px] cursor-pointer">Status{getSortIndicator('status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredApplications.map(app => {
                const sixMonthsFromNow = new Date();
                sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
                const expiryDate = new Date(app.interestRateExpiryDate);
                const isExpiringSoon = expiryDate < sixMonthsFromNow;

                return (
                      <tr key={app.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <button onClick={() => setHistoryModalApp(app)} className="text-sm font-semibold text-brand-secondary dark:text-blue-400 hover:underline text-left">
            {app.clientName}
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">{app.propertyAddress}</div>
      </td>
      {shouldShowBrokerColumn && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
          {getBrokerName(app.brokerId)}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{app.mortgageLender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <button onClick={() => setViewingSolicitorApp(app)} className="text-brand-secondary dark:text-blue-400 hover:underline text-left">
                          {app.solicitor.firmName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(app.loanAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{app.interestRate.toFixed(2)}%</div>
                      <div className={`text-xs ${isExpiringSoon ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                        Expires: {new Date(app.interestRateExpiryDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="w-full pl-3 pr-10 py-2 text-sm bg-brand-primary dark:bg-gray-600 border-brand-secondary dark:border-gray-500 text-white focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary rounded-md"
                        >
                          {STATUS_ORDER.map(status => (
                            <option key={status} value={status}>
                              {STATUS_DISPLAY_NAMES[status]}
                            </option>
                          ))}
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isExpiringSoon && (
                        <button
                          onClick={() => setEmailModalApp(app)}
                          disabled={emailedClients.has(app.id)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-4 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {emailedClients.has(app.id) ? 'Emailed' : 'Email'}
                        </button>
                      )}
                      <button onClick={() => setNotesModalApp(app)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4">Notes</button>
                      <button onClick={() => handleOpenEditModal(app)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">Edit</button>
                      <button onClick={() => setDeletingApplicationId(app.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
            {sortedAndFilteredApplications.length === 0 && (
                 <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No applications found.</p>
                </div>
            )}
        </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApplication}
        application={editingApplication}
      />

      <ConfirmModal
        isOpen={!!deletingApplicationId}
        onClose={() => setDeletingApplicationId(null)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
      />

      <HistoryModal
        isOpen={!!historyModalApp}
        onClose={() => setHistoryModalApp(null)}
        application={historyModalApp}
      />

      <SolicitorInfoModal
        isOpen={!!viewingSolicitorApp}
        onClose={() => setViewingSolicitorApp(null)}
        application={viewingSolicitorApp}
      />

      <NotesModal
        isOpen={!!notesModalApp}
        onClose={() => setNotesModalApp(null)}
        onSave={(newNotes) => handleSaveNotes(notesModalApp!.id, newNotes)}
        application={notesModalApp}
      />
        
      <EmailClientModal
        isOpen={!!emailModalApp}
        onClose={() => setEmailModalApp(null)}
        onSend={() => handleSendEmail(emailModalApp!)}
        application={emailModalApp}
        broker={displayUser}
       />
    </div>
  );
};

export default BrokerDashboard;
