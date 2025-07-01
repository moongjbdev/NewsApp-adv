import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationType } from '@/types/notifications';
import moment from 'moment';
import 'moment/locale/vi';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const formatTime = (dateString: string) => {
  const now = moment();
  const time = moment(dateString);
  const diffMinutes = now.diff(time, 'minutes');
  const diffHours = now.diff(time, 'hours');
  const diffDays = now.diff(time, 'days');

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24 && now.isSame(time, 'day')) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return time.format('DD/MM/YYYY');
};

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { notificationList, refreshNotificationList, markAsRead, markAllAsRead } = useNotification();
  const { isAuthenticated } = useAuth();

  // Refresh notifications when modal opens (only if logged in)
  useEffect(() => {
    if (visible && isAuthenticated) {
      console.log('🔄 Modal opened, refreshing notifications...');
      refreshNotificationList();
    }
  }, [visible, refreshNotificationList, isAuthenticated]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const handleNotificationPress = (notification: NotificationType) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // TODO: Navigate to relevant screen based on notification type
    // if (notification.data?.article_id) {
    //   // Navigate to article
    // } else if (notification.data?.comment_id) {
    //   // Navigate to comment
    // }
  };

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.background + 'CC' }]}>
        <View style={[styles.modal, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor, borderColor: colors.borderColor }]}> 
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}> 
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.black }]}>Thông báo</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.tint }]}> 
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                  <Ionicons name="checkmark-done-circle" size={24} color={colors.tint} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={refreshNotificationList} style={styles.refreshButton}>
                <Ionicons name="refresh" size={20} color={colors.black} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
          </View>
          {!isAuthenticated ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="lock-closed-outline" size={48} color={colors.lightGrey} />
              <Text style={[styles.emptyText, { color: colors.darkGrey, marginTop: 12, fontSize: 16, textAlign: 'center' }]}>Bạn cần đăng nhập để xem thông báo</Text>
              <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.tint, marginTop: 20 }]} onPress={onClose}>
                <Text style={[styles.loginButtonText, { color: colors.white }]}>Đóng</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={notificationList}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.item, 
                    { borderBottomColor: colors.borderColor, backgroundColor: colors.cardBackground },
                    !item.isRead && { backgroundColor: colors.tint + '18' }
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[
                        styles.itemTitle, 
                        { color: colors.black },
                        !item.isRead && { fontWeight: '600' }
                      ]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <TouchableOpacity 
                        style={styles.checkbox}
                        onPress={() => handleMarkAsRead(item._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons 
                          name={item.isRead ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={item.isRead ? colors.tint : colors.darkGrey} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.itemMessage, { color: colors.darkGrey }]} numberOfLines={3}>
                      {item.message}
                    </Text>
                    <View style={styles.itemFooter}>
                      <Text style={[styles.itemTime, { color: colors.darkGrey }]}> 
                        {formatTime(item.createdAt)}
                      </Text>
                      {!item.isRead && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off" size={48} color={colors.lightGrey} />
                  <Text style={[styles.emptyText, { color: colors.darkGrey }]}>Không có thông báo nào</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 16, backgroundColor: colors.cardBackground }}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '92%',
    maxHeight: '80%',
    borderRadius: 18,
    padding: 0,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 16,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  itemMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  checkbox: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationModal; 