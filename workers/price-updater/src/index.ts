// ============================================================
// decoded.finance — Cloudflare Worker: IPO Price & PE Updater
// Redeploy: 2026-02-22 (debug logging enabled)
//
// Runs on a daily cron schedule, fetches current prices and
// trailing P/E ratios for all IPO tracker stocks from Yahoo
// Finance (.SR tickers), calculates return % vs IPO price,
// stores in KV, and optionally triggers a Pages rebuild.
//
// Endpoint used: Yahoo Finance v7/finance/quote (returns price
// + trailingPE in a single call per symbol).
//
// No API key required — uses Yahoo Finance public endpoints.
// ============================================================

export interface Env {
    /** KV namespace binding — stores latest price snapshot */
    IPO_PRICES: KVNamespace;
    /**
     * Cloudflare Pages deploy hook URL (set as a Worker secret).
     * Setup: npx wrangler secret put PAGES_DEPLOY_HOOK
     */
    PAGES_DEPLOY_HOOK?: string;
}

// ---- Types ----

interface PriceEntry {
    symbol: string;
    ticker: string;
    currentPrice: number | null;
    ipoPrice: number | null;   // null for direct listings
    returnPct: number | null;
    peRatio: number | null;
    currency: string;
    updatedAt: string;
}

export interface PriceCache {
    prices: PriceEntry[];
    fetchedAt: string;
    successCount: number;
    failCount: number;
}

// ---- All tracked Saudi IPO stocks ----
// Tickers are constructed as `${symbol}.SR` for Yahoo Finance Tadawul feed.
// ipoPrice: null for direct listings (no offer price, so no return % is computed).

