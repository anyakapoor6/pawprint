import { create } from 'zustand';
import { UserReport } from '@/lib/user';
import { getUserReports, updateReportStatus } from '@/lib/user';

interface ReportsState {
	reports: UserReport[];
	isLoading: boolean;
	error: string | null;
	submitReport: (report: Omit<UserReport, 'id' | 'created_at'>) => Promise<void>;
	getUserReports: (userId: string) => Promise<UserReport[]>;
	updateReportStatus: (reportId: string, status: 'pending' | 'resolved') => Promise<void>;
}

export const useReports = create<ReportsState>((set) => ({
	reports: [],
	isLoading: false,
	error: null,

	submitReport: async (report) => {
		set({ isLoading: true, error: null });
		try {
			// This will be implemented in lib/user.ts
			const newReports = await getUserReports(report.user_id);
			set((state) => ({
				reports: [newReports[0], ...state.reports], // Assuming the first report is the newly created one
				isLoading: false,
			}));
		} catch (err) {
			console.error('Error submitting report:', err);
			set({ error: 'Failed to submit report', isLoading: false });
			throw err;
		}
	},

	getUserReports: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const reports = await getUserReports(userId);
			set({ reports, isLoading: false });
			return reports;
		} catch (err) {
			console.error('Error fetching user reports:', err);
			set({ error: 'Failed to fetch reports', isLoading: false });
			throw err;
		}
	},

	updateReportStatus: async (reportId: string, status: 'pending' | 'resolved') => {
		set({ isLoading: true, error: null });
		try {
			await updateReportStatus(reportId, status);
			set((state) => ({
				reports: state.reports.map((report) =>
					report.id === reportId
						? { ...report, status }
						: report
				),
				isLoading: false,
			}));
		} catch (err) {
			console.error('Error updating report status:', err);
			set({ error: 'Failed to update report status', isLoading: false });
			throw err;
		}
	},
})); 