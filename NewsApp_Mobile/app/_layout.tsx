import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationModalProvider } from '@/contexts/NotificationModalContext';
import NotificationModal from '@/components/NotificationModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NotificationModalProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <NotificationProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <NotificationModalWrapper />
            </NotificationProvider>
          </BookmarkProvider>
        </AuthProvider>
      </ThemeProvider>
    </NotificationModalProvider>
  );
}

// Helper to use context in a component outside of navigation
import { useNotificationModal } from '@/contexts/NotificationModalContext';
function NotificationModalWrapper() {
  const { visible, close } = useNotificationModal();
  return <NotificationModal visible={visible} onClose={close} />;
}
