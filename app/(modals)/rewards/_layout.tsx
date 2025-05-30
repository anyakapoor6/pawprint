import { Stack } from 'expo-router';
import { FEATURES } from '@/constants/features';
import { Redirect } from 'expo-router';

export default function RewardsLayout() {
  // Redirect if rewards are disabled
  if (!FEATURES.rewards) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}