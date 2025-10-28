import React, { useState } from 'react';
import { Application, AppStage, STATUS_DISPLAY_NAMES, STATUS_ORDER } from '../../types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: any) => void;
  application: Application | null;
  brokerId: string;
}

const emptyApplication = {
  clientName: '',
  clientEmail: '',
  clientContactNumber: '',
  clientCurrentAddress: '',
  propertyAddress: '',
  loanAmount: 0,
  appStage: 'new' as const,
  mortgageLender: '',
  interestRate: '',
  interestRateExpiryDate: '',
  solicitorFirmName: '',
  solicitorName: '',
  solicitorEmail: '',
  solicitorContactNumber: '',
  notes: '',
};

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSave, application, brokerId }) => {
  const [formData, setFormData] = useState(emptyApplication);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (application) {
      setFormData({
        clientName: application.clientName || '',
        clientEmail: application.clientEmail || '',
        clientContactNumber: application.clientContactNumber || '',
        clientCurrentAddress: application.clientCurrentAddress || '',
        propertyAddress: application.propertyAddress || '',
        loanAmount: application.loanAmount || 0,
        appStage: application.appStage || 'new',
        mortgageLender: application.mortgageLender || '',
        interestRate: application.interestRate || '',
        interestRateExpiryDate: application.interestRateExpiryDate || '',
        solicitorFirmName: application.solicitorFirmName || '',
        solicitorName: application.solicitorName || '',
        solicitorEmail: application.solicitorEmail || '',
        solicitorContactNumber: application.solicitorContactNumber || '',
        notes: application.notes || '',
      });
    } else {
      setFormData(emptyApplication);
    }
    setFormErrors({});
  }, [application, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.clientName.trim()) errors.clientName = "Client name is required.";
    if (!application) {
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

    if (formData.solicitorEmail && !/\S+@\S+\.\S+/.test(formData.solicitorEmail)) {
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
      brokerId,
    };

    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-4">
              {application ? 'Edit Application' : 'Create New Application'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Details */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Client Details</h3>
              </div>

              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Name *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.clientName && <p className="text-red-500 text-xs mt-1">{formErrors.clientName}</p>}
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Email *</label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  disabled={!!application}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {formErrors.clientEmail && <p className="text-red-500 text-xs mt-1">{formErrors.clientEmail}</p>}
              </div>

              <div>
                <label htmlFor="clientContactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number *</label>
                <input
                  type="tel"
                  id="clientContactNumber"
                  name="clientContactNumber"
                  value={formData.clientContactNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.clientContactNumber && <p className="text-red-500 text-xs mt-1">{formErrors.clientContactNumber}</p>}
              </div>

              <div>
                <label htmlFor="clientCurrentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Address *</label>
                <input
                  type="text"
                  id="clientCurrentAddress"
                  name="clientCurrentAddress"
                  value={formData.clientCurrentAddress}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.clientCurrentAddress && <p className="text-red-500 text-xs mt-1">{formErrors.clientCurrentAddress}</p>}
              </div>

              {/* Property & Mortgage Details */}
              <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Property & Mortgage Details</h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Address *</label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.propertyAddress && <p className="text-red-500 text-xs mt-1">{formErrors.propertyAddress}</p>}
              </div>

              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount (£) *</label>
                <input
                  type="number"
                  id="loanAmount"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.loanAmount && <p className="text-red-500 text-xs mt-1">{formErrors.loanAmount}</p>}
              </div>

              <div>
                <label htmlFor="appStage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Stage</label>
                <select
                  id="appStage"
                  name="appStage"
                  value={formData.appStage}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
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
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                <input
                  type="text"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="e.g., 3.5"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="interestRateExpiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rate Expiry Date</label>
                <input
                  type="date"
                  id="interestRateExpiryDate"
                  name="interestRateExpiryDate"
                  value={formData.interestRateExpiryDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              {/* Solicitor Details */}
              <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Solicitor Details (Optional)</h3>
              </div>

              <div>
                <label htmlFor="solicitorFirmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Firm Name</label>
                <input
                  type="text"
                  id="solicitorFirmName"
                  name="solicitorFirmName"
                  value={formData.solicitorFirmName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="solicitorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Solicitor Name</label>
                <input
                  type="text"
                  id="solicitorName"
                  name="solicitorName"
                  value={formData.solicitorName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="solicitorContactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                <input
                  type="tel"
                  id="solicitorContactNumber"
                  name="solicitorContactNumber"
                  value={formData.solicitorContactNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="solicitorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  id="solicitorEmail"
                  name="solicitorEmail"
                  value={formData.solicitorEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
                {formErrors.solicitorEmail && <p className="text-red-500 text-xs mt-1">{formErrors.solicitorEmail}</p>}
              </div>

              {/* Notes */}
              <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Internal Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any internal notes about this application..."
                  className="block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                />
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
