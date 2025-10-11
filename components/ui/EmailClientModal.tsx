import React, { useState, useEffect } from 'react';
import { Application, User } from '../../types';

interface EmailClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  application: Application | null;
  broker: User | null;
}

const EmailClientModal: React.FC<EmailClientModalProps> = ({ isOpen, onClose, onSend, application, broker }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (application && broker) {
      const expiryDate = new Date(application.interestRateExpiryDate).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const defaultSubject = `Regarding your Mortgage Rate Expiry`;
      
      const defaultBody = `Dear ${application.clientName},

I hope this email finds you well.

I'm writing to remind you that the special interest rate on your mortgage for the property at ${application.propertyAddress} is due to expire on ${expiryDate}.

It's a good time to review your options to ensure you continue to have the best possible rate. Please get in touch at your earliest convenience to discuss the next steps.

Best regards,

${broker.name}
${broker.companyName || ''}
${broker.contactNumber || ''}`;

      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [application, broker, isOpen]);

  if (!isOpen || !application) return null;

  const handleSend = () => {
    // In a real app, you'd pass the subject and body to an email service
    onSend();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-primary mb-1">
            Email Client: {application.clientName}
          </h2>
          <p className="text-md text-gray-600 mb-4">
            Review and customize the email before sending.
          </p>
          <div className="border-t pt-4 space-y-4">
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="emailSubject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700">
                Body
              </label>
              <textarea
                id="emailBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-auto">
          <button
            type="button"
            onClick={handleSend}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-secondary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary sm:ml-3 sm:w-auto sm:text-sm"
          >
            Send Email
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailClientModal;
