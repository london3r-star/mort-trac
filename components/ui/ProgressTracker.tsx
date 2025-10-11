
import React from 'react';
import { ApplicationStatus, STATUS_ORDER, STATUS_DISPLAY_NAMES } from '../../types';

interface ProgressTrackerProps {
  currentStatus: ApplicationStatus;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStatus }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-brand-secondary text-white' : 
                    isActive ? 'bg-brand-secondary ring-4 ring-brand-accent text-white' : 
                    'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p className={`mt-2 text-xs text-center font-semibold ${isActive ? 'text-brand-secondary' : 'text-gray-500'}`} style={{minWidth: '60px'}}>
                  {STATUS_DISPLAY_NAMES[status]}
                </p>
              </div>
              {index < STATUS_ORDER.length - 1 && (
                <div className={`flex-1 h-1 transition-all duration-500 ${isCompleted ? 'bg-brand-secondary' : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
