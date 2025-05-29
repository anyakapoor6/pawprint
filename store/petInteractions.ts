import { create } from 'zustand';
import { PetComment } from '@/types/pet';

interface PetInteractionsState {
  likes: Set<string>;
  comments: Record<string, PetComment[]>;
  toggleLike: (petId: string) => void;
  isLiked: (petId: string) => boolean;
  addComment: (petId: string, comment: PetComment) => void;
  getComments: (petId: string) => PetComment[];
  getLikeCount: (petId: string) => number;
}

export const usePetInteractions = create<PetInteractionsState>((set, get) => ({
  likes: new Set(),
  comments: {},
  
  toggleLike: (petId: string) => {
    set(state => {
      const newLikes = new Set(state.likes);
      if (newLikes.has(petId)) {
        newLikes.delete(petId);
      } else {
        newLikes.add(petId);
      }
      return { likes: newLikes };
    });
  },
  
  isLiked: (petId: string) => {
    return get().likes.has(petId);
  },
  
  addComment: (petId: string, comment: PetComment) => {
    set(state => ({
      comments: {
        ...state.comments,
        [petId]: [...(state.comments[petId] || []), comment]
      }
    }));
  },
  
  getComments: (petId: string) => {
    return get().comments[petId] || [];
  },
  
  getLikeCount: (petId: string) => {
    // Base like count (could be from API in real app)
    const baseLikes = 5;
    return baseLikes + (get().likes.has(petId) ? 1 : 0);
  },
}));