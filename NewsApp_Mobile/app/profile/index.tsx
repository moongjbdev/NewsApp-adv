import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    avatar: user?.avatar || '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile({
        fullName: formData.fullName.trim(),
        avatar: formData.avatar.trim(),
      });
      
      updateUser(response.data.user);
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Hồ sơ cá nhân',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.black,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Avatar Section */}
          <View style={[styles.avatarSection, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              {user?.avatar ? (
                <Text style={[styles.avatarText, { color: colors.white }]}>
                  {user.avatar.charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person" size={40} color={colors.white} />
              )}
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Form */}
          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.darkGrey }]}>Tên đăng nhập</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.disabledInput, { color: colors.lightGrey }]}>
                  {user?.username}
                </Text>
                <Ionicons name="lock-closed" size={16} color={colors.lightGrey} />
              </View>
              <Text style={[styles.helperText, { color: colors.lightGrey }]}>
                Tên đăng nhập không thể thay đổi
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.darkGrey }]}>Email</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.disabledInput, { color: colors.lightGrey }]}>
                  {user?.email}
                </Text>
                <Ionicons name="lock-closed" size={16} color={colors.lightGrey} />
              </View>
              <Text style={[styles.helperText, { color: colors.lightGrey }]}>
                Email không thể thay đổi
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.darkGrey }]}>Họ và tên</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { color: colors.black, backgroundColor: colors.cardBackground }]}
                  value={formData.fullName}
                  onChangeText={(value) => updateFormData('fullName', value)}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.lightGrey}
                  autoCapitalize="words"
                />
              ) : (
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.inputText, { color: colors.black }]}>
                    {user?.fullName || 'Chưa cập nhật'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.darkGrey }]}>Vai trò</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.inputText, { color: colors.black }]}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {isEditing ? (
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.borderColor }]}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.darkGrey }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.tint },
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={[styles.saveButtonText, { color: colors.white }]}>
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.tint }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color={colors.white} />
                <Text style={[styles.editButtonText, { color: colors.white }]}>
                  Chỉnh sửa thông tin
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  disabledInput: {
    fontSize: 16,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  actionSection: {
    marginTop: 'auto',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileScreen; 