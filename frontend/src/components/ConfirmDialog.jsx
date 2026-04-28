import { useState, useEffect } from 'react';
import { MdWarning, MdClose } from 'react-icons/md';

const ConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(null);
  const [onCancel, setOnCancel] = useState(null);

  const showConfirm = (msg, confirmCallback, cancelCallback) => {
    setMessage(msg);
    setOnConfirm(() => confirmCallback);
    setOnCancel(() => cancelCallback);
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
    setMessage('');
    setOnConfirm(null);
    setOnCancel(null);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    hideConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    hideConfirm();
  };

  // Make showConfirm globally available
  useEffect(() => {
    window.showConfirm = showConfirm;
    
    return () => {
      delete window.showConfirm;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <MdWarning className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confirm Action
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={hideConfirm}
              className="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
