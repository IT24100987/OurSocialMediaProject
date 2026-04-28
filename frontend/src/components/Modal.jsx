import { MdClose } from 'react-icons/md';

// 💡 Beginner Note: This is a reusable popup window.
// We pass it 'isOpen' to show/hide it, and 'children' is the actual form we want inside.

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Modal Body (scrollable if too long) */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Modal;
