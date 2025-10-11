import React, { useState, useEffect } from 'react';
import { Application } from '../../types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  application: Application | null;
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, onSave, application }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (application) {
      setNotes(application.notes || '');
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100 mb-1">
            Notes for {application.clientName}
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            These notes are for internal use and will not be visible to the client.
          </p>
          <div className="border-t dark:border-gray-700 pt-4">
             <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes here..."
                className="w-full h-48 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
             />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-auto">
            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-secondary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Notes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:border-gray-500 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;