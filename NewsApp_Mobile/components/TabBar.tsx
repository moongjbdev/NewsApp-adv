import { View, StyleSheet, LayoutChangeEvent, Alert } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "@/components/TabBarButton";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import React from "react";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <View onLayout={onTabbarLayout} style={[styles.tabbar, { backgroundColor: colors.cardBackground }]}>
      <Animated.View style={[animatedStyle, {
        position: 'absolute',
        backgroundColor: colors.tint,
        top: 56,
        left: 24,
        height: 4,
        width: 30,
        borderRadius: 2,
        justifyContent: 'center',
      }]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        // Đảm bảo label là string để tránh lỗi
        const labelStr = typeof label === 'string' ? label : route.name;

        const onPress = () => {
          if ((route.name.toLowerCase().includes('notification') || labelStr.toLowerCase().includes('thông báo')) && !isAuthenticated) {
            Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để xem thông báo.');
            return;
          }
          tabPositionX.value = withTiming(buttonWidth * index, {
            duration: 200,
          });

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={labelStr}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  }
})
