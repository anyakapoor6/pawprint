import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useNotifications } from '../../../store/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const notificationsStore = typeof useNotifications === 'function' ? useNotifications() : null;

  if (!notificationsStore) {
    console.warn('❌ useNotifications is undefined or not returning correctly');
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Notifications store failed to load.</Text>
      </View>
    );
  }

  const { notifications } = notificationsStore;

  return (
    <View style={styles.container}>
      <Text style={{ padding: 20, fontSize: 18 }}>✅ Notifications screen loaded</Text>
      <Text>Total notifications: {notifications.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
