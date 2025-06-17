import { supabase } from '@/lib/supabase';
import { PetReport, UserReport } from '@/types/pet';

export const createReport = async (reportData: Omit<UserReport, 'id' | 'created_at'>) => {
	try {
		const { data, error } = await supabase
			.from('reports')
			.insert([reportData])
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating report:', error);
		return { data: null, error };
	}
};

export const getReport = async (reportId: string) => {
	try {
		const { data, error } = await supabase
			.from('reports')
			.select('*')
			.eq('id', reportId)
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching report:', error);
		return { data: null, error };
	}
};

export const updateReport = async (reportId: string, updates: Partial<UserReport>) => {
	try {
		const { data, error } = await supabase
			.from('reports')
			.update(updates)
			.eq('id', reportId)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error updating report:', error);
		return { data: null, error };
	}
};

export const deleteReport = async (reportId: string) => {
	try {
		const { error } = await supabase
			.from('reports')
			.delete()
			.eq('id', reportId);

		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error('Error deleting report:', error);
		return { error };
	}
};

export const getReports = async (filters?: {
	reportType?: 'lost' | 'found';
	petType?: 'dog' | 'cat';
	status?: 'pending' | 'reviewed' | 'resolved';
	userId?: string;
}) => {
	try {
		let query = supabase.from('reports').select('*');

		if (filters?.reportType) {
			query = query.eq('report_type', filters.reportType);
		}
		if (filters?.petType) {
			query = query.eq('pet_type', filters.petType);
		}
		if (filters?.status) {
			query = query.eq('status', filters.status);
		}
		if (filters?.userId) {
			query = query.eq('user_id', filters.userId);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching reports:', error);
		return { data: null, error };
	}
}; 