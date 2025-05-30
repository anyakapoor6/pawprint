import { useCallback, useState } from 'react';
import { useAuth } from '@/store/auth';
import { STRIPE_PRODUCTS, StripeProduct } from '@/src/stripe-config';

interface CreateCheckoutOptions {
  productId: StripeProduct;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export function useStripe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(async (options: CreateCheckoutOptions): Promise<CheckoutResponse | null> => {
    if (!user) {
      setError('User must be logged in');
      return null;
    }

    const product = STRIPE_PRODUCTS[options.productId];
    if (!product) {
      setError('Invalid product');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: options.successUrl,
          cancel_url: options.cancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createCheckoutSession,
    loading,
    error,
  };
}