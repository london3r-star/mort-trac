import React from 'react';
import { Application, STATUS_DISPLAY_NAMES } from '../../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;
  
  const sortedHistory = [...application.history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-brand-primary mb-4">
            Application Details for {application.clientName}
          </h2>

          <div className="mb-6 space-y-2 text-sm p-4 bg-gray-100 rounded-lg text-gray-800">
            <p><span className="font-semibold text-gray-600 w-32 inline-block">Email:</span> {application.clientEmail}</p>
            <p><span className="font-semibold text-gray-600 w-32 inline-block">Contact Number:</span> {application.clientContactNumber}</p>
            <p><span className="font-semibold text-gray-600 w-32 inline-block">Current Address:</span> {application.clientCurrentAddress}</p>
          </div>
          
          <h3 className="text-lg font-semibold text-brand-dark mb-2">
            Status History
          </h3>
          <div className="border-t pt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Updated
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistory.map((item, index) => (
                    <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {STATUS_DISPLAY_NAMES[item.status]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.date).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;