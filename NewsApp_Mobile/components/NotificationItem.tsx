import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { NotificationCategory } from '../types/notifications';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: NotificationCategory;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
  };
  onPress: (notification: any) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'comment_reply':
        return 'chatbubble-ellipses';
      case 'comment_like':
        return 'heart';
      case 'comment_mention':
        return 'at';
      case 'achievement':
        return 'trophy';
      case 'daily_digest':
        return 'newspaper';
      case 'reading_reminder':
        return 'time';
      case 'category_news':
        return 'folder';
      default:
        return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'comment_reply':
        return Colors.tint;
      case 'comment_like':
        return '#FF6B6B';
      case 'comment_mention':
        return '#FFA500';
      case 'achievement':
        return '#4CAF50';
      case 'daily_digest':
        return '#2196F3';
      case 'reading_reminder':
        return '#FFA500';
      case 'category_news':
        return Colors.tint;
      default:
        return Colors.darkGrey;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unread
      ]}
      onPress={() => onPress(notification)}
      onLongPress={() => onMarkAsRead(notification._id)}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getIcon() as any} 
          size={24} 
          color={getIconColor()} 
        />
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={3}>
          {notification.message}
        </Text>
        <Text style={styles.time}>
          {formatTime(notification.createdAt)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.markButton}
        onPress={() => onMarkAsRead(notification._id)}
      >
        <Ionicons 
          name={notification.isRead ? 'checkmark-circle' : 'ellipse-outline'} 
          size={20} 
          color={notification.isRead ? '#4CAF50' : Colors.lightGrey} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  unread: {
    backgroundColor: '#F8F9FA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.tint,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.darkGrey,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: Colors.lightGrey,
  },
  markButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationItem; 