const IPO_STOCKS: Array<{ symbol: string; ipoPrice: number | null; name: string }> = [
    // ── 2026 ────────────────────────────────────────────────────
    { symbol: '4339', ipoPrice: 45,     name: 'Al Rashed Foods' },

    // ── 2025 TASI ────────────────────────────────────────────────
    { symbol: '4147', ipoPrice: 10,     name: 'Consolidated Grunenfelder Saady (CGS)' },
    { symbol: '6019', ipoPrice: 19.50,  name: 'Almasar Alshamil Education' },
    { symbol: '4265', ipoPrice: 28,     name: 'Cherry Trading' },
    { symbol: '4196', ipoPrice: 85,     name: 'Marketing Home Group' },
    { symbol: '4326', ipoPrice: 14,     name: 'Dar Al Majed Real Estate' },
    { symbol: '6018', ipoPrice: 7.50,   name: 'Sport Clubs Company' },
    { symbol: '4019', ipoPrice: 25,     name: 'Specialized Medical Company' },
    { symbol: '4264', ipoPrice: 80,     name: 'flynas' },
    { symbol: '1323', ipoPrice: 50,     name: 'United Carton Industries (UCIC)' },
    { symbol: '4325', ipoPrice: 15,     name: 'Umm Al Qura Development (Masar)' },
    { symbol: '2287', ipoPrice: 50,     name: 'Entaj Agricultural' },
    { symbol: '4084', ipoPrice: 30,     name: 'Derayah Financial' },
    { symbol: '4195', ipoPrice: 35,     name: 'Nice One Beauty' },
    { symbol: '4018', ipoPrice: 127,    name: 'Almoosa Health' },

    // ── 2024 TASI ────────────────────────────────────────────────
    { symbol: '4260', ipoPrice: 132,    name: 'United International (Tasheel)' },
    { symbol: '1835', ipoPrice: 50,     name: 'Tamkeen Human Resource' },
    { symbol: '2286', ipoPrice: 5.30,   name: 'Fourth Milling Company' },
    { symbol: '2285', ipoPrice: 66,     name: 'Arabian Mills for Food' },
    { symbol: '4165', ipoPrice: 94,     name: 'Al Majed Oud' },
    { symbol: '8313', ipoPrice: 37,     name: 'Rasan Information Technology' },
    { symbol: '4143', ipoPrice: 43,     name: 'Al Taiseer Group Talco' },
    { symbol: '1834', ipoPrice: 7.50,   name: 'SMASCO' },
    { symbol: '4017', ipoPrice: 57.50,  name: 'Fakeeh Care' },
    { symbol: '2084', ipoPrice: 11.50,  name: 'Miahona' },
    { symbol: '2284', ipoPrice: 48,     name: 'Modern Mills for Food' },
    { symbol: '4016', ipoPrice: 82,     name: 'Middle East Pharma (Avalon)' },
    { symbol: '4072', ipoPrice: 25,     name: 'MBC Group' },

    // ── 2024 Nomu ────────────────────────────────────────────────
    { symbol: '9600', ipoPrice: 40,     name: 'Yaqeen Capital' },

    // ── 2023 TASI ────────────────────────────────────────────────
    { symbol: '4263', ipoPrice: 106,    name: 'SAL Saudi Logistics Services' },
    { symbol: '4262', ipoPrice: 66,     name: 'Lumi Rental' },
    { symbol: '1833', ipoPrice: 64,     name: 'Al Mawarid Manpower Solutions' },
    { symbol: '4015', ipoPrice: 60,     name: 'Jamjoom Pharmaceuticals' },
    { symbol: '4082', ipoPrice: null,   name: 'Morabaha Marina Financing' },
    { symbol: '2283', ipoPrice: null,   name: 'First Milling Company' },

    // ── 2023 Nomu ────────────────────────────────────────────────
    { symbol: '9570', ipoPrice: 130,    name: 'TAM Development' },
    { symbol: '9572', ipoPrice: 28,     name: 'Al Razi Medical' },
    { symbol: '9563', ipoPrice: 52,     name: 'Bena Steel Industries' },
    { symbol: '9564', ipoPrice: 37,     name: 'Horizon Food' },
    { symbol: '9561', ipoPrice: 40,     name: 'Knowledge Net' },
    { symbol: '9560', ipoPrice: 90,     name: 'WAJA Company' },

    // ── 2022 TASI ────────────────────────────────────────────────
    { symbol: '2223', ipoPrice: 99,     name: 'Luberef (Saudi Aramco Base Oil)' },
    { symbol: '4192', ipoPrice: 115,    name: 'AlSaif Stores' },
    { symbol: '4142', ipoPrice: 43,     name: 'Riyadh Cables Group' },
    { symbol: '6015', ipoPrice: 2.68,   name: 'Americana Restaurants International' },
    { symbol: '2083', ipoPrice: 46,     name: 'Marafiq' },
    { symbol: '7204', ipoPrice: 185,    name: 'Perfect Presentation (2P)' },
    { symbol: '2381', ipoPrice: 100,    name: 'Arabian Drilling Company' },
    { symbol: '2282', ipoPrice: 69,     name: 'Naqi Water' },
    { symbol: '6014', ipoPrice: 115,    name: 'AlAmar Foods' },
    { symbol: '4322', ipoPrice: 120,    name: 'Retal Urban Development' },
    { symbol: '1183', ipoPrice: 20,     name: 'Saudi Home Loans' },
    { symbol: '1322', ipoPrice: 63,     name: 'AMAK Mining' },
    { symbol: '4164', ipoPrice: 131,    name: 'Nahdi Medical' },
    { symbol: '4163', ipoPrice: 73,     name: 'Al-Dawaa Medical (DMSCO)' },
    { symbol: '4014', ipoPrice: 52,     name: 'Scientific & Medical Equipment House' },
    { symbol: '1321', ipoPrice: 80,     name: 'East Pipes Integrated' },
    { symbol: '7203', ipoPrice: 128,    name: 'Elm Company' },

    // ── 2021 TASI ────────────────────────────────────────────────
    // Note: Almunajem Foods (2282) excluded — ticker conflict with Naqi Water above
    { symbol: '1111', ipoPrice: 105,    name: 'Saudi Tadawul Group' },
    { symbol: '4081', ipoPrice: 34,     name: 'Nayifat Finance' },
    { symbol: '4071', ipoPrice: 100,    name: 'Arabian Contracting Services (Al Arabia)' },
    { symbol: '7202', ipoPrice: 151,    name: 'stc solutions' },
    { symbol: '2082', ipoPrice: 56,     name: 'ACWA Power' },
    { symbol: '2281', ipoPrice: 67,     name: 'Tanmiah Food' },
    { symbol: '2081', ipoPrice: 72,     name: 'Al Khorayef Water & Power' },
    { symbol: '4261', ipoPrice: 40,     name: 'Theeb Rent a Car' },

    // ── 2020 TASI ────────────────────────────────────────────────
    { symbol: '4013', ipoPrice: 50,     name: 'Dr. Sulaiman Al Habib' },
    { symbol: '1182', ipoPrice: 16,     name: 'Amlak International' },
    { symbol: '4161', ipoPrice: 96,     name: 'BinDawood Holding' },
];

// ---- Yahoo Finance price + P/E fetch ----
// Uses v7/finance/quote which returns regularMarketPrice + trailingPE in one call.

async function fetchYahooQuote(
    symbol: string
): Promise<{ price: number | null; peRatio: number | null; currency: string }> {
    const ticker = `${symbol}.SR`;
    const url =
        `https://query1.finance.yahoo.com/v7/finance/quote` +
        `?symbols=${encodeURIComponent(ticker)}&fields=regularMarketPrice,trailingPE,currency`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/121.0.0.0 Safari/537.36',
                Accept: 'application/json',
            },
            signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
            console.warn(`[price-updater] ${ticker}: HTTP ${res.status}`);
            return { price: null, peRatio: null, currency: 'SAR' };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await res.json();
        const result = data?.quoteResponse?.result?.[0];

        if (!result?.regularMarketPrice) {
            console.warn(`[price-updater] ${ticker}: no regularMarketPrice in response`);
            return { price: null, peRatio: null, currency: result?.currency ?? 'SAR' };
        }

        // trailingPE can be negative (unprofitable) or absent — normalise to null if invalid
        const rawPE = result?.trailingPE;
        const peRatio =
            typeof rawPE === 'number' && rawPE > 0 && rawPE < 10_000
                ? Math.round(rawPE * 10) / 10
                : null;

        return {
            price: result.regularMarketPrice as number,
            peRatio,
            currency: (result.currency as string) ?? 'SAR',
        };
    } catch (err) {
        console.error(`[price-updater] ${ticker}: fetch error`, err);
        return { price: null, peRatio: null, currency: 'SAR' };
    }
}

