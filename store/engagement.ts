import { create } from 'zustand';
import { useAuth } from '@/store/auth';
import {
	CommentSortBy,
	EngagementPreview,
	StoryComment,
	ReportComment,
} from '@/types/engagement';
import {
	toggleStoryLike as toggleStoryLikeApi,
	createStoryComment as createStoryCommentApi,
	deleteStoryComment as deleteStoryCommentApi,
	flagStoryComment as flagStoryCommentApi,
	toggleReportLike as toggleReportLikeApi,
	createReportComment as createReportCommentApi,
	deleteReportComment as deleteReportCommentApi,
	flagReportComment as flagReportCommentApi,
	getStoryComments,
	getReportComments,
	getStoryEngagementPreview,
	getReportEngagementPreview,
} from '@/lib/engagement';

interface EngagementState {
	// Story engagement
	storyComments: Record<string, { comments: StoryComment[]; totalCount: number }>;
	storyLikeCounts: Record<string, number>;
	storyCommentCounts: Record<string, number>;
	storyEngagementPreviews: Record<string, EngagementPreview>;
	isStoryLiked: (storyId: string) => boolean;
	toggleStoryLike: (storyId: string) => Promise<void>;
	createStoryComment: (storyId: string, content: string, parentId?: string) => Promise<void>;
	deleteStoryComment: (commentId: string) => Promise<void>;
	flagStoryComment: (commentId: string, reason: string) => Promise<void>;
	loadStoryEngagement: (storyId: string, sortBy?: CommentSortBy) => Promise<void>;
	loadStoryEngagementPreview: (storyId: string) => Promise<void>;

	// Report engagement
	reportComments: Record<string, { comments: ReportComment[]; totalCount: number }>;
	reportLikeCounts: Record<string, number>;
	reportCommentCounts: Record<string, number>;
	reportEngagementPreviews: Record<string, EngagementPreview>;
	isReportLiked: (reportId: string) => boolean;
	toggleReportLike: (reportId: string) => Promise<void>;
	createReportComment: (reportId: string, content: string, parentId?: string) => Promise<void>;
	deleteReportComment: (commentId: string) => Promise<void>;
	flagReportComment: (commentId: string, reason: string) => Promise<void>;
	loadReportEngagement: (reportId: string, sortBy?: CommentSortBy) => Promise<void>;
	loadReportEngagementPreview: (reportId: string) => Promise<void>;

	// Loading states
	isLoading: boolean;
	error: string | null;
}

