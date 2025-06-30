import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '@/services/api';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      // Decrease unread count by 1
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [isAuthenticated, user]);

  // Set up interval to check for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: NotificationContextType = {
    unreadCount,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 