import React from 'react';

const DatabaseSetupNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary to-blue-900 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            Database Setup Required
          </h1>
          <p className="text-gray-600">
            Your Mortgage Tracker Pro needs database tables to be set up
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Login Issue?</strong> If you can't login after setting up, the admin user profile may be missing. Run <code className="bg-yellow-100 px-1 rounded">verify-and-fix-user.sql</code> to fix it.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-brand-dark mb-1">
                Run Database Setup Script
              </h3>
              <p className="text-gray-600 text-sm">
                Open your Supabase Dashboard → SQL Editor → Copy and run the contents of <code className="bg-gray-100 px-2 py-1 rounded text-xs">database-setup.sql</code>
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-brand-dark mb-1">
                Create Admin User
              </h3>
              <p className="text-gray-600 text-sm">
                In Supabase: Authentication → Users → Create user with email <code className="bg-gray-100 px-2 py-1 rounded text-xs">london3r@gmail.com</code>
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-brand-dark mb-1">
                Refresh & Login
              </h3>
              <p className="text-gray-600 text-sm">
                Reload this page and login with your credentials
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-brand-dark mb-3">📚 Quick Links:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Supabase Dashboard
            </a>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
            <a
              href="/QUICK_START.md"
              target="_blank"
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Setup Guide
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This message appears because the database hasn't been initialized yet. 
            Once you complete the setup, you'll see the login page automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetupNotice;
