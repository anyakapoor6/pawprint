import { create } from 'zustand';
import { Story, Donation } from '@/types/pet';
import { mockStories } from '@/data/mockData';

interface StoriesState {
  stories: Story[];
  addStory: (story: Story) => void;
  getUserStories: (userId: string) => Story[];
  addDonation: (storyId: string, donation: Donation) => void;
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

  addDonation: (storyId: string, donation: Donation) => {
    set(state => ({
      stories: state.stories.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            donations: [...(story.donations || []), donation],
            totalDonations: (story.totalDonations || 0) + donation.amount
          };
        }
        return story;
      })
    }));
  },
}));