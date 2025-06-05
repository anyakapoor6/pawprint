import { Stack } from 'expo-router';


export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notification-preferences"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
