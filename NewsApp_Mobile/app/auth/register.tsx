import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

const RegisterScreen = () => {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword, fullName } = formData;

    if (!username.trim() || !email.trim() || !password || !confirmPassword || !fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Lỗi đăng ký', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Đăng Ký',
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
          <View style={styles.header}>
            <Ionicons name="person-add" size={80} color={colors.tint} />
            <Text style={[styles.title, { color: colors.black }]}>
              Tạo tài khoản mới
            </Text>
            <Text style={[styles.subtitle, { color: colors.darkGrey }]}>
              Tham gia để đồng bộ dữ liệu
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="person-outline" size={20} color={colors.darkGrey} />
              <TextInput
                style={[styles.input, { color: colors.black }]}
                placeholder="Họ và tên"
                placeholderTextColor={colors.lightGrey}
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="at-outline" size={20} color={colors.darkGrey} />
              <TextInput
                style={[styles.input, { color: colors.black }]}
                placeholder="Tên đăng nhập"
                placeholderTextColor={colors.lightGrey}
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="mail-outline" size={20} color={colors.darkGrey} />
              <TextInput
                style={[styles.input, { color: colors.black }]}
                placeholder="Email"
                placeholderTextColor={colors.lightGrey}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.darkGrey} />
              <TextInput
                style={[styles.input, { color: colors.black }]}
                placeholder="Mật khẩu"
                placeholderTextColor={colors.lightGrey}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.darkGrey}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.darkGrey} />
              <TextInput
                style={[styles.input, { color: colors.black }]}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.lightGrey}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.darkGrey}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                { backgroundColor: colors.tint },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={[styles.registerButtonText, { color: colors.white }]}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.borderColor }]} />
              <Text style={[styles.dividerText, { color: colors.darkGrey }]}>hoặc</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.borderColor }]} />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { borderColor: colors.tint }]}
              onPress={goToLogin}
            >
              <Text style={[styles.loginButtonText, { color: colors.tint }]}>
                Đã có tài khoản? Đăng nhập
              </Text>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen; 