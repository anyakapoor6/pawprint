import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Home, MapPin, Camera, AlertTriangle, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null; // Show loading state
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <AlertTriangle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
