import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Bell, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useNotifications } from '../../../store/notifications';


export default function NotificationsScreen() {
  const router = useRouter();
  const notificationsStore = useNotifications();

  console.log('notificationsStore:', notificationsStore);
  // Fix: ensure notificationsStore is defined
  if (!notificationsStore) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Loading notifications...</Text>
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

  const getNotificationIcon = (type: NotificationType) => {
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

// Your styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  markAllRead: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadCard: {
    backgroundColor: colors.gray[50],
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notificationImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
