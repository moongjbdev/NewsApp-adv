import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationType } from '@/types/notifications';
import moment from 'moment';
import 'moment/locale/vi';

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
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      notificationsAPI.getNotifications(1, 20)
        .then(res => {
          setNotifications(res.data.notifications || []);
        })
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.cardBackground, shadowColor: colors.black }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.black }]}>Thông báo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={[styles.itemTitle, { color: colors.black }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.itemMessage, { color: colors.darkGrey }]} numberOfLines={3}>{item.message}</Text>
                  <Text style={[styles.itemTime, { color: colors.darkGrey }]}>{formatTime(item.createdAt)}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.darkGrey, textAlign: 'center', marginTop: 20 }}>
                  Không có thông báo nào.
                </Text>
              }
              contentContainerStyle={{ paddingBottom: 16 }}
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
});

export default NotificationModal; 