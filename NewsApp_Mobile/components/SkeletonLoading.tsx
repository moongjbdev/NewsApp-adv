import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonLoadingProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonLoadingProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const { colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.borderColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

const NewsSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.imageContainer}>
        <SkeletonItem width={90} height={90} borderRadius={8} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <SkeletonItem width={60} height={16} borderRadius={12} />
          <SkeletonItem width={20} height={20} borderRadius={10} />
        </View>
        <SkeletonItem width="100%" height={16} borderRadius={4} />
        <SkeletonItem width="80%" height={16} borderRadius={4} />
        <View style={styles.sourceContainer}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={80} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const SkeletonLoading: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <NewsSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginHorizontal: 20,
    marginBottom: 50,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: 90,
    height: 90,
  },
  contentContainer: {
    flex: 1,
    gap: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
});

export default SkeletonLoading;
export { SkeletonItem }; 