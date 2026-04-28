import { useEffect, useState } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration
    };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Make addNotification globally available
  useEffect(() => {
    window.showNotification = addNotification;
    window.removeNotification = removeNotification;
    
    return () => {
      delete window.showNotification;
      delete window.removeNotification;
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <MdError className="text-red-500" size={20} />;
      case 'warning':
        return <MdWarning className="text-yellow-500" size={20} />;
      default:
        return <MdInfo className="text-blue-500" size={20} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 transform translate-x-0 ${getStyles(notification.type)}`}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 break-words">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MdClose size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
