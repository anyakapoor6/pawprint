import { Redirect } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/(tabs)' : '/sign-in'} />;
}