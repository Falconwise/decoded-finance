import React, { useState } from 'react';
import type { IPORecord } from '../../data/ipo-data';
import type { LivePriceMap, PriceStatus } from './types';

interface MobileCardListProps {
    data: IPORecord[];
    livePrices: LivePriceMap;
    priceStatus: PriceStatus;
    availableCaseStudySlugs: string[];
    pageSize?: number;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function MobileCardList({
    data,
    livePrices,
    priceStatus,
    availableCaseStudySlugs,
    pageSize = 15,
}: MobileCardListProps) {
    const [page, setPage] = useState(0);
    const isLive = priceStatus === 'ok';
    const totalPages = Math.ceil(data.length / pageSize);
    const visible = data.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="ipo-table-mobile">
            {visible.map((ipo) => {
                const live = livePrices[ipo.symbol];
                const currentPrice = live?.currentPrice ?? null;
                const returnPct = live?.returnPct ?? null;
                const peRatio = live?.peRatio ?? null;
                const positive = returnPct !== null ? returnPct >= 0 : null;
                const hasStudy = availableCaseStudySlugs.includes(ipo.id);

                return (
                    <div key={ipo.id} className="ipo-mobile-card">
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                {hasStudy ? (
                                    <a href={`/case-studies/${ipo.id}`} style={{ fontWeight: 700, color: '#B86E4B', fontSize: '0.95rem', textDecoration: 'none', fontFamily: 'var(--font-body)', display: 'block', marginBottom: '0.1rem' }}>
                                        {ipo.company_name}
                                    </a>
                                ) : (
                                    <div style={{ fontWeight: 700, color: '#333', fontSize: '0.95rem', fontFamily: 'var(--font-body)', marginBottom: '0.1rem' }}>
                                        {ipo.company_name}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af' }}>{ipo.symbol}</span>
                                    <span style={{
                                        fontSize: '0.65rem', fontWeight: 600,
                                        padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
                                        background: ipo.market === 'TASI' ? '#e5e9e3' : '#fef3c7',
                                        color: ipo.market === 'TASI' ? '#54634e' : '#92400e',
                                        fontFamily: 'var(--font-body)',
                                    }}>{ipo.market}</span>
                                    {ipo.listing_type === 'direct_listing' && (
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 600,
                                            padding: '0.1rem 0.3rem', borderRadius: '0.2rem',
                                            background: '#fef3c7', color: '#92400e',
                                            fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                                        }}>DIRECT</span>
                                    )}
                                </div>
                            </div>
                            {/* Return */}
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
                                {returnPct !== null ? (
                                    <>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            color: positive ? '#16a34a' : '#dc2626',
                                        }}>
                                            {positive ? '+' : ''}{returnPct.toFixed(1)}%
                                        </div>
                                        {isLive && <div style={{ fontSize: '0.65rem', color: positive ? '#16a34a' : '#dc2626', textAlign: 'right' }}>↻ live</div>}
                                    </>
                                ) : (
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#bbb' }}>—</div>
                                )}
                            </div>
                        </div>

                        {/* Data grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
                            <DataPoint label="IPO Price" value={ipo.offer_price !== null ? `SAR ${ipo.offer_price.toFixed(2)}` : 'N/A (Direct)'} />
                            <DataPoint label="Current" value={currentPrice !== null ? `SAR ${currentPrice.toFixed(2)}` : '—'} />
                            <DataPoint label="P/E" value={peRatio !== null ? `${peRatio.toFixed(1)}x` : '—'} />
                            <DataPoint label="Listed" value={formatDate(ipo.listing_date)} />
                            <DataPoint label="Sector" value={ipo.sector} />
                        </div>
                    </div>
                );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    gap: '0.5rem',
                }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-body)' }}>
                        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                padding: '0.35rem 0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                background: 'white',
                                cursor: page === 0 ? 'not-allowed' : 'pointer',
                                color: page === 0 ? '#bbb' : '#333',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-body)',
                            }}
                        >← Prev</button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            style={{
                                padding: '0.35rem 0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                background: 'white',
                                cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                                color: page === totalPages - 1 ? '#bbb' : '#333',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-body)',
                            }}
                        >Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DataPoint({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: '#333', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{value}</div>
        </div>
    );
}
