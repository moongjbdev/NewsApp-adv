import { StyleSheet, Switch, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { userAPI } from '@/services/api'
import { useFocusEffect } from '@react-navigation/native'

type Props = {}

interface UserStats {
  totalBookmarks?: number;
  totalHistory?: number;
  totalComments?: number;
  lastActiveDate?: string;
}

const Page = (props: Props) => {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        fetchUserStats();
      }
    }, [isAuthenticated])
  );

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      setUserStats(response.data);
    } catch (error) {
      console.log('Error fetching user stats:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Clear any cached data
              setUserStats(null);
            } catch (error) {
              console.log('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleProfile = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      handleLogin();
    }
  };

  const handlePreferences = () => {
    if (isAuthenticated) {
      // TODO: Navigate to preferences screen when created
      Alert.alert('Thông báo', 'Tính năng cài đặt sẽ được thêm sau');
    } else {
      handleLogin();
    }
  };

  const handleReadingHistory = () => {
    if (isAuthenticated) {
      // TODO: Navigate to reading history screen when created
      Alert.alert('Thông báo', 'Tính năng lịch sử đọc sẽ được thêm sau');
    } else {
      handleLogin();
    }
  };

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerLeft: () => null,
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.black,
      }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <Ionicons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.profileInfo}>
              {isAuthenticated ? (
                <>
                  <Text style={[styles.userName, { color: colors.black }]}>
                    {user?.fullName || user?.username}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.darkGrey }]}>
                    {user?.email}
                  </Text>
                  {userStats && (
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.tint }]}>
                          {userStats.totalBookmarks || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.darkGrey }]}>
                          Bookmark
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.tint }]}>
                          {userStats.totalHistory || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.darkGrey }]}>
                          Đã đọc
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.userName, { color: colors.black }]}>
                    Khách
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.darkGrey }]}>
                    Đăng nhập để đồng bộ dữ liệu
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.darkGrey }]}>
            Tài khoản
          </Text>

          <TouchableOpacity
            style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}
            onPress={handleProfile}
          >
            <View style={styles.itemLeft}>
              <Ionicons name="person-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>
                {isAuthenticated ? 'Hồ sơ cá nhân' : 'Đăng nhập'}
              </Text>
            </View>
            <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
          </TouchableOpacity>

          {isAuthenticated && (
            <>
              <TouchableOpacity
                style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}
                onPress={handlePreferences}
              >
                <View style={styles.itemLeft}>
                  <Ionicons name="settings-outline" size={20} color={colors.darkGrey} />
                  <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Cài đặt</Text>
                </View>
                <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}
                onPress={handleReadingHistory}
              >
                <View style={styles.itemLeft}>
                  <Ionicons name="time-outline" size={20} color={colors.darkGrey} />
                  <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Lịch sử đọc</Text>
                </View>
                <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.darkGrey }]}>
            Cài đặt ứng dụng
          </Text>

          <TouchableOpacity
            style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}
            onPress={toggleTheme}
          >
            <View style={styles.itemLeft}>
              <Ionicons name="moon-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Chế Độ Tối</Text>
            </View>
            <View style={styles.switchWrapper}>
              <Switch
                style={styles.switch}
                trackColor={{ false: '#767577', true: '#3e3e3e' }}
                thumbColor={theme === 'dark' ? colors.tint : colors.lightGrey}
                ios_backgroundColor={colors.lightGrey}
                onValueChange={toggleTheme}
                value={theme === 'dark'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.darkGrey }]}>
            Hỗ trợ
          </Text>

          <TouchableOpacity style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="information-circle-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Về Chúng Tôi</Text>
            </View>
            <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Gửi Phản Hồi</Text>
            </View>
            <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Chính Sách Bảo Mật</Text>
            </View>
            <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.itemBtn, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderColor }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.darkGrey} />
              <Text style={[styles.itemBtnTxt, { color: colors.black }]}>Điều Khoản Sử Dụng</Text>
            </View>
            <MaterialIcons name='arrow-forward-ios' size={16} color={colors.lightGrey} />
          </TouchableOpacity>
        </View>

        {/* Logout/Login Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.cardBackground }]}
          onPress={isAuthenticated ? handleLogout : handleLogin}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
              size={20}
              color={isAuthenticated ? "#FF4444" : colors.tint}
            />
            <Text style={[styles.logoutButtonText, { color: isAuthenticated ? "#FF4444" : colors.tint }]}>
              {isAuthenticated ? 'Đăng Xuất' : 'Đăng Nhập'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </>
  )
}

export default Page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  profileSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  itemBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemBtnTxt: {
    fontSize: 14,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleY: 0.8 }, { scaleX: 0.8 }],
    marginRight: -8
  },
  switchWrapper: {
    height: 14,
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
})