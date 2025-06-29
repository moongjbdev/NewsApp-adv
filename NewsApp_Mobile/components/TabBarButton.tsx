import { Pressable, StyleSheet, GestureResponderEvent } from "react-native";
import React, { useEffect } from "react";
import { icon } from "@/constants/Icons";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { useTheme } from '@/contexts/ThemeContext';

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
}: {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress: (event: GestureResponderEvent) => void;
  isFocused: boolean;
  routeName: string;
  label: string;
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 50 }
    );
  }, [opacity, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacityValue = interpolate(opacity.value, [0, 1], [1, 0]);

    return {
      opacity: opacityValue,
    };
  });

  const IconComponent = icon[routeName as keyof typeof icon];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarBtn}
    >
      <IconComponent
        color={isFocused ? colors.tabIconSelected : colors.tabIconDefault}
        focused={isFocused}
      />
      <Animated.Text
        style={[
          {
            color: isFocused ? colors.tabIconSelected : colors.tabIconDefault,
            fontSize: 12,
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

export default TabBarButton;

const styles = StyleSheet.create({
  tabbarBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
