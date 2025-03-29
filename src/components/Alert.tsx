import React from 'react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColor}`} role="alert">
      <div className="flex items-center justify-between">
        <p className={`font-medium ${textColor}`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;