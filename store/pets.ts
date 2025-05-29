import { create } from 'zustand';
import { PetReport, ReportStatus } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface PetsState {
  reports: PetReport[];
  updatePetStatus: (petId: string, status: ReportStatus) => void;
  updateReport: (updatedReport: PetReport) => Promise<void>;
  addReport: (report: PetReport) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => PetReport[];
  getReportById: (id: string) => PetReport | undefined;
  getAllReports: () => PetReport[];
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

  updateReport: async (updatedReport: PetReport) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      reports: state.reports.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    }));
  },

  addReport: async (report: PetReport) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      reports: [report, ...state.reports]
    }));
  },
  
  getReportsByStatus: (status: ReportStatus) => {
    const reports = get().reports;
    return reports.filter(report => report.status === status);
  },

  getReportById: (id: string) => {
    return get().reports.find(report => report.id === id);
  },

  getAllReports: () => {
    return get().reports;
  },
}));