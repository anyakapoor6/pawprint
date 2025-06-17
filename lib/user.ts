import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	phone?: string;
	photo_url?: string;
	expo_push_token?: string;
	created_at: string;
	updated_at: string;
}

export interface UserLikedPet {
	id: string;
	user_id: string;
	pet_id: string;
	created_at: string;
}

export interface UserReport {
	id: string;
	user_id: string;
	pet_id: string;
	report_type: string;
	description: string;
	status: 'pending' | 'reviewed' | 'resolved';
	created_at: string;
	pet_type: string;
	pet_name: string;
	pet_breed?: string;
	pet_color: string;
	pet_size: 'small' | 'medium' | 'large';
	pet_gender: 'male' | 'female' | 'unknown';
	pet_age?: 'baby' | 'adult' | 'senior';
	is_urgent: boolean;
	last_seen_location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	photos: string[];
	tags: string[];
}

export interface UserStory {
	id: string;
	user_id: string;
	pet_id: string;
	content: string;
	media_url?: string;
	created_at: string;
}

// Sign out function
export const signOut = async () => {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Error signing out:', error);
		return { success: false, error };
	}
};

// Get user profile
export const getUserProfile = async (userId: string) => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('id, name, email, phone, photo_url, expo_push_token, created_at, updated_at')
			.eq('id', userId)
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return { data: null, error };
	}
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
	try {
		// Only allow updating specific fields
		const allowedUpdates = {
			name: updates.name,
			email: updates.email,
			phone: updates.phone,
			photo_url: updates.photo_url,
			expo_push_token: updates.expo_push_token,
			updated_at: new Date().toISOString()
		};

		const { data, error } = await supabase
			.from('profiles')
			.update(allowedUpdates)
			.eq('id', userId)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error updating user profile:', error);
		return { data: null, error };
	}
};

// Update push notification token
export const updatePushToken = async (userId: string, expoPushToken: string) => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.update({
				expo_push_token: expoPushToken,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error updating push token:', error);
		return { data: null, error };
	}
};

// Get user's liked pets
export const getLikedPets = async (userId: string) => {
	try {
		const { data, error } = await supabase
			.from('liked_pets')
			.select(`
        *,
        pet_reports (*)
      `)
			.eq('user_id', userId);

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching liked pets:', error);
		return { data: null, error };
	}
};

// Like/Unlike a pet
export const togglePetLike = async (userId: string, petId: string) => {
	try {
		// Check if already liked
		const { data: existingLike } = await supabase
			.from('liked_pets')
			.select('id')
			.eq('user_id', userId)
			.eq('pet_id', petId)
			.single();

		if (existingLike) {
			// Unlike
			const { error } = await supabase
				.from('liked_pets')
				.delete()
				.eq('id', existingLike.id);

			if (error) throw error;
			return { liked: false, error: null };
		} else {
			// Like
			const { error } = await supabase
				.from('liked_pets')
				.insert({ user_id: userId, pet_id: petId });

			if (error) throw error;
			return { liked: true, error: null };
		}
	} catch (error) {
		console.error('Error toggling pet like:', error);
		return { liked: null, error };
	}
};

// Create a report
export const createReport = async (report: Omit<UserReport, 'id' | 'created_at'>) => {
	try {
		const { data, error } = await supabase
			.from('reports')
			.insert(report)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating report:', error);
		return { data: null, error };
	}
};

// Get user's reports
export async function getUserReports(userId: string): Promise<UserReport[]> {
	const { data, error } = await supabase
		.from('reports')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching user reports:', error);
		throw error;
	}

	return data as UserReport[];
}

// Update report status
export async function updateReportStatus(reportId: string, status: 'pending' | 'resolved'): Promise<void> {
	const { error } = await supabase
		.from('reports')
		.update({ status })
		.eq('id', reportId);

	if (error) {
		console.error('Error updating report status:', error);
		throw error;
	}
}

// Create a story
export const createStory = async (story: Omit<UserStory, 'id' | 'created_at'>) => {
	try {
		const { data, error } = await supabase
			.from('stories')
			.insert(story)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating story:', error);
		return { data: null, error };
	}
};

// Get user's stories
export const getUserStories = async (userId: string) => {
	try {
		const { data, error } = await supabase
			.from('stories')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching user stories:', error);
		return { data: null, error };
	}
}; 