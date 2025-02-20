// client/components/ConfirmationDialog.tsx

import React from 'react';

interface ConfirmationDialogProps {
  message: string;

  onConfirm: (wannaTry: boolean) => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50'>
      <div className='bg-white p-4 rounded-lg shadow-lg'>
        <p className='mb-4'>{message}</p>
        <div className='flex justify-end'>
        <button
            className='bg-green-500 text-white px-4 py-2 rounded mr-4'
            onClick={() => onConfirm(false)}
          >
            Yes, I have been to this place.
          </button>
          <div></div>
          <button
            className='bg-red-500 text-white px-4 py-2 rounded mr-2'
            onClick={() => onConfirm(true)}
          >
            No, please create a "wanna try" tag for this place.
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
