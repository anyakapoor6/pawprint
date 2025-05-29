import { create } from 'zustand';
import { Donation } from '@/types/pet';
import { useStories } from './stories';

interface DonationsState {
  processingDonation: boolean;
  donate: (storyId: string, amount: number, message?: string) => Promise<void>;
}

export const useDonations = create<DonationsState>((set) => ({
  processingDonation: false,

  donate: async (storyId: string, amount: number, message?: string) => {
    try {
      set({ processingDonation: true });

      // In a real app, this would make an API call to process the payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      const donation: Donation = {
        id: `donation-${Date.now()}`,
        userId: 'user1', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        userPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        amount,
        message,
        timestamp: new Date().toISOString(),
      };

      // Add donation to the story
      useStories.getState().addDonation(storyId, donation);

    } catch (error) {
      console.error('Error processing donation:', error);
      throw error;
    } finally {
      set({ processingDonation: false });
    }
  },
}));