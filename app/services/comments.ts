import { supabase } from '@/lib/supabase';
import { StoryComment, ReportComment } from '@/types/engagement';

// Report Comments
export const createReportComment = async (reportId: string, userId: string, content: string, parentId?: string) => {
	try {
		const { data, error } = await supabase
			.from('report_comments')
			.insert([{
				report_id: reportId,
				user_id: userId,
				content,
				parent_id: parentId,
			}])
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating report comment:', error);
		return { data: null, error };
	}
};

export const getReportComments = async (reportId: string) => {
	try {
		const { data, error } = await supabase
			.from('report_comments')
			.select(`
				*,
				profiles!user_id (name, photo_url)
			`)
			.eq('report_id', reportId)
			.eq('is_deleted', false)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching report comments:', error);
		return { data: null, error };
	}
};

// Story Comments
export const createStoryComment = async (storyId: string, userId: string, content: string, parentId?: string) => {
	try {
		const { data, error } = await supabase
			.from('story_comments')
			.insert([{
				story_id: storyId,
				user_id: userId,
				content,
				parent_id: parentId,
			}])
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error creating story comment:', error);
		return { data: null, error };
	}
};

export const getStoryComments = async (storyId: string) => {
	try {
		const { data, error } = await supabase
			.from('story_comments')
			.select(`
				*,
				profiles!user_id (name, photo_url)
			`)
			.eq('story_id', storyId)
			.eq('is_deleted', false)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching story comments:', error);
		return { data: null, error };
	}
};

export const updateComment = async (commentId: string, updates: Partial<StoryComment>) => {
	try {
		const { data, error } = await supabase
			.from('story_comments')
			.update(updates)
			.eq('id', commentId)
			.select()
			.single();

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error updating comment:', error);
		return { data: null, error };
	}
};

export const deleteComment = async (commentId: string, commentType: 'story' | 'report') => {
	try {
		const table = commentType === 'story' ? 'story_comments' : 'report_comments';
		const { error } = await supabase
			.from(table)
			.update({ is_deleted: true })
			.eq('id', commentId);

		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error('Error deleting comment:', error);
		return { error };
	}
};

export const flagComment = async (commentId: string, userId: string, reason: string, commentType: 'story' | 'report') => {
	try {
		const { error } = await supabase
			.from('comment_flags')
			.insert([{
				comment_id: commentId,
				user_id: userId,
				reason,
				type: commentType,
			}]);

		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error('Error flagging comment:', error);
		return { error };
	}
};

export const getComments = async (reportId: string) => {
	try {
		const { data, error } = await supabase
			.from('comments')
			.select('*')
			.eq('reportId', reportId)
			.order('timestamp', { ascending: true });

		if (error) throw error;
		return { data, error: null };
	} catch (error) {
		console.error('Error fetching comments:', error);
		return { data: null, error };
	}
}; 