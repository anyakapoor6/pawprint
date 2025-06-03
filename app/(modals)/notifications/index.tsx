import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Bell, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useNotifications } from '../../../store/notifications';

export default function NotificationsScreen() {
  const router = useRouter();

  // Safely call the hook
  const notificationsStore = typeof useNotifications === 'function' ? useNotifications() : null;

  if (!notificationsStore) {
    console.warn('❌ useNotifications is undefined or not returning correctly');
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Notifications store failed to load.</Text>
      </View>
    );
  }

  const { notifications, markAllAsRead, markAsRead } = notificationsStore;
  const hasUnreadNotifications = notifications.some(n => !n.read);

  const handleBack = () => {
    router.back();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart size={24} color={colors.accent} />;
      case 'update':
        return <Bell size={24} color={colors.primary} />;
      case 'reward':
        return <MapPin size={24} color={colors.success} />;
      default:
        return <Bell size={24} color={colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnreadNotifications ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard,
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>

              <Text style={styles.message}>{notification.message}</Text>

              {notification.image && (
                <Image
                  source={{ uri: notification.image }}
                  style={styles.notificationImage}
                />
              )}
            </View>

            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateMessage}>
              You'll receive notifications about matches, updates, and important
              alerts here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
