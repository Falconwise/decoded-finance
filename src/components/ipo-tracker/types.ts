// Shared types for IPO tracker components

export interface LivePriceEntry {
    symbol: string;
    ticker: string;
    currentPrice: number | null;
    ipoPrice: number | null;
    returnPct: number | null;
    peRatio: number | null;
    currency: string;
    updatedAt: string;
}

export interface PriceCache {
    prices: LivePriceEntry[];
    fetchedAt: string;
    successCount: number;
    failCount: number;
}

export type PriceStatus = 'idle' | 'loading' | 'ok' | 'error';
export type YearFilter = 'all' | number;
export type MarketFilter = 'all' | 'TASI' | 'Nomu';

export type LivePriceMap = Record<string, LivePriceEntry>;
