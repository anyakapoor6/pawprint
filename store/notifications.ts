import { create } from 'zustand';
import { mockNotifications } from '@/data/mockData';

interface Notification {
  id: string;
  type: 'match' | 'update' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: string;
  image?: string;
  read: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: mockNotifications,
  
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    }));
  },
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      }))
    }));
  },
  
  getUnreadCount: () => {
    return get().notifications.filter(notification => !notification.read).length;
  },
}));