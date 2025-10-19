import React, { useState, useEffect } from 'react';
import { Application, User } from '../../types';
import { sendEmailToClient } from '../../services/supabaseService';

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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

  if (!isOpen || !application || !broker) return null;

  const handleSend = async () => {
    setError('');
    setSending(true);

    try {
      const result = await sendEmailToClient(
        application.clientEmail,
        subject,
        body,
        broker.name,
        broker.email || 'hello@mortgagetracker.net'
      );

      if (result.success) {
        alert(`Email sent successfully to ${application.clientName}!`);
        onSend(); // This updates the status and closes the modal
      } else {
        setError(result.error?.message || 'Failed to send email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Email send error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-1">
            Email Client: {application.clientName}
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            Review and customize the email before sending.
          </p>
          <div className="border-t dark:border-gray-700 pt-4 space-y-4">
            <div>
              <label htmlFor="emailTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To
              </label>
              <input
                type="email"
                id="emailTo"
                value={application.clientEmail}
                disabled
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-md shadow-sm py-2 px-3 bg-gray-100 dark:bg-gray-800 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="emailSubject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Body
              </label>
              <textarea
                id="emailBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                disabled={sending}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:opacity-50"
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-auto">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !subject || !body}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-secondary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:border-gray-500 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailClientModal;
