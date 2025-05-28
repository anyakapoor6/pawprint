import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Bell, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Notification {
  id: string;
  type: 'match' | 'update' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: string;
  image?: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'Potential Match Found',
    message: 'A pet matching your lost dog Max has been reported near Central Park.',
    timestamp: '2024-03-15T10:30:00Z',
    image: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    read: false,
  },
  {
    id: '2',
    type: 'update',
    title: 'Report Update',
    message: 'Your report for Luna has been viewed 50 times in the last 24 hours.',
    timestamp: '2024-03-14T15:45:00Z',
    image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    read: true,
  },
  {
    id: '3',
    type: 'reward',
    title: 'Reward Claimed',
    message: 'The reward for finding Charlie has been claimed by Sarah Johnson.',
    timestamp: '2024-03-13T09:20:00Z',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome to PawPrint',
    message: 'Thank you for joining our community! Start by creating your first report or browsing nearby pets.',
    timestamp: '2024-03-12T14:15:00Z',
    read: true,
  },
];

interface NotificationsScreenProps {
  onClose?: () => void;
}

export default function NotificationsScreen({ onClose }: NotificationsScreenProps) {
  const router = useRouter();

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

  const getNotificationIcon = (type: Notification['type']) => {
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {mockNotifications.map((notification) => (
          <TouchableOpacity 
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard
            ]}
          >
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
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
            
            {!notification.read && (
              <View style={styles.unreadDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

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
});