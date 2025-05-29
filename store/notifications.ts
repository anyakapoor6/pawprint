import { create } from 'zustand';
import { Notification } from '@/types/notification';
import { PetReport } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
  checkForMatches: (newReport: PetReport) => void;
}

// Helper function to calculate match score between two pets
const calculateMatchScore = (report1: PetReport, report2: PetReport): number => {
  let score = 0;
  const maxScore = 100;

  // Only match opposite report types (lost with found)
  if (report1.reportType === report2.reportType) return 0;

  // Must be same pet type
  if (report1.type !== report2.type) return 0;

  // Breed matching (30 points)
  if (report1.breed?.toLowerCase() === report2.breed?.toLowerCase()) {
    score += 30;
  }

  // Color matching (20 points)
  const colors1 = report1.color.toLowerCase().split(/[,\s]+/);
  const colors2 = report2.color.toLowerCase().split(/[,\s]+/);
  const colorMatch = colors1.some(c1 => colors2.some(c2 => c2.includes(c1)));
  if (colorMatch) score += 20;

  // Size matching (15 points)
  if (report1.size === report2.size) {
    score += 15;
  }

  // Location proximity (20 points)
  if (report1.lastSeenLocation && report2.lastSeenLocation) {
    const distance = calculateDistance(
      report1.lastSeenLocation.latitude,
      report1.lastSeenLocation.longitude,
      report2.lastSeenLocation.latitude,
      report2.lastSeenLocation.longitude
    );
    // Award points based on proximity (within 5km)
    if (distance <= 5) score += 20;
    else if (distance <= 10) score += 15;
    else if (distance <= 20) score += 10;
  }

  // Time proximity (15 points)
  const date1 = new Date(report1.dateReported);
  const date2 = new Date(report2.dateReported);
  const daysDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 2) score += 15;
  else if (daysDiff <= 7) score += 10;
  else if (daysDiff <= 14) score += 5;

  return score;
};

// Helper function to calculate distance between coordinates in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

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

  checkForMatches: (newReport: PetReport) => {
    // Get existing reports of the opposite type
    const oppositeType = newReport.reportType === 'lost' ? 'found' : 'lost';
    const potentialMatches = mockReports.filter(report => 
      report.reportType === oppositeType && 
      report.status === 'active'
    );

    // Calculate match scores
    const matches = potentialMatches
      .map(report => ({
        report,
        score: calculateMatchScore(newReport, report)
      }))
      .filter(match => match.score >= 70) // Only consider strong matches (70%+)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Get top 3 matches

    if (matches.length > 0) {
      // Create notifications for matches
      const newNotifications = matches.map(match => ({
        id: `match-${Date.now()}-${match.report.id}`,
        type: 'match' as const,
        title: 'Potential Match Found',
        message: newReport.reportType === 'lost'
          ? `A ${match.report.type} matching your lost pet has been found near ${match.report.lastSeenLocation?.address}`
          : `Your found ${match.report.type} might belong to someone who reported a lost pet near ${match.report.lastSeenLocation?.address}`,
        timestamp: new Date().toISOString(),
        image: match.report.photos[0],
        read: false,
        matchScore: match.score,
      }));

      set(state => ({
        notifications: [...newNotifications, ...state.notifications],
        unreadCount: state.unreadCount + newNotifications.length
      }));
    }
  }
}));