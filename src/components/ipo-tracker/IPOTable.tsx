import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { IPORecord } from '../../data/ipo-data';
import type { PriceCache, PriceStatus, YearFilter, MarketFilter, LivePriceMap } from './types';
import FilterBar from './FilterBar';
import SummaryStatsBar from './SummaryStatsBar';
import DataTable from './DataTable';
import MobileCardList from './MobileCardList';

const WORKER_URL =
    typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env &&
    ((import.meta as Record<string, unknown>).env as Record<string, string>).PUBLIC_PRICE_WORKER_URL
        ? ((import.meta as Record<string, unknown>).env as Record<string, string>).PUBLIC_PRICE_WORKER_URL
        : 'https://decoded-finance-price-updater.a-gaffarcfa.workers.dev/prices';

interface IPOTableProps {
    data: IPORecord[];
    sectors: string[];
    years: number[];
    availableCaseStudySlugs: string[];
}

export default function IPOTable({ data, sectors, years, availableCaseStudySlugs }: IPOTableProps) {
    // ── Filter state ─────────────────────────────────────────────
    const [selectedYear, setSelectedYear] = useState<YearFilter>('all');
    const [marketFilter, setMarketFilter] = useState<MarketFilter>('all');
    const [sectorFilter, setSectorFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => setDebouncedSearch(searchQuery), 250);
        return () => clearTimeout(searchTimeout.current);
    }, [searchQuery]);

    // ── Live prices ──────────────────────────────────────────────
    const [priceStatus, setPriceStatus] = useState<PriceStatus>('idle');
    const [livePrices, setLivePrices] = useState<LivePriceMap>({});
    const [priceFetchedAt, setPriceFetchedAt] = useState<string | null>(null);

    useEffect(() => {
        setPriceStatus('loading');
        fetch(WORKER_URL)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<PriceCache>;
            })
            .then(cache => {
                const map: LivePriceMap = {};
                for (const entry of cache.prices) {
                    map[entry.symbol] = entry;
                }
                setLivePrices(map);
                setPriceFetchedAt(cache.fetchedAt);
                setPriceStatus('ok');
            })
            .catch(() => setPriceStatus('error'));
    }, []);

    // ── Filtered dataset ─────────────────────────────────────────
    const filteredData = useMemo(() => {
        const q = debouncedSearch.toLowerCase().trim();
        return data.filter(ipo => {
            if (selectedYear !== 'all' && ipo.listing_year !== selectedYear) return false;
            if (marketFilter !== 'all' && ipo.market !== marketFilter) return false;
            if (sectorFilter !== 'all' && ipo.sector !== sectorFilter) return false;
            if (q) {
                const haystack = [ipo.company_name, ipo.company_name_ar, ipo.symbol, ipo.sector]
                    .join(' ').toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [data, selectedYear, marketFilter, sectorFilter, debouncedSearch]);

    // ── Live-price status banner ─────────────────────────────────
    const renderStatusBar = () => {
        if (priceStatus === 'loading') {
            return (
                <div style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: '1rem', fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-body)' }}>
                    ↻ Fetching live prices from Yahoo Finance…
                </div>
            );
        }
        if (priceStatus === 'ok' && priceFetchedAt) {
            const when = new Date(priceFetchedAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
            });
            return (
                <div style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '1rem', fontSize: '0.75rem', color: '#16a34a', fontFamily: 'var(--font-body)' }}>
                    ✓ Live prices via Yahoo Finance · updated {when}
                </div>
            );
        }
        if (priceStatus === 'error') {
            return (
                <div style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1rem', fontSize: '0.75rem', color: '#dc2626', fontFamily: 'var(--font-body)' }}>
                    ⚠ Could not fetch live prices — prices unavailable
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            {renderStatusBar()}

            <SummaryStatsBar
                filteredData={filteredData}
                livePrices={livePrices}
                priceStatus={priceStatus}
            />

            <FilterBar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                marketFilter={marketFilter}
                onMarketChange={setMarketFilter}
                sectorFilter={sectorFilter}
                onSectorChange={setSectorFilter}
                sectors={sectors}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalResults={filteredData.length}
            />

            <DataTable
                data={filteredData}
                livePrices={livePrices}
                priceStatus={priceStatus}
                availableCaseStudySlugs={availableCaseStudySlugs}
                pageSize={25}
            />

            <MobileCardList
                data={filteredData}
                livePrices={livePrices}
                priceStatus={priceStatus}
                availableCaseStudySlugs={availableCaseStudySlugs}
                pageSize={15}
            />
        </div>
    );
}
