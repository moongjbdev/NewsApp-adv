import { ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const Page = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require('../assets/images/main-image.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.wrapper}>
          <Animated.Text style={styles.title} entering={FadeInRight.delay(300).duration(1500)}>Xin Chào!</Animated.Text>
          <Animated.Text style={styles.description} entering={FadeInRight.delay(500).duration(1500)}>Khám phá tin tức mới mỗi ngày!</Animated.Text>
          <Animated.View entering={FadeInDown.delay(600).duration(1000)}>
            <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.buttonText}>Đọc Ngay!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 100,
    paddingHorizontal: 30,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  title: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 2,
    lineHeight: 36,
    textAlign: 'center'
  },
  description: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1.5,
    lineHeight: 22,
    textAlign: 'center'
  },
  button: {
    backgroundColor: Colors.tint,
    paddingVertical: 15,
    marginTop: 20,
    alignItems: 'center',
    // alignSelf: 'center',
    // paddingHorizontal: 100,
    borderRadius: 10
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center'
  }
});
