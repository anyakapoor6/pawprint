import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/store/auth';
import { registerForPushAndSaveToken } from '@/lib/notifications'; // ✅ import the function

export default function RootLayout() {
  const { restoreSession } = useAuth();

  useEffect(() => {
    useAuth.getState().restoreSession();

    // ✅ Register for push and save token to Supabase
    registerForPushAndSaveToken();

    // Optional: Listen to incoming notifications while app is open
    const sub = Notifications.addNotificationReceivedListener(notification => {
      console.log('📲 Push notification received:', notification);
      // You could also trigger a local toast or store update here
    });

    return () => sub.remove(); // Clean up the listener
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
