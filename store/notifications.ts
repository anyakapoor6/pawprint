import { create } from 'zustand';
import { Notification } from '@/types/notification';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [
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
      read: false,
    },
    {
      id: '3',
      type: 'reward',
      title: 'Reward Claimed',
      message: 'The reward for finding Charlie has been claimed by Sarah Johnson.',
      timestamp: '2024-03-13T09:20:00Z',
      read: false,
    },
  ],
  
  unreadCount: 3,
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      })),
      unreadCount: 0
    }));
  },
  
  markAsRead: (id: string) => {
    set(state => {
      const notifications = state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      return { notifications, unreadCount };
    });
  },
  
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.read).length;
  },
}));