import { supabase } from './supabase';
import { sendPushNotification } from './notifications';
import {
	CommentType,
	CommentSortBy,
	EngagementPreview,
	StoryComment,
	ReportComment,
} from '@/types/engagement';

// Helper to extract user info from Supabase join
function extractUser(userField: any): { name: string; photo_url: string | null } {
	if (Array.isArray(userField) && userField.length > 0 && typeof userField[0] === 'object') {
		const { name, photo_url } = userField[0] as { name?: string; photo_url?: string | null };
		return {
			name: typeof name === 'string' ? name : 'Unknown User',
			photo_url: typeof photo_url === 'string' ? photo_url : null,
		};
	}
	return { name: 'Unknown User', photo_url: null };
}

// --- LIKE TOGGLING ---
export async function toggleStoryLike(storyId: string, userId: string): Promise<number> {
	// Check if like exists
	const { data: existing, error: fetchError } = await supabase
		.from('story_likes')
		.select('id')
		.eq('story_id', storyId)
		.eq('user_id', userId)
		.maybeSingle();
	if (fetchError) throw fetchError;
	if (existing) {
		// Unlike
		const { error } = await supabase
			.from('story_likes')
			.delete()
			.eq('id', existing.id);
		if (error) throw error;
	} else {
		// Like
		const { error } = await supabase
			.from('story_likes')
			.insert({ story_id: storyId, user_id: userId });
		if (error) throw error;
	}
	// Return new like count
	const { count } = await supabase
		.from('story_likes')
		.select('*', { count: 'exact', head: true })
		.eq('story_id', storyId);
	return count || 0;
}

export async function toggleReportLike(reportId: string, userId: string): Promise<number> {
	const { data: existing, error: fetchError } = await supabase
		.from('report_likes')
		.select('id')
		.eq('report_id', reportId)
		.eq('user_id', userId)
		.maybeSingle();
	if (fetchError) throw fetchError;
	if (existing) {
		const { error } = await supabase
			.from('report_likes')
			.delete()
			.eq('id', existing.id);
		if (error) throw error;
	} else {
		const { error } = await supabase
			.from('report_likes')
			.insert({ report_id: reportId, user_id: userId });
		if (error) throw error;
	}
	const { count } = await supabase
		.from('report_likes')
		.select('*', { count: 'exact', head: true })
		.eq('report_id', reportId);
	return count || 0;
}

// --- COMMENT CREATION ---
export async function createStoryComment(
	storyId: string,
	userId: string,
	content: string,
	parentId?: string
): Promise<{ comment: StoryComment; totalCount: number }> {
	const { data: comment, error } = await supabase
		.from('story_comments')
		.insert({
			story_id: storyId,
			user_id: userId,
			content,
			parent_id: parentId,
		})
		.select(`
      id,
      content,
      created_at,
      user:profiles!user_id (
        name,
        photo_url
      )
    `)
		.single();
	if (error) throw error;
	// Get total comment count
	const { count } = await supabase
		.from('story_comments')
		.select('*', { count: 'exact', head: true })
		.eq('story_id', storyId);
	// Notification logic omitted for brevity
	const user = extractUser(comment.user);
	return {
		comment: {
			id: comment.id,
			content: comment.content,
			created_at: comment.created_at,
			user_name: user.name,
			user_photo: user.photo_url,
			like_count: 0,
			user_liked: false,
			is_deleted: false,
			type: 'story' as const,
			story_id: storyId,
		},
		totalCount: count || 0,
	};
}

export async function createReportComment(
	reportId: string,
	userId: string,
	content: string,
	parentId?: string
): Promise<{ comment: ReportComment; totalCount: number }> {
	const { data: comment, error } = await supabase
		.from('report_comments')
		.insert({
			report_id: reportId,
			user_id: userId,
			content,
			parent_id: parentId,
		})
		.select(`
      id,
      content,
      created_at,
      user:profiles!user_id (
        name,
        photo_url
      )
    `)
		.single();
	if (error) throw error;
	const { count } = await supabase
		.from('report_comments')
		.select('*', { count: 'exact', head: true })
		.eq('report_id', reportId);
	const user = extractUser(comment.user);
	return {
		comment: {
			id: comment.id,
			content: comment.content,
			created_at: comment.created_at,
			user_name: user.name,
			user_photo: user.photo_url,
			like_count: 0,
			user_liked: false,
			is_deleted: false,
			type: 'report' as const,
			report_id: reportId,
		},
		totalCount: count || 0,
	};
}

