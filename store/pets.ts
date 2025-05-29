import { create } from 'zustand';
import { PetReport, ReportStatus } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface PetsState {
  reports: PetReport[];
  updatePetStatus: (petId: string, status: ReportStatus) => void;
  getReportsByStatus: (status: ReportStatus) => PetReport[];
  getReportById: (id: string) => PetReport | undefined;
}

export const usePets = create<PetsState>((set, get) => ({
  reports: mockReports,
  
  updatePetStatus: (petId: string, status: ReportStatus) => {
    set(state => ({
      reports: state.reports.map(report => 
        report.id === petId 
          ? { ...report, status }
          : report
      )
    }));
  },
  
  getReportsByStatus: (status: ReportStatus) => {
    return get().reports.filter(report => report.status === status);
  },

  getReportById: (id: string) => {
    return get().reports.find(report => report.id === id);
  },
}));