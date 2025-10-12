import React, { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  userName: string;
  userEmail: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, password, userName, userEmail }) => {
  const [copied, setCopied] = useState(false);

  console.log('🔵 PasswordModal render:', { isOpen, userName, userEmail, hasPassword: !!password });

  if (!isOpen) {
    console.log('❌ PasswordModal not showing - isOpen is false');
    return null;
  }
  
  console.log('✅ PasswordModal should be visible');

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Broker Created Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userName} has been added to the system
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
              {userEmail}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temporary Password
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-md text-gray-900 dark:text-white font-mono">
                {password}
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-opacity-90 transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Important:</strong> Please share these credentials with the broker. They will be required to change the password on first login.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-brand-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PasswordModal;
