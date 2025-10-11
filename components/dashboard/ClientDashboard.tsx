import React from 'react';
import { User, Application, STATUS_DISPLAY_NAMES } from '../../types';
import ProgressTracker from '../ui/ProgressTracker';

interface ClientDashboardProps {
  user: User;
  application: Application | null;
  broker: User | null;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
        {children}
    </div>
);


const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, application, broker }) => {
  if (!application) {
    return (
      <div className="container mx-auto text-center py-10">
        <h1 className="text-3xl font-bold text-brand-dark dark:text-gray-100 mb-4">Welcome, {user.name}</h1>
        <p className="text-gray-600 dark:text-gray-300">You do not have any active mortgage applications at the moment.</p>
      </div>
    );
  }

  const {
    propertyAddress,
    loanAmount,
    status,
    history,
    mortgageLender,
    interestRate,
    interestRateExpiryDate,
    solicitor,
  } = application;

  const sortedHistory = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const expiryDate = new Date(interestRateExpiryDate);
  const isExpiringSoon = expiryDate < sixMonthsFromNow;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark dark:text-gray-100 mb-2">Welcome, {user.name}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Here's the latest update on your mortgage application.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <InfoCard title="Property Address">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{propertyAddress}</p>
        </InfoCard>
        <InfoCard title="Loan Amount">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(loanAmount)}
            </p>
        </InfoCard>
         <InfoCard title="Current Status">
            <p className="text-lg font-semibold text-brand-primary dark:text-blue-400">{STATUS_DISPLAY_NAMES[status]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last updated: {new Date(history[history.length - 1].date).toLocaleDateString()}</p>
        </InfoCard>
        {broker && (
          <InfoCard title="Your Broker">
              <p className="text-lg font-semibold text-brand-primary dark:text-blue-400">{broker.name}</p>
              {broker.companyName && <p className="text-md text-gray-700 dark:text-gray-300 font-medium">{broker.companyName}</p>}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{broker.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{broker.contactNumber}</p>
          </InfoCard>
        )}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <InfoCard title="Mortgage Details" className="lg:col-span-2">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{mortgageLender}</p>
            <p className={`text-sm ${isExpiringSoon ? 'text-red-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
              {interestRate.toFixed(2)}% until {new Date(interestRateExpiryDate).toLocaleDateString()}
            </p>
        </InfoCard>
         {solicitor && (
          <InfoCard title="Your Solicitor">
              <p className="text-lg font-semibold text-brand-primary dark:text-blue-400">{solicitor.firmName}</p>
              <p className="text-md text-gray-700 dark:text-gray-300 font-medium">{solicitor.solicitorName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{solicitor.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{solicitor.contactNumber}</p>
          </InfoCard>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-6">Progress Tracker</h2>
        <ProgressTracker currentStatus={status} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-6">Application History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedHistory.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {STATUS_DISPLAY_NAMES[item.status]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowe-wrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;