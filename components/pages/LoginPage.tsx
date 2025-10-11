import React, { useState } from 'react';
import { User } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users, setUsers }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setLoginError('');
      onLogin(user);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    const existingUser = users.find(u => u.email === regEmail);
    
    if (!existingUser) {
       setRegError("This email has not been registered in the system. Please contact an administrator.");
       return;
    }

    if (existingUser.password) {
        setRegError("An account with this email already exists. Please log in.");
        return;
    }

    if (existingUser.name.toLowerCase() !== regName.toLowerCase()) {
        setRegError("The name does not match the one on record.");
        return;
    }

    // Success: Update user with password
    const updatedUsers = users.map(u => 
        u.id === existingUser.id ? { ...u, password: regPassword, name: regName } : u
    );
    setUsers(updatedUsers);

    const newlyRegisteredUser = updatedUsers.find(u => u.id === existingUser.id);
    if (newlyRegisteredUser) {
        onLogin(newlyRegisteredUser);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-primary dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-brand-dark dark:text-white">
            {isRegistering ? 'Create Your Account' : 'Mortgage Tracker Pro'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {isRegistering ? 'Set a password to access your dashboard' : 'Sign in to your account'}
          </p>
        </div>

        {isRegistering ? (
            // Registration Form
            <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                     <div>
                        <input name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} />
                    </div>
                    <div>
                        <input name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Email address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                    </div>
                    <div>
                        <input name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Choose Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                    </div>
                     <div>
                        <input name="confirmPassword" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Confirm Password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
                    </div>
                </div>
                {regError && <p className="text-sm text-red-600">{regError}</p>}
                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-300">
                    Create Account
                    </button>
                </div>
            </form>
        ) : (
            // Login Form
            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <input name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </div>
                    <div>
                        <input name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-3 bg-brand-primary dark:bg-gray-700 border border-brand-secondary dark:border-gray-600 placeholder-brand-accent dark:placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary focus:z-10 sm:text-sm" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </div>
                </div>
                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-300">
                    Sign in
                    </button>
                </div>
            </form>
        )}

        <div className="text-sm text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setLoginError(''); setRegError(''); }} className="font-medium text-brand-secondary hover:text-opacity-80">
                {isRegistering ? 'Already have an account? Sign in' : "New user? Create an account"}
            </button>
        </div>

        {!isRegistering && (
             <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-600">
                <p className="font-semibold">Demo Admin Broker:</p>
                <p>Email: <span className="font-mono">shahid.anwar@broker.com</span></p>
                <p>Password: <span className="font-mono">brokerpass</span></p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;