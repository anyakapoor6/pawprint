import { supabase } from '@/lib/supabase';
import { Story } from '@/types/pet';
import { UserStory } from '@/lib/user';

export const createStory = async (storyData: Omit<UserStory, 'id' | 'created_at'>) => {
	try {
		const { data, error } = await supabase
			.from('stories')
			.insert([storyData])
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating story:', error);
		return { data: null, error };
	}
};

export const getStory = async (storyId: string) => {
	try {
		const { data, error } = await supabase
			.from('stories')
			.select('*')
			.eq('id', storyId)
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching story:', error);
		return { data: null, error };
	}
};

export const updateStory = async (storyId: string, updates: Partial<UserStory>) => {
	try {
		const { data, error } = await supabase
			.from('stories')
			.update(updates)
			.eq('id', storyId)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error updating story:', error);
		return { data: null, error };
	}
};

export const deleteStory = async (storyId: string) => {
	try {
		const { error } = await supabase
			.from('stories')
			.delete()
			.eq('id', storyId);

		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error('Error deleting story:', error);
		return { error };
	}
};

export const getStories = async (filters?: {
	userId?: string;
	petId?: string;
}) => {
	try {
		let query = supabase.from('stories').select('*');

		if (filters?.userId) {
			query = query.eq('user_id', filters.userId);
		}
		if (filters?.petId) {
			query = query.eq('pet_id', filters.petId);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching stories:', error);
		return { data: null, error };
	}
}; 