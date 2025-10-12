import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus, STATUS_ORDER, STATUS_DISPLAY_NAMES, Solicitor } from '../../types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: Omit<Application, 'id' | 'history' | 'clientId' | 'brokerId'> & { id?: string }) => void;
  application: Application | null;
}

type FormData = Omit<Application, 'id' | 'history' | 'clientId' | 'brokerId'>;

const emptySolicitor: Solicitor = {
  firmName: '',
  solicitorName: '',
  contactNumber: '',
  email: ''
};

const emptyApplication: FormData = {
  clientName: '',
  clientEmail: '',
  clientContactNumber: '',
  clientCurrentAddress: '',
  propertyAddress: '',
  loanAmount: 0,
  status: ApplicationStatus.AWAITING_DOCUMENTS,
  mortgageLender: '',
  interestRate: 0,
  interestRateExpiryDate: '',
  solicitor: emptySolicitor
};


const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSave, application }) => {
  const [formData, setFormData] = useState<FormData>(emptyApplication);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [temporaryClientPassword, setTemporaryClientPassword] = useState('');

  // Generate random password for client
  const generatePassword = () => {
    return `Client${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 100)}`;
  };

  useEffect(() => {
    if (application) {
      const { id, history, clientId, brokerId, ...editableData } = application;
      setFormData({
        ...editableData,
        solicitor: editableData.solicitor || emptySolicitor,
      });
      setTemporaryClientPassword(''); // No password for editing
    } else {
      setFormData(emptyApplication);
      setTemporaryClientPassword(generatePassword()); // Auto-generate for new client
    }
    setFormErrors({});
  }, [application, isOpen]);

  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    if (name === 'loanAmount' || name === 'interestRate') {
      processedValue = value === '' ? '' : parseFloat(value);
      if (isNaN(processedValue as number)) {
        processedValue = 0;
      }
    }
    
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSolicitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      solicitor: {
        ...prev.solicitor,
        [name]: value
      }
    }));
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.clientName.trim()) errors.clientName = "Client name is required.";
    if (!application) { // Only validate email on create
        if (!formData.clientEmail.trim()) {
            errors.clientEmail = "Client email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
            errors.clientEmail = "Email is invalid.";
        }
    }
    if (!formData.clientContactNumber.trim()) errors.clientContactNumber = "Client contact number is required.";
    if (!formData.clientCurrentAddress.trim()) errors.clientCurrentAddress = "Client current address is required.";
    if (!formData.propertyAddress.trim()) errors.propertyAddress = "Property address is required.";
    if (formData.loanAmount <= 0) errors.loanAmount = "Loan amount must be greater than 0.";
    if (!formData.mortgageLender.trim()) errors.mortgageLender = "Lender is required.";
    if (formData.interestRate < 0) errors.interestRate = "Interest rate cannot be a negative number.";
    if (!formData.interestRateExpiryDate) errors.interestRateExpiryDate = "Rate expiry date is required.";

    // Solicitor fields are optional, but if an email is provided, it must be valid.
    if (formData.solicitor.email && !/\S+@\S+\.\S+/.test(formData.solicitor.email)) {
        errors.solicitorEmail = "Solicitor email is invalid.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submissionData = {
      ...(application ? { id: application.id } : {}),
      ...formData,
    };

    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-4">
              {application ? 'Edit Application' : 'Create New Application'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                 <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.clientName && <p className="text-red-500 text-xs mt-1">{formErrors.clientName}</p>}
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Email</label>
                 <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  disabled={!!application}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:text-gray-500"
                />
                {formErrors.clientEmail && <p className="text-red-500 text-xs mt-1">{formErrors.clientEmail}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="clientContactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Contact Number</label>
                <input
                    type="tel"
                    id="clientContactNumber"
                    name="clientContactNumber"
                    value={formData.clientContactNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.clientContactNumber && <p className="text-red-500 text-xs mt-1">{formErrors.clientContactNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="clientCurrentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Current Address</label>
                <input
                    type="text"
                    id="clientCurrentAddress"
                    name="clientCurrentAddress"
                    value={formData.clientCurrentAddress}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.clientCurrentAddress && <p className="text-red-500 text-xs mt-1">{formErrors.clientCurrentAddress}</p>}
              </div>

              <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Property &amp; Mortgage Details</h3>
              </div>


              <div className="md:col-span-2">
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Address (for mortgage)</label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.propertyAddress && <p className="text-red-500 text-xs mt-1">{formErrors.propertyAddress}</p>}
              </div>
              
               <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount (£)</label>
                <input
                  type="number"
                  id="loanAmount"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.loanAmount && <p className="text-red-500 text-xs mt-1">{formErrors.loanAmount}</p>}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                >
                  {STATUS_ORDER.map(status => (
                    <option key={status} value={status}>{STATUS_DISPLAY_NAMES[status]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mortgageLender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lender</label>
                <input
                  type="text"
                  id="mortgageLender"
                  name="mortgageLender"
                  value={formData.mortgageLender}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                 {formErrors.mortgageLender && <p className="text-red-500 text-xs mt-1">{formErrors.mortgageLender}</p>}
              </div>

              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.interestRate && <p className="text-red-500 text-xs mt-1">{formErrors.interestRate}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="interestRateExpiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rate Expiry Date</label>
                <input
                  type="date"
                  id="interestRateExpiryDate"
                  name="interestRateExpiryDate"
                  value={formData.interestRateExpiryDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                />
                {formErrors.interestRateExpiryDate && <p className="text-red-500 text-xs mt-1">{formErrors.interestRateExpiryDate}</p>}
              </div>

              <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Solicitor Details</h3>
              </div>
               <div>
                <label htmlFor="firmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Firm Name</label>
                <input type="text" id="firmName" name="firmName" value={formData.solicitor.firmName} onChange={handleSolicitorChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                {formErrors.solicitorFirmName && <p className="text-red-500 text-xs mt-1">{formErrors.solicitorFirmName}</p>}
              </div>
              <div>
                <label htmlFor="solicitorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Solicitor Name</label>
                <input type="text" id="solicitorName" name="solicitorName" value={formData.solicitor.solicitorName} onChange={handleSolicitorChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                {formErrors.solicitorName && <p className="text-red-500 text-xs mt-1">{formErrors.solicitorName}</p>}
              </div>
              <div>
                <label htmlFor="solicitorContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                <input type="tel" id="solicitorContact" name="contactNumber" value={formData.solicitor.contactNumber} onChange={handleSolicitorChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                {formErrors.solicitorContact && <p className="text-red-500 text-xs mt-1">{formErrors.solicitorContact}</p>}
              </div>
              <div>
                <label htmlFor="solicitorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" id="solicitorEmail" name="email" value={formData.solicitor.email} onChange={handleSolicitorChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                {formErrors.solicitorEmail && <p className="text-red-500 text-xs mt-1">{formErrors.solicitorEmail}</p>}
              </div>

            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-secondary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary sm:ml-3 sm:w-auto sm:text-sm"
            >
              {application ? 'Save Changes' : 'Create Application'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:border-gray-500 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;