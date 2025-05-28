import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/store/auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  useFrameworkReady();
  const { restoreSession, isLoading } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}