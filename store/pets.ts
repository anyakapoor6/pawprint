import { create } from 'zustand';
import { PetReport, ReportStatus } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface PetsState {
  reports: PetReport[];
  userLocation: { latitude: number; longitude: number } | null;
  updatePetStatus: (petId: string, status: 'active' | 'reunited') => void;
  updateReport: (updatedReport: PetReport) => Promise<void>;
  addReport: (report: PetReport) => Promise<void>;
  getReportsByStatus: (status: 'active' | 'reunited') => PetReport[];
  getReportById: (id: string) => PetReport | undefined;
  getAllReports: () => PetReport[];
  getAllReportsWithLocation: () => PetReport[];
  getUserReports: (userId: string) => PetReport[];
  getNearbyPets: (radius?: number) => PetReport[];
  getUrgentPets: () => PetReport[];
  getFoundPetsNearby: () => PetReport[];
  getRecentlyReportedNearby: () => PetReport[];
  getReunitedNearby: () => PetReport[];
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const usePets = create<PetsState>((set, get) => ({
  reports: [...mockReports], // this ensures a fresh copy and proper state tracking
  userLocation: null,

  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  updatePetStatus: (petId: string, status: 'active' | 'reunited') => {
    set(state => ({
      reports: state.reports.map(report =>
        report.id === petId
          ? { ...report, status }
          : report
      )
    }));
  },

  updateReport: async (updatedReport: PetReport) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      reports: state.reports.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    }));
  },

  addReport: async (report: PetReport) => {
    // Always set status to 'active' for new reports
    const newReport = { ...report, status: 'active' as ReportStatus };
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      reports: [newReport, ...state.reports]
    }));
  },

  getReportsByStatus: (status: 'active' | 'reunited') => {
    const reports = get().reports ?? [];
    return reports.filter(report => report.status === status);
  },

  getReportById: (id: string) => {
    return get().reports.find(report => report.id === id);
  },

  getAllReports: () => {
    return get().reports;
  },

  getAllReportsWithLocation: () => {
    return get().reports.filter(
      r => r.lastSeenLocation && r.lastSeenLocation.latitude && r.lastSeenLocation.longitude
    );
  },

  getUserReports: (userId: string) => {
    return get().reports.filter(report => report.userId === userId);
  },

  getNearbyPets: (radius = 10) => {
    const { reports, userLocation } = get();
    if (!userLocation || !Array.isArray(reports)) return [];
    return reports
      .filter((report) => {
        if (!report.lastSeenLocation) return false;
        if (report.status !== 'active') return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.lastSeenLocation.latitude,
          report.lastSeenLocation.longitude
        );
        return distance <= radius;
      })
      .sort((a, b) => {
        const aLoc = a.lastSeenLocation;
        const bLoc = b.lastSeenLocation;
        if (!aLoc || !bLoc) return 0;
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          aLoc.latitude,
          aLoc.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          bLoc.latitude,
          bLoc.longitude
        );
        return distA - distB;
      });
  },

  getUrgentPets: () => {
    const { reports, userLocation } = get();
    let urgentPets = reports.filter((report) => report.isUrgent && report.status === 'active');
    if (userLocation) {
      urgentPets = urgentPets.filter(report => {
        if (!report.lastSeenLocation) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.lastSeenLocation.latitude,
          report.lastSeenLocation.longitude
        );
        return distance <= 10;
      }).sort((a, b) => {
        const aLoc = a.lastSeenLocation;
        const bLoc = b.lastSeenLocation;
        if (!aLoc || !bLoc) return 0;
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          aLoc.latitude,
          aLoc.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          bLoc.latitude,
          bLoc.longitude
        );
        return distA - distB;
      });
    }
    return urgentPets;
  },

  getFoundPetsNearby: () => {
    const { reports, userLocation } = get();
    return reports.filter(r =>
      r.status === 'active' &&
      r.reportType === 'found' &&
      r.lastSeenLocation &&
      userLocation &&
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        r.lastSeenLocation.latitude,
        r.lastSeenLocation.longitude
      ) <= 10
    );
  },

  getRecentlyReportedNearby: () => {
    const { reports, userLocation } = get();
    return reports.filter(r =>
      r.status === 'active' &&
      r.lastSeenLocation &&
      userLocation &&
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        r.lastSeenLocation.latitude,
        r.lastSeenLocation.longitude
      ) <= 10
    ).sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
  },

  getReunitedNearby: () => {
    const { reports, userLocation } = get();
    return reports.filter(r =>
      r.status === 'reunited' &&
      r.lastSeenLocation &&
      userLocation &&
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        r.lastSeenLocation.latitude,
        r.lastSeenLocation.longitude
      ) <= 10
    );
  },

}));