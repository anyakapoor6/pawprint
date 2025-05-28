export type NotificationType = 'match' | 'update' | 'reward' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  image?: string;
  read: boolean;
}