import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackSize?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  fallbackIcon = 'image-outline',
  fallbackSize = 24,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons 
          name={fallbackIcon} 
          size={fallbackSize} 
          color={colors.lightGrey} 
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      onError={handleError}
      fadeDuration={300}
      progressiveRenderingEnabled={true}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default OptimizedImage; 