// ============================================================
// decoded.finance — Cloudflare Worker: IPO Price Updater
//
// Runs on a daily cron schedule, fetches current prices for
// all 19 IPO tracker stocks from Yahoo Finance (.SR tickers),
// calculates return % vs IPO price, stores in KV, and
// triggers a Cloudflare Pages rebuild.
//
// No API key required — uses Yahoo Finance public endpoints.
// ============================================================

export interface Env {
    /** KV namespace binding — stores latest price snapshot */
    IPO_PRICES: KVNamespace;
    /**
     * Cloudflare Pages deploy hook URL (set as a Worker secret).
     * Setup: npx wrangler secret put PAGES_DEPLOY_HOOK
     * Value:  Cloudflare Dashboard → Pages → Project → Settings
     *         → Builds & Deployments → Deploy Hooks → Create hook
     */
    PAGES_DEPLOY_HOOK?: string;
}

// ---- Types ----

interface PriceEntry {
    symbol: string;
    ticker: string;
    currentPrice: number | null;
    ipoPrice: number;
    returnPct: number | null;
    currency: string;
    updatedAt: string;
}

export interface PriceCache {
    prices: PriceEntry[];
    fetchedAt: string;
    successCount: number;
    failCount: number;
}

// ---- All 19 Saudi IPO stocks ----
// Tickers are constructed as `${symbol}.SR` for Yahoo Finance Tadawul feed

const IPO_STOCKS: Array<{ symbol: string; ipoPrice: number }> = [
    { symbol: '1111', ipoPrice: 112.48 },  // Saudi Tadawul Group
    { symbol: '4325', ipoPrice: 74.79 },   // Umm Al Qura Development
    { symbol: '2082', ipoPrice: 161.45 },  // ACWA Power
    { symbol: '4013', ipoPrice: 240.05 },  // Dr. Sulaiman Al Habib
    { symbol: '4264', ipoPrice: 80.00 },   // Flynas Airlines
    { symbol: '4161', ipoPrice: 108.52 },  // BinDawood Holding
    { symbol: '4323', ipoPrice: 11.54 },   // Theeb Rent a Car
    { symbol: '1262', ipoPrice: 11.36 },   // Al Khorayef Water & Power
    { symbol: '4338', ipoPrice: 7.71 },    // Alkhabeer Income Fund REIT
    { symbol: '4210', ipoPrice: 14.51 },   // Almasar Alshamil Education
    { symbol: '4140', ipoPrice: 9.77 },    // Nayifat Finance
    { symbol: '2281', ipoPrice: 14.44 },   // Almunajem Foods
    { symbol: '1321', ipoPrice: 20.29 },   // East Pipes Integrated
    { symbol: '4265', ipoPrice: 12.36 },   // Cherry Trading
    { symbol: '2310', ipoPrice: 42.16 },   // stc solutions
    { symbol: '4330', ipoPrice: 7.93 },    // Amlak International
    { symbol: '2370', ipoPrice: 15.40 },   // Elm Company
    { symbol: '4281', ipoPrice: 15.44 },   // Tanmiah Food
    { symbol: '1217', ipoPrice: 23.64 },   // Arabian Contracting Services
];

// ---- Yahoo Finance price fetch ----

async function fetchYahooPrice(
    symbol: string
): Promise<{ price: number | null; currency: string }> {
    const ticker = `${symbol}.SR`;
    // Use query2 as a fallback host; query1 is preferred
    const url =
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}` +
        `?interval=1d&range=1d&includePrePost=false`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/121.0.0.0 Safari/537.36',
                Accept: 'application/json',
            },
            // 10-second timeout
            signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
            console.warn(`[price-updater] ${ticker}: HTTP ${res.status}`);
            return { price: null, currency: 'SAR' };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;

        if (!meta?.regularMarketPrice) {
            console.warn(`[price-updater] ${ticker}: no regularMarketPrice in response`);
            return { price: null, currency: meta?.currency ?? 'SAR' };
        }

        return {
            price: meta.regularMarketPrice as number,
            currency: (meta.currency as string) ?? 'SAR',
        };
    } catch (err) {
        console.error(`[price-updater] ${ticker}: fetch error`, err);
        return { price: null, currency: 'SAR' };
    }
}

// ---- Core update logic ----

async function updatePrices(env: Env): Promise<PriceCache> {
    const entries: PriceEntry[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const stock of IPO_STOCKS) {
        const { price, currency } = await fetchYahooPrice(stock.symbol);

        const returnPct =
            price !== null
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
            currency,
            updatedAt: new Date().toISOString(),
        });

        // 300ms delay between requests — courteous to Yahoo Finance
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
     * The cron runs every day so weekday closes are always captured.
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
