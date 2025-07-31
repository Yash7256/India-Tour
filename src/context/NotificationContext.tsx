import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'festival' | 'weather' | 'location' | 'seasonal' | 'general';
  title: string;
  message: string;
  cityId?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt: string;
  actionUrl?: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  getActiveNotifications: () => Notification[];
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initialize with sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'festival',
        title: 'Diwali Celebrations in Delhi',
        message: 'Experience the festival of lights with spectacular fireworks and traditional celebrations across the city.',
        cityId: 'delhi',
        priority: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/city/delhi',
        isRead: false
      },
      {
        id: '2',
        type: 'seasonal',
        title: 'Winter Season in Kerala',
        message: 'Perfect weather for backwater cruises and hill station visits. Book your houseboat now!',
        cityId: 'kerala',
        priority: 'medium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/city/kerala',
        isRead: false
      },
      {
        id: '3',
        type: 'location',
        title: 'Welcome to India Tour!',
        message: 'Discover incredible destinations and create unforgettable memories across India.',
        priority: 'low',
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: false
      }
    ];

    setNotifications(sampleNotifications);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getActiveNotifications = () => {
    const now = new Date();
    return notifications.filter(notification => new Date(notification.expiresAt) > now);
  };

  const getUnreadCount = () => {
    return getActiveNotifications().filter(notification => !notification.isRead).length;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      removeNotification,
      getActiveNotifications,
      getUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};