// --- FETCH COMMENTS ---
export async function getStoryComments(
	storyId: string,
	userId: string,
	sortBy: CommentSortBy = 'recent'
): Promise<{ comments: StoryComment[]; totalCount: number }> {
	const { data: comments, error } = await supabase
		.from('story_comments')
		.select(`
      id,
      content,
      created_at,
      user:profiles!user_id (
        name,
        photo_url
      ),
      story_likes!story_comment_id (
        user_id
      )
    `)
		.eq('story_id', storyId)
		.eq('is_deleted', false)
		.order(sortBy === 'recent' ? 'created_at' : 'created_at', { ascending: sortBy === 'oldest' });
	if (error) throw error;
	const { count } = await supabase
		.from('story_comments')
		.select('*', { count: 'exact', head: true })
		.eq('story_id', storyId)
		.eq('is_deleted', false);
	const mappedComments = comments.map((comment: any) => {
		const user = extractUser(comment.user);
		return {
			id: comment.id,
			content: comment.content,
			created_at: comment.created_at,
			user_name: user.name,
			user_photo: user.photo_url,
			like_count: comment.story_likes?.length || 0,
			user_liked: comment.story_likes?.some((like: any) => like.user_id === userId) || false,
			is_deleted: false,
			type: 'story' as const,
			story_id: storyId,
		};
	});
	if (sortBy === 'mostLiked') {
		mappedComments.sort((a, b) => b.like_count - a.like_count);
	}
	return {
		comments: mappedComments,
		totalCount: count || 0,
	};
}

export async function getReportComments(
	reportId: string,
	userId: string,
	sortBy: CommentSortBy = 'recent'
): Promise<{ comments: ReportComment[]; totalCount: number }> {
	const { data: comments, error } = await supabase
		.from('report_comments')
		.select(`
      id,
      content,
      created_at,
      user:profiles!user_id (
        name,
        photo_url
      ),
      report_likes!report_comment_id (
        user_id
      )
    `)
		.eq('report_id', reportId)
		.eq('is_deleted', false)
		.order(sortBy === 'recent' ? 'created_at' : 'created_at', { ascending: sortBy === 'oldest' });
	if (error) throw error;
	const { count } = await supabase
		.from('report_comments')
		.select('*', { count: 'exact', head: true })
		.eq('report_id', reportId)
		.eq('is_deleted', false);
	const mappedComments = comments.map((comment: any) => {
		const user = extractUser(comment.user);
		return {
			id: comment.id,
			content: comment.content,
			created_at: comment.created_at,
			user_name: user.name,
			user_photo: user.photo_url,
			like_count: comment.report_likes?.length || 0,
			user_liked: comment.report_likes?.some((like: any) => like.user_id === userId) || false,
			is_deleted: false,
			type: 'report' as const,
			report_id: reportId,
		};
	});
	if (sortBy === 'mostLiked') {
		mappedComments.sort((a, b) => b.like_count - a.like_count);
	}
	return {
		comments: mappedComments,
		totalCount: count || 0,
	};
}

// --- ENGAGEMENT PREVIEWS ---
export async function getStoryEngagementPreview(storyId: string, userId: string): Promise<EngagementPreview> {
	const { count: like_count } = await supabase
		.from('story_likes')
		.select('*', { count: 'exact', head: true })
		.eq('story_id', storyId);
	const { count: comment_count } = await supabase
		.from('story_comments')
		.select('*', { count: 'exact', head: true })
		.eq('story_id', storyId)
		.eq('is_deleted', false);
	const { data: liked } = await supabase
		.from('story_likes')
		.select('id')
		.eq('story_id', storyId)
		.eq('user_id', userId)
		.maybeSingle();
	return {
		like_count: like_count || 0,
		comment_count: comment_count || 0,
		user_liked: !!liked,
	};
}

export async function getReportEngagementPreview(reportId: string, userId: string): Promise<EngagementPreview> {
	const { count: like_count } = await supabase
		.from('report_likes')
		.select('*', { count: 'exact', head: true })
		.eq('report_id', reportId);
	const { count: comment_count } = await supabase
		.from('report_comments')
		.select('*', { count: 'exact', head: true })
		.eq('report_id', reportId)
		.eq('is_deleted', false);
	const { data: liked } = await supabase
		.from('report_likes')
		.select('id')
		.eq('report_id', reportId)
		.eq('user_id', userId)
		.maybeSingle();
	return {
		like_count: like_count || 0,
		comment_count: comment_count || 0,
		user_liked: !!liked,
	};
}

// --- COMMENT DELETION & FLAGGING ---
export async function deleteStoryComment(commentId: string, userId: string): Promise<void> {
	// Soft delete: set is_deleted = true
	const { error } = await supabase
		.from('story_comments')
		.update({ is_deleted: true })
		.eq('id', commentId)
		.eq('user_id', userId);
	if (error) throw error;
}

export async function flagStoryComment(commentId: string, userId: string, reason: string): Promise<void> {
	const { error } = await supabase
		.from('comment_flags')
		.insert({
			comment_id: commentId,
			user_id: userId,
			type: 'story',
			reason,
		});
	if (error) throw error;
}

export async function deleteReportComment(commentId: string, userId: string): Promise<void> {
	const { error } = await supabase
		.from('report_comments')
		.update({ is_deleted: true })
		.eq('id', commentId)
		.eq('user_id', userId);
	if (error) throw error;
}

export async function flagReportComment(commentId: string, userId: string, reason: string): Promise<void> {
	const { error } = await supabase
		.from('comment_flags')
		.insert({
			comment_id: commentId,
			user_id: userId,
			type: 'report',
			reason,
		});
	if (error) throw error;
}
