import { create } from 'zustand';
import { mockReports } from '@/data/mockData';

interface StatsState {
  petsFound: number;
  activeUsers: number;
  successRate: number;
  calculateStats: () => void;
}

export const useStats = create<StatsState>((set) => ({
  petsFound: 0,
  activeUsers: 0,
  successRate: 0,
  calculateStats: () => {
    // Get total resolved reports
    const resolvedReports = mockReports.filter(report => report.status === 'reunited');
    const totalReports = mockReports.length;

    // Calculate unique users
    const uniqueUsers = new Set(mockReports.map(report => report.userId)).size;

    // Calculate success rate
    const successRate = totalReports > 0
      ? (resolvedReports.length / totalReports) * 100
      : 0;

    set({
      petsFound: resolvedReports.length,
      activeUsers: uniqueUsers,
      successRate: Math.round(successRate),
    });
  },
}));