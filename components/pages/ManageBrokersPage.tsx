import React, { useState, useMemo } from 'react';
import { User, Role, Application, STATUS_DISPLAY_NAMES } from '../../types';
import BrokerModal from '../ui/BrokerModal';
import ConfirmModal from '../ui/ConfirmModal';

interface ManageBrokersPageProps {
  user: User;
  users: User[];
  setUsers: (users: User[]) => void;
  onViewBrokerDashboard: (broker: User) => void;
  applications: Application[];
}

type SortableKeys = 'name' | 'email' | 'contactNumber' | 'companyName' | 'isAdmin' | 'isTeamManager' | 'isBrokerAdmin';

const ManageBrokersPage: React.FC<ManageBrokersPageProps> = ({ user, users, setUsers, onViewBrokerDashboard, applications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<User | null>(null);
  const [deletingBroker, setDeletingBroker] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);


  const handleOpenCreateModal = () => {
    setEditingBroker(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (broker: User) => {
    setEditingBroker(broker);
    setIsModalOpen(true);
  };

  const handleSaveBroker = async (brokerData: { id?: string; name: string; email: string; contactNumber: string; companyName: string; isTeamManager: boolean; isBrokerAdmin: boolean; }) => {
    if (brokerData.id) { // Editing
        const { updateUserProfile } = await import('../../services/supabaseService');
        const { error } = await updateUserProfile(brokerData.id, {
          name: brokerData.name,
          contactNumber: brokerData.contactNumber,
          companyName: brokerData.companyName,
          isTeamManager: brokerData.isTeamManager,
          isBrokerAdmin: brokerData.isBrokerAdmin,
        });
        
        if (error) {
          console.error('Error updating broker:', error);
          alert('Failed to update broker. Please try again.');
          return;
        }
        
        setUsers(users.map(u => 
            u.id === brokerData.id 
            ? { ...u, name: brokerData.name, contactNumber: brokerData.contactNumber, companyName: brokerData.companyName, isTeamManager: brokerData.isTeamManager, isBrokerAdmin: brokerData.isBrokerAdmin } 
            : u
        ));
    } else { // Creating
        // Note: Creating new brokers requires Supabase auth signup
        // For now, we'll just update the local state
        const newBroker: User = {
            id: `broker-${new Date().getTime()}`,
            name: brokerData.name,
            email: brokerData.email,
            contactNumber: brokerData.contactNumber,
            companyName: brokerData.companyName,
            role: Role.BROKER,
            isTeamManager: brokerData.isTeamManager,
            isBrokerAdmin: brokerData.isBrokerAdmin,
        };
        setUsers([...users, newBroker]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBroker) return;
    
    // Delete from database
    const { deleteUser } = await import('../../services/supabaseService');
    const { error } = await deleteUser(deletingBroker.id);
    
    if (error) {
      console.error('Error deleting broker:', error);
      alert('Failed to delete broker. Please try again.');
      setDeletingBroker(null);
      return;
    }
    
    // Update local state
    const updatedUsers = users.filter(u => u.id !== deletingBroker.id);
    setUsers(updatedUsers);
    setDeletingBroker(null);
  };

  const filteredAndSortedBrokers = useMemo(() => {
    let filteredBrokers = users.filter(u => u.role === Role.BROKER);
    
    // Team managers and Broker Admins can only see brokers in their own company
    if ((user.isTeamManager || user.isBrokerAdmin) && !user.isAdmin) {
      filteredBrokers = filteredBrokers.filter(b => b.companyName === user.companyName);
    }

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredBrokers = filteredBrokers.filter(broker => {
            if (
                broker.name.toLowerCase().includes(lowercasedFilter) ||
                broker.email.toLowerCase().includes(lowercasedFilter) ||
                (broker.contactNumber && broker.contactNumber.toLowerCase().includes(lowercasedFilter)) ||
                (broker.companyName && broker.companyName.toLowerCase().includes(lowercasedFilter))
            ) {
                return true;
            }
    
            // Check if any of the broker's applications have a matching status
            return applications.some(app => 
                app.brokerId === broker.id &&
                STATUS_DISPLAY_NAMES[app.status].toLowerCase().includes(lowercasedFilter)
            );
        });
    }

    if (sortConfig !== null) {
        filteredBrokers.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

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
    }

    return filteredBrokers;
  }, [users, searchTerm, sortConfig, user, applications]);

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Manage Brokers</h1>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
             <input
                type="text"
                placeholder="Search by name, status, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
            {(user.isAdmin || user.isTeamManager) && (
              <button
                onClick={handleOpenCreateModal}
                className="w-full md:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                >
                Add New Broker
              </button>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Name{getSortIndicator('name')}
              </th>
              <th scope="col" onClick={() => requestSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Email{getSortIndicator('email')}
              </th>
               <th scope="col" onClick={() => requestSort('contactNumber')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Contact Number{getSortIndicator('contactNumber')}
              </th>
              <th scope="col" onClick={() => requestSort('companyName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Company Name{getSortIndicator('companyName')}
              </th>
              <th scope="col" onClick={() => requestSort('isTeamManager')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Team Manager{getSortIndicator('isTeamManager')}
              </th>
              <th scope="col" onClick={() => requestSort('isBrokerAdmin')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                Broker Admin{getSortIndicator('isBrokerAdmin')}
              </th>
              {user.isAdmin && (
                <th scope="col" onClick={() => requestSort('isAdmin')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                  Admin{getSortIndicator('isAdmin')}
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedBrokers.length > 0 ? (
              filteredAndSortedBrokers.map(broker => (
                <tr key={broker.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    <button
                        onClick={() => onViewBrokerDashboard(broker)}
                        className="text-brand-secondary dark:text-blue-400 hover:underline"
                    >
                        {broker.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{broker.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{broker.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{broker.companyName}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {broker.isTeamManager ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        Yes
                      </span> 
                      : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        No
                      </span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {broker.isBrokerAdmin ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                        Yes
                      </span> 
                      : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        No
                      </span>
                    }
                  </td>
                  {user.isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {broker.isAdmin ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          Yes
                        </span> 
                        : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          No
                        </span>
                      }
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenEditModal(broker)} 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        (!user.isAdmin && broker.isAdmin) // Non-admins can't edit admins
                      }
                    >
                        Edit
                    </button>
                    <button
                      onClick={() => setDeletingBroker(broker)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        broker.id === user.id || // Can't delete yourself
                        (!user.isAdmin && broker.isAdmin) // Non-admins can't delete admins
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user.isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No brokers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <BrokerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBroker}
        existingUsers={users}
        brokerToEdit={editingBroker}
        loggedInUser={user}
      />

      <ConfirmModal
        isOpen={!!deletingBroker}
        onClose={() => setDeletingBroker(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Broker"
        message={`Are you sure you want to remove ${deletingBroker?.name}? This will permanently delete their account.`}
      />

    </div>
  );
};

export default ManageBrokersPage;