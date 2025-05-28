import { create } from 'zustand';

interface LikesState {
  storyLikes: Set<string>;
  commentLikes: Set<string>;
  toggleStoryLike: (storyId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  isStoryLiked: (storyId: string) => boolean;
  isCommentLiked: (commentId: string) => boolean;
}

export const useLikes = create<LikesState>((set, get) => ({
  storyLikes: new Set(),
  commentLikes: new Set(),
  
  toggleStoryLike: (storyId: string) => {
    set(state => {
      const newLikes = new Set(state.storyLikes);
      if (newLikes.has(storyId)) {
        newLikes.delete(storyId);
      } else {
        newLikes.add(storyId);
      }
      return { storyLikes: newLikes };
    });
  },
  
  toggleCommentLike: (commentId: string) => {
    set(state => {
      const newLikes = new Set(state.commentLikes);
      if (newLikes.has(commentId)) {
        newLikes.delete(commentId);
      } else {
        newLikes.add(commentId);
      }
      return { commentLikes: newLikes };
    });
  },
  
  isStoryLiked: (storyId: string) => {
    return get().storyLikes.has(storyId);
  },
  
  isCommentLiked: (commentId: string) => {
    return get().commentLikes.has(commentId);
  },
}));