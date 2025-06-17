export type CommentType = 'story' | 'report';
export type CommentSortBy = 'recent' | 'oldest' | 'mostLiked';
export type FlagReason = 'spam' | 'inappropriate' | 'harassment' | 'other';

export interface CommentLike {
	id: string;
	user_id: string;
	comment_id: string;
	type: CommentType;
	created_at: string;
}

export interface CommentFlag {
	id: string;
	user_id: string;
	comment_id: string;
	type: CommentType;
	reason: FlagReason;
	created_at: string;
}

export interface EngagementPreview {
	like_count: number;
	comment_count: number;
	user_liked: boolean;
}

export interface BaseComment {
	id: string;
	content: string;
	created_at: string;
	user_name: string;
	user_photo: string | null;
	like_count: number;
	user_liked: boolean;
	is_deleted: boolean;
	parent_id?: string;
}

export interface StoryComment extends BaseComment {
	type: 'story';
	story_id: string;
}

export interface ReportComment extends BaseComment {
	type: 'report';
	report_id: string;
}

export type CommentWithMetadata = StoryComment | ReportComment; 