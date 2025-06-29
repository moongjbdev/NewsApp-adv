import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorView: React.FC<ErrorViewProps> = ({ 
  message = 'Đã xảy ra lỗi. Vui lòng thử lại.',
  onRetry,
  showRetry = true 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons 
        name="alert-circle-outline" 
        size={64} 
        color={colors.lightGrey} 
      />
      <Text style={[styles.message, { color: colors.black }]}>
        {message}
      </Text>
      {showRetry && onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.retryText, { color: colors.white }]}>
            Thử lại
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorView; 