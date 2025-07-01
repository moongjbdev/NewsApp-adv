import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import NotificationItem from '../../components/NotificationItem';
import { Loading } from '../../components/Loading';
import ErrorView from '../../components/ErrorView';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationCategory } from '../../types/notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  _id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { 
    notificationList, 
    markAsRead, 
    markAllAsRead, 
    refreshNotificationList,
    refreshUnreadCount 
  } = useNotification();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use notifications from context instead of local state
  const notifications = notificationList;

  const loadNotifications = async (refresh = false) => {
    try {
      setError(null);
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Use context's refresh function
      await refreshNotificationList();
      await refreshUnreadCount();
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('🔄 Notifications screen focused, refreshing...');
        loadNotifications();
      }
    }, [user])
  );

  const handleRefresh = async () => {
    await loadNotifications(true);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      // Context will handle the state update
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đánh dấu thông báo đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Context will handle the state update
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo đã đọc');
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.data?.article_id) {
      // Navigate to article
      // router.push(`/news/${notification.data.article_id}`);
    } else if (notification.data?.comment_id) {
      // Navigate to comment
      // router.push(`/news/${notification.data.article_id}#comment-${notification.data.comment_id}`);
    }
    
    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={() => loadNotifications()} 
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
          <Text style={[styles.title, { color: colors.black }]}>Thông báo</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllButton, { backgroundColor: colors.tint }]}
              onPress={handleMarkAllAsRead}
            >
              <Text style={[styles.markAllText, { color: colors.white }]}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={colors.lightGrey} />
            <Text style={[styles.emptyTitle, { color: colors.black }]}>Không có thông báo</Text>
            <Text style={[styles.emptyMessage, { color: colors.darkGrey }]}>Bạn sẽ nhận được thông báo khi có hoạt động mới</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <NotificationItem
                notification={item}
                onPress={handleNotificationPress}
                onMarkAsRead={handleMarkAsRead}
                themeColors={colors}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.tint]}
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.tint,
    borderRadius: 16,
  },
  markAllText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.darkGrey,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 