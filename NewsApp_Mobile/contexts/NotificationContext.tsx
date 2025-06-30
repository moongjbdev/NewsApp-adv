import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '@/services/api';
import { useSocket } from './SocketContext';
import { NotificationType } from '@/types/notifications';
import { Alert, View, Text } from 'react-native';

interface NotificationContextType {
  unreadCount: number;
  notificationList: NotificationType[];
  refreshUnreadCount: () => Promise<void>;
  refreshNotificationList: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showSnackbar: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationList, setNotificationList] = useState<NotificationType[]>([]);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const socket = useSocket();
  
  // Keep concurrent request limit for safety
  const requestCount = useRef(0);
  const MAX_CONCURRENT_REQUESTS = 5; // Increased since no rate limiting

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    
    if (requestCount.current >= MAX_CONCURRENT_REQUESTS) {
      console.log('Skipping unread count fetch - too many concurrent requests');
      return;
    }
    
    try {
      requestCount.current++;
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      requestCount.current--;
    }
  };

  const fetchNotificationList = async () => {
    if (!isAuthenticated) {
      setNotificationList([]);
      return;
    }
    
    if (requestCount.current >= MAX_CONCURRENT_REQUESTS) {
      console.log('Skipping notification list fetch - too many concurrent requests');
      return;
    }
    
    try {
      requestCount.current++;
      const response = await notificationsAPI.getNotifications(1, 20);
      const newNotifications = response.data.notifications || [];
      
      // Merge with existing notifications to preserve any realtime updates
      setNotificationList(prev => {
        // Create a map of existing notifications by ID
        const existingMap = new Map(prev.map(n => [n._id, n]));
        
        // Add new notifications, preserving any that were added via realtime
        newNotifications.forEach((notification: NotificationType) => {
          existingMap.set(notification._id, notification);
        });
        
        // Convert back to array and sort by createdAt (newest first)
        return Array.from(existingMap.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      
      console.log(`📋 Fetched ${newNotifications.length} notifications from server`);
    } catch (error) {
      console.error('Error fetching notification list:', error);
    } finally {
      requestCount.current--;
    }
  };

  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  const refreshNotificationList = async () => {
    await fetchNotificationList();
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotificationList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setUnreadCount(0);
      setNotificationList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchUnreadCount();
    fetchNotificationList();
  }, [isAuthenticated, user]);

  // Poll unread count - reduced interval for better realtime
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchUnreadCount, 10000); // Changed from 30s to 10s for faster updates
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Listen for realtime notification
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification: NotificationType) => {
      console.log('🔔 Realtime notification received:', notification.title);
      
      // Immediate UI update for instant feedback
      setUnreadCount(prev => prev + 1);
      
      // Add to notification list, avoiding duplicates
      setNotificationList(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n._id === notification._id);
        if (exists) {
          console.log('⚠️ Notification already exists in list, skipping duplicate');
          return prev;
        }
        
        // Add new notification to the beginning
        const updatedList = [notification, ...prev];
        console.log(`✅ Added notification to list. Total: ${updatedList.length}`);
        return updatedList;
      });
      
      showSnackbar(notification.title || 'Bạn có thông báo mới!');
      
      // Fetch fresh data after a short delay to sync with server
      setTimeout(() => {
        console.log('🔄 Syncing with server after realtime notification...');
        fetchNotificationList();
        fetchUnreadCount();
      }, 2000); // Increased delay to 2 seconds
    };
    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  // Snackbar logic
  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
    setTimeout(() => setSnackbar({ visible: false, message: '' }), 3000);
  };

  const value: NotificationContextType = {
    unreadCount,
    notificationList,
    refreshUnreadCount,
    refreshNotificationList,
    markAsRead,
    markAllAsRead,
    showSnackbar,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {snackbar.visible && (
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 9999 }} pointerEvents="none">
          <View style={{ backgroundColor: '#222', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12, opacity: 0.95 }}>
            <Text style={{ color: '#fff', fontSize: 15 }}>{snackbar.message}</Text>
          </View>
        </View>
      )}
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