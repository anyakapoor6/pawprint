import { create } from 'zustand';
import { PetReport, ReportStatus } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface PetsState {
  reports: PetReport[];
  userLocation: { latitude: number; longitude: number } | null;
  updatePetStatus: (petId: string, status: ReportStatus) => void;
  updateReport: (updatedReport: PetReport) => Promise<void>;
  addReport: (report: PetReport) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => PetReport[];
  getReportById: (id: string) => PetReport | undefined;
  getAllReports: () => PetReport[];
  getNearbyPets: (radius?: number) => PetReport[];
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  getUrgentPets: () => PetReport[];
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const usePets = create<PetsState>((set, get) => ({
  reports: mockReports,
  userLocation: null,
  
  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  updatePetStatus: (petId: string, status: ReportStatus) => {
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    set(state => ({
      reports: [report, ...state.reports]
    }));
  },
  
  getReportsByStatus: (status: ReportStatus) => {
    const reports = get().reports;
    if (status === 'resolved') {
      return reports.filter(report => 
        report.status === 'resolved' || report.reportType === 'found'
      );
    } else {
      return reports.filter(report => 
        report.status === status && report.reportType === 'lost'
      );
    }
  },

  getReportById: (id: string) => {
    return get().reports.find(report => report.id === id);
  },

  getAllReports: () => {
    return get().reports;
  },

  getNearbyPets: (radius = 10) => {
    const { reports, userLocation } = get();
    if (!userLocation) return [];

    return reports.filter(report => {
      if (!report.lastSeenLocation) return false;
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        report.lastSeenLocation.latitude,
        report.lastSeenLocation.longitude
      );
      
      return distance <= radius;
    }).sort((a, b) => {
      // Sort by distance
      const distanceA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.lastSeenLocation!.latitude,
        a.lastSeenLocation!.longitude
      );
      const distanceB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.lastSeenLocation!.latitude,
        b.lastSeenLocation!.longitude
      );
      return distanceA - distanceB;
    });
  },

  getUrgentPets: () => {
    const { reports, userLocation } = get();
    let urgentPets = reports.filter(report => report.isUrgent);
    
    if (userLocation) {
      // Sort urgent pets by distance if user location is available
      urgentPets = urgentPets.sort((a, b) => {
        if (!a.lastSeenLocation || !b.lastSeenLocation) return 0;
        
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.lastSeenLocation.latitude,
          a.lastSeenLocation.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.lastSeenLocation.latitude,
          b.lastSeenLocation.longitude
        );
        return distanceA - distanceB;
      });
    }
    
    return urgentPets;
  },
}));

export { usePets };