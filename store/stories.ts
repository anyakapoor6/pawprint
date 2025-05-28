import { create } from 'zustand';
import { Story } from '@/types/pet';
import { mockStories } from '@/data/mockData';

interface StoriesState {
  stories: Story[];
  addStory: (story: Story) => void;
  getUserStories: (userId: string) => Story[];
}

export const useStories = create<StoriesState>((set, get) => ({
  stories: mockStories,
  
  addStory: (story: Story) => {
    set(state => ({
      stories: [story, ...state.stories]
    }));
  },
  
  getUserStories: (userId: string) => {
    return get().stories.filter(story => story.userId === userId);
  },
}));