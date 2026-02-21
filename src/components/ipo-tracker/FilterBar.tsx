import React from 'react';
import { Search } from 'lucide-react';
import type { MarketFilter, YearFilter } from './types';

interface FilterBarProps {
    years: number[];
    selectedYear: YearFilter;
    onYearChange: (year: YearFilter) => void;
    marketFilter: MarketFilter;
    onMarketChange: (market: MarketFilter) => void;
    sectorFilter: string;
    onSectorChange: (sector: string) => void;
    sectors: string[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    totalResults: number;
}

export default function FilterBar({
    years,
    selectedYear,
    onYearChange,
    marketFilter,
    onMarketChange,
    sectorFilter,
    onSectorChange,
    sectors,
    searchQuery,
    onSearchChange,
    totalResults,
}: FilterBarProps) {
    return (
        <div style={{ marginBottom: '1.25rem' }}>
            {/* Year filter tabs */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.375rem',
                marginBottom: '0.875rem',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: '0.75rem', color: '#888', marginRight: '0.25rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Year</span>
                {(['all', ...years] as Array<YearFilter>).map((year) => {
                    const isActive = selectedYear === year;
                    return (
                        <button
                            key={String(year)}
                            onClick={() => onYearChange(year)}
                            style={{
                                padding: '0.3rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                fontFamily: 'var(--font-body)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                border: isActive ? '1.5px solid #7A8B72' : '1.5px solid #d1d5db',
                                background: isActive ? '#7A8B72' : 'white',
                                color: isActive ? 'white' : '#555',
                                lineHeight: 1.2,
                            }}
                        >
                            {year === 'all' ? 'All' : String(year)}
                        </button>
                    );
                })}
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    color: '#888',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                }}>
                    {totalResults} {totalResults === 1 ? 'IPO' : 'IPOs'}
                </span>
            </div>

            {/* Search + dropdowns row */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
                    <Search
                        size={14}
                        style={{
                            position: 'absolute',
                            left: '0.625rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af',
                            pointerEvents: 'none',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search company, ticker, sector…"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '2rem',
                            paddingRight: '0.75rem',
                            paddingTop: '0.4rem',
                            paddingBottom: '0.4rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            fontSize: '0.825rem',
                            fontFamily: 'var(--font-body)',
                            outline: 'none',
                            color: '#333',
                            background: 'white',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Market dropdown */}
                <select
                    value={marketFilter}
                    onChange={(e) => onMarketChange(e.target.value as MarketFilter)}
                    style={{
                        padding: '0.4rem 0.6rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.825rem',
                        fontFamily: 'var(--font-body)',
                        color: '#333',
                        background: 'white',
                        outline: 'none',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                    }}
                >
                    <option value="all">All Markets</option>
                    <option value="TASI">TASI Main</option>
                    <option value="Nomu">Nomu Parallel</option>
                </select>

                {/* Sector dropdown */}
                <select
                    value={sectorFilter}
                    onChange={(e) => onSectorChange(e.target.value)}
                    style={{
                        padding: '0.4rem 0.6rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.825rem',
                        fontFamily: 'var(--font-body)',
                        color: '#333',
                        background: 'white',
                        outline: 'none',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                    }}
                >
                    <option value="all">All Sectors</option>
                    {sectors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
