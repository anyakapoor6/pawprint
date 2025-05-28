import { create } from 'zustand';
import { PremiumFeature } from '@/types/pet';

interface PremiumState {
  features: PremiumFeature[];
  purchaseFeature: (featureId: string) => Promise<void>;
  initializePayment: () => Promise<void>;
}

export const usePremium = create<PremiumState>((set, get) => ({
  features: [
    {
      id: 'urgent-tag',
      name: 'Priority Boost',
      description: 'Get maximum visibility for your lost pet report with priority placement, urgent tag, and extended reach. Your report will be featured in the urgent section, appear higher in search results, and be highlighted on the map.',
      price: 9.99,
      type: 'urgentTag',
    },
    {
      id: 'notification-radius',
      name: 'Notification Radius',
      description: 'Send notifications to users within a specific radius',
      price: 9.99,
      type: 'notification',
    },
  ],
  
  purchaseFeature: async (featureId: string) => {
    try {
      const feature = get().features.find(f => f.id === featureId);
      if (!feature) throw new Error('Feature not found');

      // In a real app, this would integrate with Stripe
      // For demo purposes, we'll simulate a successful purchase
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    } catch (error) {
      console.error('Purchase error:', error);
      throw error;
    }
  },

  initializePayment: async () => {
    try {
      // Initialize Stripe or other payment provider
      return Promise.resolve();
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  },
}));