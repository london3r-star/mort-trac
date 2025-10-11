import React, { useState } from 'react';
import { Application, ApplicationStatus, STATUS_ORDER, STATUS_DISPLAY_NAMES } from '../../types';

interface ApplicationCardProps {
  application: Application;
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColorMap: Record<ApplicationStatus, string> = {
    [ApplicationStatus.AWAITING_DOCUMENTS]: 'bg-yellow-100 text-yellow-800',
    [ApplicationStatus.AIP_IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [ApplicationStatus.AIP_APPROVED]: 'bg-indigo-100 text-indigo-800',
    [ApplicationStatus.FULL_APPLICATION_SUBMITTED]: 'bg-purple-100 text-purple-800',
    [ApplicationStatus.MORTGAGE_OFFERED]: 'bg-green-100 text-green-800',
    [ApplicationStatus.CONTRACTS_EXCHANGED]: 'bg-pink-100 text-pink-800',
    [ApplicationStatus.PURCHASE_COMPLETED]: 'bg-brand-secondary text-white',
    // FIX: Added missing status to satisfy the Record<ApplicationStatus, string> type.
    [ApplicationStatus.RATE_EXPIRY_REMINDER_SENT]: 'bg-orange-100 text-orange-800',
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onUpdateStatus, onEdit, onDelete }) => {
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    setSelectedStatus(newStatus);
    onUpdateStatus(application.id, newStatus);
  };
    
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-brand-primary">{application.clientName}</h3>
                <p className="text-sm text-gray-500">{application.propertyAddress}</p>
            </div>
             <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorMap[application.status]}`}>
                {STATUS_DISPLAY_NAMES[application.status]}
            </span>
        </div>
        <div className="mt-4 border-t pt-4">
            <p className="text-gray-700">
                <span className="font-semibold">Loan Amount:</span>{' '}
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(application.loanAmount)}
            </p>
             <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(application.history[application.history.length-1].date).toLocaleDateString()}
            </p>
        </div>

        <div className="mt-4">
          <label htmlFor={`status-${application.id}`} className="block text-sm font-medium text-gray-700">Update Status</label>
          <select
            id={`status-${application.id}`}
            value={selectedStatus}
            onChange={handleStatusChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-brand-primary border-brand-secondary text-white focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
          >
            {STATUS_ORDER.map(status => (
              <option key={status} value={status}>
                {STATUS_DISPLAY_NAMES[status]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
         <button onClick={onEdit} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
         <button onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
      </div>
    </div>
  );
};

export default ApplicationCard;