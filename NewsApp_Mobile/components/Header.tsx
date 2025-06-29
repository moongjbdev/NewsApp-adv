import { Colors } from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

// type Props = {}
const Header = () => {
    const { colors } = useTheme();
    const { user, isAuthenticated } = useAuth();
    
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

            <TouchableOpacity onPress={() => { }}>
                <Ionicons name="notifications-outline" size={24} color={colors.black} />
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
    }
})