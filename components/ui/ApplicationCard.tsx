import React from 'react';
import { Application } from '../../types';

interface ApplicationCardProps {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
  onView: (app: Application) => void;
  onUpdateStage: () => void;
  onSendPortalInvite: (app: Application) => void;
  stageColorMap: Record<string, string>;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onEdit, 
  onDelete, 
  onView,
  onSendPortalInvite,
  stageColorMap 
}) => {
    
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-brand-primary dark:text-gray-100">{application.clientName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{application.propertyAddress}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stageColorMap[application.appStage]}`}>
            {application.appStage.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
        
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Loan Amount:</span>{' '}
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(application.loanAmount)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date(application.updatedAt || application.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Lender:</span> {application.mortgageLender}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Interest Rate:</span> {application.interestRate}%
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={() => onView(application)} 
          className="text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400"
        >
          View
        </button>
        <button 
          onClick={() => onSendPortalInvite(application)} 
          className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400"
        >
          Send Invite
        </button>
        <button 
          onClick={onEdit} 
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          Edit
        </button>
        <button 
          onClick={onDelete} 
          className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;