import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SecureLoginPage: React.FC = () => {
  const { signIn, resetPassword } = useAuth();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      setLoginError(error.message || 'Invalid email or password.');
    }
    
    setLoginLoading(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    const { error } = await resetPassword(forgotEmail);

    if (error) {
      setForgotError(error.message || 'Failed to send reset email.');
    } else {
      setForgotSuccess('Password reset email sent! Please check your inbox.');
      setForgotEmail('');
    }

    setForgotLoading(false);
  };

  if (isForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-primary dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 className="mt-6 text-3xl font-extrabold text-brand-dark dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Enter your email to receive reset instructions
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleForgotPasswordSubmit}>
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder="Email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
              />
            </div>

            {forgotError && <p className="text-sm text-red-600">{forgotError}</p>}
            {forgotSuccess && <p className="text-sm text-green-600">{forgotSuccess}</p>}

            <div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-300 disabled:opacity-50"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="text-sm text-center">
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setForgotError('');
                setForgotSuccess('');
              }}
              className="font-medium text-brand-secondary hover:text-opacity-80"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-primary dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-brand-dark dark:text-white">
            Mortgage Tracker Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loginLoading}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loginLoading}
              />
            </div>
          </div>

          {loginError && <p className="text-sm text-red-600">{loginError}</p>}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="font-medium text-brand-secondary hover:text-opacity-80"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-300 disabled:opacity-50"
            >
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
            <strong>Note:</strong> Accounts are created by administrators. Contact your admin if you need access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureLoginPage;