export const useEngagement = create<EngagementState>((set, get) => {
	const { user } = useAuth.getState();

	return {
		// Story engagement state
		storyComments: {},
		storyLikeCounts: {},
		storyCommentCounts: {},
		storyEngagementPreviews: {},
		isLoading: false,
		error: null,

		// Report engagement state
		reportComments: {},
		reportLikeCounts: {},
		reportCommentCounts: {},
		reportEngagementPreviews: {},

		// Story engagement methods
		isStoryLiked: (storyId: string) => {
			const preview = get().storyEngagementPreviews[storyId];
			return preview?.user_liked || false;
		},

		toggleStoryLike: async (storyId: string) => {
			if (!user?.id) throw new Error('User must be logged in to like stories');
			set({ isLoading: true, error: null });
			try {
				const newCount = await toggleStoryLikeApi(storyId, user.id);
				const preview = await getStoryEngagementPreview(storyId, user.id);
				set(state => ({
					storyEngagementPreviews: { ...state.storyEngagementPreviews, [storyId]: preview },
					storyLikeCounts: { ...state.storyLikeCounts, [storyId]: newCount },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error toggling story like:', err);
				set({ error: 'Failed to update like', isLoading: false });
				throw err;
			}
		},

		createStoryComment: async (storyId: string, content: string, parentId?: string) => {
			if (!user?.id) throw new Error('User must be logged in to comment');
			set({ isLoading: true, error: null });
			try {
				await createStoryCommentApi(storyId, user.id, content, parentId);
				const commentsData = await getStoryComments(storyId, user.id);
				const preview = await getStoryEngagementPreview(storyId, user.id);
				set(state => ({
					storyComments: { ...state.storyComments, [storyId]: commentsData },
					storyCommentCounts: { ...state.storyCommentCounts, [storyId]: commentsData.totalCount },
					storyEngagementPreviews: { ...state.storyEngagementPreviews, [storyId]: preview },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error creating story comment:', err);
				set({ error: 'Failed to create comment', isLoading: false });
				throw err;
			}
		},

		deleteStoryComment: async (commentId: string) => {
			if (!user?.id) throw new Error('User must be logged in to delete comments');
			set({ isLoading: true, error: null });
			try {
				await deleteStoryCommentApi(commentId, user.id);
				const storyId = Object.entries(get().storyComments).find(([_, data]) =>
					data.comments.some(comment => comment.id === commentId)
				)?.[0];
				if (storyId) {
					const commentsData = await getStoryComments(storyId, user.id);
					const preview = await getStoryEngagementPreview(storyId, user.id);
					set(state => ({
						storyComments: { ...state.storyComments, [storyId]: commentsData },
						storyEngagementPreviews: { ...state.storyEngagementPreviews, [storyId]: preview },
						isLoading: false,
					}));
				}
			} catch (err) {
				console.error('Error deleting story comment:', err);
				set({ error: 'Failed to delete comment', isLoading: false });
				throw err;
			}
		},

		flagStoryComment: async (commentId: string, reason: string) => {
			if (!user?.id) throw new Error('User must be logged in to flag comments');
			set({ isLoading: true, error: null });
			try {
				await flagStoryCommentApi(commentId, user.id, reason);
				set({ isLoading: false });
			} catch (err) {
				console.error('Error flagging story comment:', err);
				set({ error: 'Failed to flag comment', isLoading: false });
				throw err;
			}
		},

		loadStoryEngagement: async (storyId: string, sortBy: CommentSortBy = 'recent') => {
			if (!user?.id) throw new Error('User must be logged in to load engagement');
			set({ isLoading: true, error: null });
			try {
				const [commentsData, preview] = await Promise.all([
					getStoryComments(storyId, user.id, sortBy),
					getStoryEngagementPreview(storyId, user.id),
				]);
				set(state => ({
					storyComments: { ...state.storyComments, [storyId]: commentsData },
					storyEngagementPreviews: { ...state.storyEngagementPreviews, [storyId]: preview },
					storyCommentCounts: { ...state.storyCommentCounts, [storyId]: commentsData.totalCount },
					storyLikeCounts: { ...state.storyLikeCounts, [storyId]: preview.like_count },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error loading story engagement:', err);
				set({ error: 'Failed to load engagement data', isLoading: false });
				throw err;
			}
		},

		loadStoryEngagementPreview: async (storyId: string) => {
			if (!user?.id) throw new Error('User must be logged in to load engagement');
			set({ isLoading: true, error: null });
			try {
				const preview = await getStoryEngagementPreview(storyId, user.id);
				set(state => ({
					storyEngagementPreviews: { ...state.storyEngagementPreviews, [storyId]: preview },
					storyLikeCounts: { ...state.storyLikeCounts, [storyId]: preview.like_count },
					storyCommentCounts: { ...state.storyCommentCounts, [storyId]: preview.comment_count },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error loading story engagement preview:', err);
				set({ error: 'Failed to load engagement preview', isLoading: false });
				throw err;
			}
		},

		// Report engagement methods
		isReportLiked: (reportId: string) => {
			const preview = get().reportEngagementPreviews[reportId];
			return preview?.user_liked || false;
		},

		toggleReportLike: async (reportId: string) => {
			if (!user?.id) throw new Error('User must be logged in to like reports');
			set({ isLoading: true, error: null });
			try {
				const newCount = await toggleReportLikeApi(reportId, user.id);
				const preview = await getReportEngagementPreview(reportId, user.id);
				set(state => ({
					reportEngagementPreviews: { ...state.reportEngagementPreviews, [reportId]: preview },
					reportLikeCounts: { ...state.reportLikeCounts, [reportId]: newCount },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error toggling report like:', err);
				set({ error: 'Failed to update like', isLoading: false });
				throw err;
			}
		},

		createReportComment: async (reportId: string, content: string, parentId?: string) => {
			if (!user?.id) throw new Error('User must be logged in to comment');
			set({ isLoading: true, error: null });
			try {
				await createReportCommentApi(reportId, user.id, content, parentId);
				const commentsData = await getReportComments(reportId, user.id);
				const preview = await getReportEngagementPreview(reportId, user.id);
				set(state => ({
					reportComments: { ...state.reportComments, [reportId]: commentsData },
					reportCommentCounts: { ...state.reportCommentCounts, [reportId]: commentsData.totalCount },
					reportEngagementPreviews: { ...state.reportEngagementPreviews, [reportId]: preview },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error creating report comment:', err);
				set({ error: 'Failed to create comment', isLoading: false });
				throw err;
			}
		},

		deleteReportComment: async (commentId: string) => {
			if (!user?.id) throw new Error('User must be logged in to delete comments');
			set({ isLoading: true, error: null });
			try {
				await deleteReportCommentApi(commentId, user.id);
				const reportId = Object.entries(get().reportComments).find(([_, data]) =>
					data.comments.some(comment => comment.id === commentId)
				)?.[0];
				if (reportId) {
					const commentsData = await getReportComments(reportId, user.id);
					const preview = await getReportEngagementPreview(reportId, user.id);
					set(state => ({
						reportComments: { ...state.reportComments, [reportId]: commentsData },
						reportEngagementPreviews: { ...state.reportEngagementPreviews, [reportId]: preview },
						isLoading: false,
					}));
				}
			} catch (err) {
				console.error('Error deleting report comment:', err);
				set({ error: 'Failed to delete comment', isLoading: false });
				throw err;
			}
		},

		flagReportComment: async (commentId: string, reason: string) => {
			if (!user?.id) throw new Error('User must be logged in to flag comments');
			set({ isLoading: true, error: null });
			try {
				await flagReportCommentApi(commentId, user.id, reason);
				set({ isLoading: false });
			} catch (err) {
				console.error('Error flagging report comment:', err);
				set({ error: 'Failed to flag comment', isLoading: false });
				throw err;
			}
		},

		loadReportEngagement: async (reportId: string, sortBy: CommentSortBy = 'recent') => {
			if (!user?.id) throw new Error('User must be logged in to load engagement');
			set({ isLoading: true, error: null });
			try {
				const [commentsData, preview] = await Promise.all([
					getReportComments(reportId, user.id, sortBy),
					getReportEngagementPreview(reportId, user.id),
				]);
				set(state => ({
					reportComments: { ...state.reportComments, [reportId]: commentsData },
					reportEngagementPreviews: { ...state.reportEngagementPreviews, [reportId]: preview },
					reportCommentCounts: { ...state.reportCommentCounts, [reportId]: commentsData.totalCount },
					reportLikeCounts: { ...state.reportLikeCounts, [reportId]: preview.like_count },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error loading report engagement:', err);
				set({ error: 'Failed to load engagement data', isLoading: false });
				throw err;
			}
		},

		loadReportEngagementPreview: async (reportId: string) => {
			if (!user?.id) throw new Error('User must be logged in to load engagement');
			set({ isLoading: true, error: null });
			try {
				const preview = await getReportEngagementPreview(reportId, user.id);
				set(state => ({
					reportEngagementPreviews: { ...state.reportEngagementPreviews, [reportId]: preview },
					reportLikeCounts: { ...state.reportLikeCounts, [reportId]: preview.like_count },
					reportCommentCounts: { ...state.reportCommentCounts, [reportId]: preview.comment_count },
					isLoading: false,
				}));
			} catch (err) {
				console.error('Error loading report engagement preview:', err);
				set({ error: 'Failed to load engagement preview', isLoading: false });
				throw err;
			}
		},
	};
});