import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brokerData: { id?: string; name: string; email: string; contactNumber: string; companyName: string; isTeamManager: boolean; isBrokerAdmin: boolean; }) => void;
  existingUsers: User[];
  brokerToEdit?: User | null;
  loggedInUser: User;
}

const BrokerModal: React.FC<BrokerModalProps> = ({ isOpen, onClose, onSave, existingUsers, brokerToEdit, loggedInUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isTeamManager, setIsTeamManager] = useState(false);
  const [isBrokerAdmin, setIsBrokerAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (brokerToEdit) {
            setName(brokerToEdit.name);
            setEmail(brokerToEdit.email);
            setContactNumber(brokerToEdit.contactNumber || '');
            setCompanyName(brokerToEdit.companyName || '');
            setIsTeamManager(!!brokerToEdit.isTeamManager);
            setIsBrokerAdmin(!!brokerToEdit.isBrokerAdmin);
        } else {
            setName('');
            setEmail('');
            setContactNumber('');
            if (loggedInUser.isTeamManager && !loggedInUser.isAdmin) {
                setCompanyName(loggedInUser.companyName || '');
            } else {
                setCompanyName('');
            }
            setIsTeamManager(false);
            setIsBrokerAdmin(false);
        }
        setError('');
    }
  }, [isOpen, brokerToEdit, loggedInUser]);


  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !contactNumber.trim() || !companyName.trim()) {
      setError('All fields are required.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!brokerToEdit && existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        setError('A user with this email already exists.');
        return;
    }

    onSave({
        id: brokerToEdit?.id,
        name,
        email,
        contactNumber,
        companyName,
        isTeamManager,
        isBrokerAdmin
    });
  };

  const isCompanyNameDisabled = (loggedInUser.isTeamManager || loggedInUser.isBrokerAdmin) && !loggedInUser.isAdmin;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">
              {brokerToEdit ? 'Edit Broker' : 'Add New Broker'}
            </h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="brokerName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                    type="text"
                    id="brokerName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="brokerEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                    type="email"
                    id="brokerEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!brokerToEdit}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    />
                </div>
                <div>
                    <label htmlFor="brokerContact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                    type="tel"
                    id="brokerContact"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="brokerCompany" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                    type="text"
                    id="brokerCompany"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={isCompanyNameDisabled}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    />
                </div>

                {loggedInUser.isAdmin && !brokerToEdit?.isAdmin && (
                  <div className="flex items-center pt-2">
                    <input
                      id="isTeamManager"
                      type="checkbox"
                      checked={isTeamManager}
                      onChange={(e) => setIsTeamManager(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                    />
                    <label htmlFor="isTeamManager" className="ml-3 block text-sm font-medium text-gray-700">
                      Set as Team Manager
                    </label>
                  </div>
                )}
                 {(loggedInUser.isAdmin || loggedInUser.isTeamManager) && !brokerToEdit?.isAdmin && (
                  <div className="flex items-center pt-2">
                    <input
                      id="isBrokerAdmin"
                      type="checkbox"
                      checked={isBrokerAdmin}
                      onChange={(e) => setIsBrokerAdmin(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                    />
                    <label htmlFor="isBrokerAdmin" className="ml-3 block text-sm font-medium text-gray-700">
                      Set as Broker Admin
                    </label>
                  </div>
                )}
                 {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-secondary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary sm:ml-3 sm:w-auto sm:text-sm"
            >
              {brokerToEdit ? 'Save Changes' : 'Save Broker'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrokerModal;