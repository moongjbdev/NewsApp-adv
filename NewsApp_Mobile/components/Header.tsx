import { Colors } from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useNotificationModal } from '@/contexts/NotificationModalContext'
// import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native';

// type Props = {}
const Header = () => {
    const { colors } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { unreadCount } = useNotification();
    const { open } = useNotificationModal();
    const navigation = useNavigation();
    
    // Get user display name
    const getUserDisplayName = () => {
        if (isAuthenticated && user) {
            return user.fullName || user.username || 'Người dùng';
        }
        return 'Khách';
    };

    // Get user avatar or default icon
    const getUserAvatar = () => {
        if (isAuthenticated && user?.avatar) {
            return { uri: user.avatar };
        }
        return null; // Will show default icon
    };

    // Navigate to notifications screen
    const handleNotificationPress = () => {
        open();
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.userInfo}>
                {getUserAvatar() ? (
                    <Image source={getUserAvatar()!} style={styles.userImage} />
                ) : (
                    <View style={[styles.userImagePlaceholder, { backgroundColor: colors.tint }]}>
                        <Ionicons name="person" size={24} color={colors.white} />
                    </View>
                )}
                <View style={{ gap: 2 }}>
                    <Text style={[styles.welcomeText, { color: colors.darkGrey }]}>
                        {isAuthenticated ? 'Xin chào!' : 'Chào mừng!'}
                    </Text>
                    <Text style={[styles.usernameText, { color: colors.black }]}>
                        {getUserDisplayName()}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                onPress={handleNotificationPress}
                style={styles.notificationButton}
            >
                <Ionicons name="notifications-outline" size={24} color={colors.black} />
                {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    )
}

export default Header
const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 30,
    },
    userImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    welcomeText: {
        fontSize: 12,
    },
    usernameText: {
        fontSize: 14,
        fontWeight: '700',
    },
    notificationButton: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})