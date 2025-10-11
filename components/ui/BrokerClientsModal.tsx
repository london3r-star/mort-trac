import React from 'react';
import { User, Application } from '../../types';

interface BrokerClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: User | null;
  applications: Application[];
}

const BrokerClientsModal: React.FC<BrokerClientsModalProps> = ({ isOpen, onClose, broker, applications }) => {
  if (!isOpen || !broker) return null;

  const brokerClients = applications.filter(app => app.brokerId === broker.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full flex flex-col">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-brand-primary dark:text-gray-100 mb-1">
            Clients for {broker.name}
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            Showing all clients managed by this broker.
          </p>
          <div className="border-t dark:border-gray-700 pt-4">
            {brokerClients.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {brokerClients.map(app => (
                  <li key={app.id} className="py-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{app.clientName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.propertyAddress}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">This broker has no clients assigned.</p>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:border-gray-500 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrokerClientsModal;