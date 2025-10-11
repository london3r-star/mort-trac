import React from 'react';
import { Application } from '../../types';

interface SolicitorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-md text-gray-900">{value}</p>
    </div>
);

const SolicitorInfoModal: React.FC<SolicitorInfoModalProps> = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application || !application.solicitor) return null;
  
  const { solicitor, clientName } = application;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-brand-primary mb-1">
            Solicitor Details
          </h2>
          <p className="text-md text-gray-600 mb-4">
            for <span className="font-semibold">{clientName}</span>'s application
          </p>
          <div className="border-t pt-4 space-y-4">
            <DetailItem label="Firm Name" value={solicitor.firmName} />
            <DetailItem label="Solicitor Name" value={solicitor.solicitorName} />
            <DetailItem label="Email Address" value={solicitor.email} />
            <DetailItem label="Contact Number" value={solicitor.contactNumber} />
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolicitorInfoModal;
