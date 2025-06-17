import { create } from 'zustand';
import { PetComment } from '@/types/pet';
import { togglePetLike } from '@/lib/user';
import { useAuth } from '@/store/auth';

interface PetInteractionsState {
  likes: Set<string>;
  comments: Record<string, PetComment[]>;
  toggleLike: (petId: string) => Promise<void>;
  isLiked: (petId: string) => boolean;
  addComment: (petId: string, comment: PetComment) => void;
  getComments: (petId: string) => PetComment[];
  getLikeCount: (petId: string) => number;
}

export const usePetInteractions = create<PetInteractionsState>((set, get) => ({
  likes: new Set(),
  comments: {},

  toggleLike: async (petId: string) => {
    const { user } = useAuth.getState();
    if (!user) return;

    try {
      const { liked, error } = await togglePetLike(user.id, petId);
      if (error) throw error;

      set(state => {
        const newLikes = new Set(state.likes);
        if (liked) {
          newLikes.add(petId);
        } else {
          newLikes.delete(petId);
        }
        return { likes: newLikes };
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      // You might want to show an error toast here
    }
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