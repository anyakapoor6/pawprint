export const STRIPE_PRODUCTS = {
  MAP_UNLOCK: {
    id: 'prod_SPA3eb0CqITr7E',
    priceId: 'price_1RULjJI3XAQOvF96xuFoyhua',
    name: 'Map Unlock',
    description: 'Unlock full access to the map and explore all lost and found pet reports around you. One-time purchase.',
    mode: 'payment' as const,
  },
  URGENCY_TAG: {
    id: 'prod_SPA2Dx2DSC3qOs',
    priceId: 'price_1RULiQI3XAQOvF966RTcPCsT',
    name: 'Urgency Tag',
    description: 'Highlight your lost pet report with a prominent urgency label to increase visibility and get faster help from the community.',
    mode: 'payment' as const,
  },
} as const;

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;