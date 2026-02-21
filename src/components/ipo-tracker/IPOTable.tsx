import { useState, useMemo, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import type { IPORecord } from '../../data/ipo-data';

// ---- Live price worker ----
// Set PUBLIC_PRICE_WORKER_URL in your Cloudflare Pages environment variables
// (or .env.local file) to the deployed Worker URL, e.g.:
//   PUBLIC_PRICE_WORKER_URL=https://decoded-finance-price-updater.YOUR_SUBDOMAIN.workers.dev
const PRICE_WORKER_URL: string = import.meta.env.PUBLIC_PRICE_WORKER_URL || '';

// ---- Types ----

interface LivePriceEntry {
    symbol: string;
    currentPrice: number | null;
    returnPct: number | null;
    updatedAt: string;
}

interface PriceCache {
    prices: LivePriceEntry[];
    fetchedAt: string;
}

// ---- Component props ----

interface Props {
    data: IPORecord[];
    sectors: string[];
    availableCaseStudySlugs: string[];
}

export default function IPOTable({ data, sectors, availableCaseStudySlugs }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');

    // Live price state
    const [livePrices, setLivePrices] = useState<Record<string, LivePriceEntry>>({});
    const [pricesStatus, setPricesStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
    const [pricesFetchedAt, setPricesFetchedAt] = useState<string | null>(null);

    // Fetch live prices from Cloudflare Worker on mount
    useEffect(() => {
        if (!PRICE_WORKER_URL) return;

        setPricesStatus('loading');
        fetch(`${PRICE_WORKER_URL}/prices`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<PriceCache>;
            })
            .then((cache) => {
                const map: Record<string, LivePriceEntry> = {};
                for (const entry of cache.prices) {
                    if (entry.currentPrice !== null) map[entry.symbol] = entry;
                }
                setLivePrices(map);
                setPricesFetchedAt(cache.fetchedAt);
                setPricesStatus('ok');
            })
            .catch(() => {
                setPricesStatus('error');
            });
    }, []);

    const filteredData = useMemo(() => {
        if (sectorFilter === 'all') return data;
        return data.filter((ipo) => ipo.sector === sectorFilter);
    }, [data, sectorFilter]);

    const hasPublishedCaseStudy = (ipo: IPORecord) =>
        ipo.has_case_study && availableCaseStudySlugs.includes(ipo.id);

    // Resolve the best available return % for a row
    const getLiveReturn = (symbol: string, staticReturn: number): number =>
        livePrices[symbol]?.returnPct ?? staticReturn;

    const columns = useMemo<ColumnDef<IPORecord>[]>(
        () => [
            {
                accessorKey: 'company_name',
                header: 'Company',
                cell: ({ row }) => (
                    <div>
                        <div style={{ fontWeight: 700 }}>{row.original.company_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                            {row.original.symbol} · {row.original.sector}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'sector',
                header: 'Sector',
                cell: ({ getValue }) => (
                    <span className="ipo-badge">{getValue() as string}</span>
                ),
            },
            {
                accessorKey: 'listing_date',
                header: 'Listed',
                cell: ({ getValue }) => {
                    const d = new Date((getValue() as string) + 'T00:00:00');
                    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                },
            },
            {
                accessorKey: 'offer_price',
                header: 'IPO Price',
                cell: ({ getValue }) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                        SAR {(getValue() as number).toFixed(2)}
                    </span>
                ),
            },
            {
                id: 'current_price',
                header: 'Current Price',
                enableSorting: false,
                cell: ({ row }) => {
                    const live = livePrices[row.original.symbol];
                    if (pricesStatus === 'loading') {
                        return (
                            <span style={{ color: '#aaa', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                …
                            </span>
                        );
                    }
                    if (!live?.currentPrice) {
                        return <span style={{ color: '#bbb', fontSize: '0.75rem' }}>—</span>;
                    }
                    return (
                        <span style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            SAR {live.currentPrice.toFixed(2)}
                            <span style={{
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                letterSpacing: '0.3px',
                                color: '#16a34a',
                                background: '#dcfce7',
                                padding: '1px 4px',
                                borderRadius: '3px',
                            }}>
                                LIVE
                            </span>
                        </span>
                    );
                },
            },
            {
                accessorKey: 'market_cap_display',
                header: 'Market Cap',
                cell: ({ getValue }) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{getValue() as string}</span>
                ),
            },
            {
                accessorKey: 'return_from_ipo',
                header: 'Return',
                sortingFn: (rowA, rowB) => {
                    const a = getLiveReturn(rowA.original.symbol, rowA.original.return_from_ipo);
                    const b = getLiveReturn(rowB.original.symbol, rowB.original.return_from_ipo);
                    return a - b;
                },
                cell: ({ getValue, row }) => {
                    const live = livePrices[row.original.symbol];
                    const val = live?.returnPct ?? (getValue() as number);
                    const isLive = !!live?.returnPct;
                    const color = val > 0 ? '#16a34a' : val < 0 ? '#dc2626' : '#888';
                    const sign = val > 0 ? '+' : '';
                    return (
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            {sign}{val.toFixed(1)}%
                            {isLive && (
                                <span title="Live price" style={{ fontSize: '0.65rem', opacity: 0.65 }}>↻</span>
                            )}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'performance_badge',
                header: 'Status',
                cell: ({ getValue }) => {
                    const badge = getValue() as string;
                    let style: React.CSSProperties = {
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                    };
                    if (badge === 'Top Performer' || badge === 'Strong Performer') {
                        style = { ...style, backgroundColor: '#dcfce7', color: '#166534' };
                    } else if (badge === 'Solid' || badge === 'Positive') {
                        style = { ...style, backgroundColor: '#e5e9e3', color: '#54634e' };
                    } else if (badge === 'Neutral') {
                        style = { ...style, backgroundColor: '#f3f4f6', color: '#6b7280' };
                    } else {
                        style = { ...style, backgroundColor: '#fee2e2', color: '#991b1b' };
                    }
                    return <span style={style}>{badge}</span>;
                },
            },
            {
                accessorKey: 'has_case_study',
                header: 'Analysis',
                cell: ({ row }) =>
                    hasPublishedCaseStudy(row.original) ? (
                        <a
                            href={`/case-studies/${row.original.id}`}
                            style={{
                                color: '#B86E4B',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                            }}
                        >
                            Read analysis →
                        </a>
                    ) : (
                        <span style={{ color: '#888', fontSize: '0.8rem' }}>Coming soon</span>
                    ),
                enableSorting: false,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [availableCaseStudySlugs, livePrices, pricesStatus]
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    // Format the "prices as of" timestamp for display
    const pricesAsOf = pricesFetchedAt
        ? new Date(pricesFetchedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
          })
        : null;

    return (
        <div>
            {/* Filter Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    style={{
                        flex: '1 1 200px',
                        padding: '10px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                    }}
                />
                <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        backgroundColor: '#fff',
                    }}
                >
                    <option value="all">All Sectors</option>
                    {sectors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Live price status bar */}
            {PRICE_WORKER_URL && (
                <div style={{
                    marginBottom: '12px',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    ...(pricesStatus === 'ok'
                        ? { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
                        : pricesStatus === 'error'
                        ? { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }
                        : { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }),
                }}>
                    {pricesStatus === 'loading' && (
                        <>
                            <span style={{ fontSize: '0.7rem' }}>⏳</span>
                            Fetching live prices from Yahoo Finance…
                        </>
                    )}
                    {pricesStatus === 'ok' && (
                        <>
                            <span style={{ fontSize: '0.7rem' }}>●</span>
                            Live prices via Yahoo Finance
                            {pricesAsOf && (
                                <span style={{ opacity: 0.7 }}>· as of {pricesAsOf}</span>
                            )}
                        </>
                    )}
                    {pricesStatus === 'error' && (
                        <>
                            <span style={{ fontSize: '0.7rem' }}>⚠</span>
                            Could not fetch live prices — showing last known data
                        </>
                    )}
                </div>
            )}

            {/* Desktop Table */}
            <div className="ipo-table-desktop">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{
                                                backgroundColor: '#7A8B72',
                                                color: '#fff',
                                                padding: '12px 14px',
                                                textAlign: 'left',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === 'asc' ? ' ↑' : ''}
                                            {header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row, i) => (
                                <tr
                                    key={row.id}
                                    style={{
                                        backgroundColor: i % 2 === 0 ? '#fff' : '#F4F1EA',
                                        transition: 'background-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e9e3')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#fff' : '#F4F1EA')}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: '1px solid #eee',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="ipo-table-mobile">
                {table.getRowModel().rows.map((row) => {
                    const ipo = row.original;
                    const live = livePrices[ipo.symbol];
                    const returnVal = live?.returnPct ?? ipo.return_from_ipo;
                    const returnColor = returnVal > 0 ? '#16a34a' : returnVal < 0 ? '#dc2626' : '#888';
                    return (
                        <div
                            key={row.id}
                            style={{
                                background: '#fff',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                border: '1px solid #eee',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ipo.company_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                                        {ipo.symbol} · {ipo.sector}
                                    </div>
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: returnColor, fontSize: '0.9rem', textAlign: 'right' }}>
                                    {returnVal > 0 ? '+' : ''}{returnVal.toFixed(1)}%
                                    {live?.returnPct != null && (
                                        <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 400, color: '#16a34a', opacity: 0.8 }}>live ↻</span>
                                    )}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                                <div>
                                    <span style={{ color: '#888' }}>IPO Price: </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SAR {ipo.offer_price.toFixed(2)}</span>
                                </div>
                                {live?.currentPrice != null ? (
                                    <div>
                                        <span style={{ color: '#888' }}>Current: </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SAR {live.currentPrice.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <div>
                                        <span style={{ color: '#888' }}>Market Cap: </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{ipo.market_cap_display}</span>
                                    </div>
                                )}
                            </div>
                            {hasPublishedCaseStudy(ipo) ? (
                                <a href={`/case-studies/${ipo.id}`} style={{ display: 'inline-block', marginTop: '8px', color: '#B86E4B', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                                    Read Analysis →
                                </a>
                            ) : (
                                <span style={{ display: 'inline-block', marginTop: '8px', color: '#888', fontWeight: 600, fontSize: '0.8rem' }}>
                                    Analysis: Coming soon
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
        .ipo-table-mobile { display: none; }
        .ipo-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          background: #e5e9e3;
          color: #54634e;
        }
        @media (max-width: 768px) {
          .ipo-table-desktop { display: none; }
          .ipo-table-mobile { display: block; }
        }
      `}</style>
        </div>
    );
}