// ---- Core update logic ----

async function updatePrices(env: Env): Promise<PriceCache> {
    const entries: PriceEntry[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const stock of IPO_STOCKS) {
        const { price, peRatio, currency } = await fetchYahooQuote(stock.symbol);

        // Return % only computable when both current price and IPO price are known
        const returnPct =
            price !== null && stock.ipoPrice !== null
                ? Math.round(((price - stock.ipoPrice) / stock.ipoPrice) * 1000) / 10
                : null;

        if (price !== null) successCount++;
        else failCount++;

        entries.push({
            symbol: stock.symbol,
            ticker: `${stock.symbol}.SR`,
            currentPrice: price,
            ipoPrice: stock.ipoPrice,
            returnPct,
            peRatio,
            currency,
            updatedAt: new Date().toISOString(),
        });

        // 300ms delay between requests — courteous to Yahoo Finance.
        // Cron Triggers have a 15-minute CPU limit, so 19 stocks × 300ms = ~5.7s is well within budget.
        await new Promise<void>((resolve) => setTimeout(resolve, 300));
    }

    const cache: PriceCache = {
        prices: entries,
        fetchedAt: new Date().toISOString(),
        successCount,
        failCount,
    };

    // Store in KV with 48h TTL (fresh cron runs every day)
    await env.IPO_PRICES.put('latest', JSON.stringify(cache), {
        expirationTtl: 172_800,
    });

    console.log(
        `[price-updater] Updated ${successCount}/${IPO_STOCKS.length} prices` +
            (failCount > 0 ? ` (${failCount} failed)` : '')
    );

    return cache;
}

// ---- CORS headers ----

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
};

function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            ...CORS_HEADERS,
            ...extra,
        },
    });
}

// ---- Worker export ----

export default {
    /**
     * HTTP handler — serves cached price data to the IPO table React component.
     *
     * Routes:
     *   GET /prices  — returns the latest PriceCache JSON
     *   GET /health  — liveness check
     */
    async fetch(request: Request, env: Env): Promise<Response> {
        const { pathname } = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (pathname === '/prices' || pathname === '/') {
            const cached = await env.IPO_PRICES.get('latest', 'text');

            if (cached) {
                return new Response(cached, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                        'X-Cache': 'HIT',
                        ...CORS_HEADERS,
                    },
                });
            }

            // KV is empty (first run or TTL expired) — fetch now
            const data = await updatePrices(env);
            return jsonResponse(data, 200, { 'X-Cache': 'MISS' });
        }

        if (pathname === '/health') {
            const cached = await env.IPO_PRICES.get('latest', 'text');
            const cache: PriceCache | null = cached ? JSON.parse(cached) : null;
            return jsonResponse({
                status: 'ok',
                lastFetch: cache?.fetchedAt ?? null,
                successCount: cache?.successCount ?? null,
                failCount: cache?.failCount ?? null,
                stockCount: IPO_STOCKS.length,
                ts: new Date().toISOString(),
            });
        }

        return new Response('Not Found', { status: 404 });
    },

    /**
     * Cron handler — fires daily at 12:10 UTC (3:10 pm Riyadh time,
     * ~10 minutes after Tadawul market close at 3:00 pm AST / 12:00 UTC).
     *
     * Saudi Tadawul trades Sunday–Thursday.
     * The cron runs every day so all weekday closes are captured.
     */
    async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        ctx.waitUntil(
            (async () => {
                const cache = await updatePrices(env);

                // Trigger Cloudflare Pages rebuild so the static site rebuilds
                // with the latest prices baked into the initial HTML
                if (env.PAGES_DEPLOY_HOOK) {
                    try {
                        const hookRes = await fetch(env.PAGES_DEPLOY_HOOK, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        console.log(
                            `[price-updater] Pages rebuild triggered: HTTP ${hookRes.status}`
                        );
                    } catch (err) {
                        console.error('[price-updater] Failed to trigger Pages rebuild:', err);
                    }
                } else {
                    console.warn(
                        '[price-updater] PAGES_DEPLOY_HOOK secret not set — skipping rebuild trigger'
                    );
                }

                console.log(
                    `[price-updater] Cron complete: ${cache.successCount} prices updated, ` +
                        `fetched at ${cache.fetchedAt}`
                );
            })()
        );
    },
};
