export const API_BILLING_CONFIG = {
    PRICES: {
        STARTER: process.env.STRIPE_PRICE_API_STARTER || 'price_1SvbsLLMWm2VgHMGFDGHoAAp',
        PRO: process.env.STRIPE_PRICE_API_PRO || 'price_1SvbsfLMWm2VgHMGlrdIe52S',
        ENTERPRISE: process.env.STRIPE_PRICE_API_ENTERPRISE || 'price_1Svbt9LMWm2VgHMGEjpjUvV4',
    },
    TIERS: {
        FREE: {
            limit: 100,
            topics: ['CONCIERGE', 'DINING', 'MOVIE', 'BOOK']
        },
        STARTER: {
            limit: 1000,
            topics: ['ALL'] // Full Access
        },
        PRO: {
            limit: 5000,
            topics: ['ALL']
        },
        ENTERPRISE: {
            limit: -1, // Unlimited
            topics: ['ALL']
        }
    }
};

export function getTierFromPriceId(priceId: string): string | null {
    if (priceId === API_BILLING_CONFIG.PRICES.STARTER) return 'STARTER';
    if (priceId === API_BILLING_CONFIG.PRICES.PRO) return 'PRO';
    if (priceId === API_BILLING_CONFIG.PRICES.ENTERPRISE) return 'ENTERPRISE';
    return null;
}
