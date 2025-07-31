import React from 'react';
import { XMarkIcon, BellIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { getActiveNotifications, markAsRead, removeNotification } = useNotifications();
  const navigate = useNavigate();

  const notifications = getActiveNotifications();

  if (!isOpen) return null;

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    }
    
    switch (type) {
      case 'festival':
        return <span className="text-orange-500 text-lg">🎉</span>;
      case 'weather':
        return <span className="text-blue-500 text-lg">🌤️</span>;
      case 'seasonal':
        return <span className="text-green-500 text-lg">🌸</span>;
      case 'location':
        return <span className="text-red-500 text-lg">📍</span>;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50 px-4 pt-20">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {notifications.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    notification.actionUrl ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${!notification.isRead ? 'bg-white' : 'bg-gray-50'} transition-colors duration-200`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Expires: {format(new Date(notification.expiresAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;