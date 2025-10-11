import React, { useState, useMemo } from 'react';
import { User, Role, Application, STATUS_DISPLAY_NAMES } from '../../types';
import { createBroker, updateUser } from '../../services/userService';
import BrokerModal from '../ui/BrokerModal';
import ConfirmModal from '../ui/ConfirmModal';

interface ManageBrokersPageProps {
  user: User;
  users: User[];
  setUsers: () => Promise<void>;
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
    if (brokerData.id) {
      await updateUser(brokerData.id, {
        name: brokerData.name,
        contactNumber: brokerData.contactNumber,
        companyName: brokerData.companyName,
        isTeamManager: brokerData.isTeamManager,
        isBrokerAdmin: brokerData.isBrokerAdmin,
      });
      await setUsers();
    } else {
      const newBroker = await createBroker({
        name: brokerData.name,
        email: brokerData.email,
        contactNumber: brokerData.contactNumber,
        companyName: brokerData.companyName,
        role: Role.BROKER,
        isTeamManager: brokerData.isTeamManager,
        isBrokerAdmin: brokerData.isBrokerAdmin,
      });

      if (!newBroker) {
        alert('Failed to create broker. Please try again.');
        return;
      }

      await setUsers();
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBroker) return;
    alert('Deleting brokers is not supported in this version. Please contact your administrator.');
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
        <h1 className="text-3xl font-bold text-brand-dark">Manage Brokers</h1>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
             <input
                type="text"
                placeholder="Search by name, status, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
            {!user.isBrokerAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="w-full md:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                >
                Add New Broker
              </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Name{getSortIndicator('name')}
              </th>
              <th scope="col" onClick={() => requestSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Email{getSortIndicator('email')}
              </th>
               <th scope="col" onClick={() => requestSort('contactNumber')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Contact Number{getSortIndicator('contactNumber')}
              </th>
              <th scope="col" onClick={() => requestSort('companyName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Company Name{getSortIndicator('companyName')}
              </th>
              <th scope="col" onClick={() => requestSort('isTeamManager')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Team Manager{getSortIndicator('isTeamManager')}
              </th>
              <th scope="col" onClick={() => requestSort('isBrokerAdmin')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Broker Admin{getSortIndicator('isBrokerAdmin')}
              </th>
              {user.isAdmin && (
                <th scope="col" onClick={() => requestSort('isAdmin')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                  Admin{getSortIndicator('isAdmin')}
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedBrokers.length > 0 ? (
              filteredAndSortedBrokers.map(broker => (
                <tr key={broker.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                        onClick={() => onViewBrokerDashboard(broker)}
                        className="text-brand-secondary hover:underline"
                    >
                        {broker.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broker.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broker.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broker.companyName}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {broker.isTeamManager ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Yes
                      </span> 
                      : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {broker.isBrokerAdmin ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800">
                        Yes
                      </span> 
                      : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    }
                  </td>
                  {user.isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {broker.isAdmin ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Yes
                        </span> 
                        : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      }
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenEditModal(broker)} 
                      className="text-blue-600 hover:text-blue-900 mr-4 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        (!user.isAdmin && (broker.isAdmin || broker.id === user.id)) ||
                        (user.isBrokerAdmin && broker.isTeamManager)
                      }
                    >
                        Edit
                    </button>
                    <button
                      onClick={() => setDeletingBroker(broker)}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={broker.id === user.id || (user.isTeamManager && broker.isAdmin) || user.isBrokerAdmin}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user.isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
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