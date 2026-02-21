import React, { useMemo } from 'react';
import type { IPORecord } from '../../data/ipo-data';
import type { LivePriceMap, PriceStatus } from './types';

interface SummaryStatsBarProps {
    filteredData: IPORecord[];
    livePrices: LivePriceMap;
    priceStatus: PriceStatus;
}

function getReturn(ipo: IPORecord, livePrices: LivePriceMap): number | null {
    const live = livePrices[ipo.symbol];
    if (live?.returnPct != null) return live.returnPct;
    return null;
}

export default function SummaryStatsBar({ filteredData, livePrices, priceStatus }: SummaryStatsBarProps) {
    const stats = useMemo(() => {
        const isLive = priceStatus === 'ok';
        const returnsAvailable = filteredData
            .map(ipo => getReturn(ipo, livePrices))
            .filter((r): r is number => r !== null);

        const avgReturn = returnsAvailable.length > 0
            ? returnsAvailable.reduce((a, b) => a + b, 0) / returnsAvailable.length
            : null;

        let bestReturn: number | null = null;
        let bestCompany = '';
        let worstReturn: number | null = null;
        let worstCompany = '';

        for (const ipo of filteredData) {
            const r = getReturn(ipo, livePrices);
            if (r === null) continue;
            if (bestReturn === null || r > bestReturn) { bestReturn = r; bestCompany = ipo.company_name; }
            if (worstReturn === null || r < worstReturn) { worstReturn = r; worstCompany = ipo.company_name; }
        }

        const tasiCount = filteredData.filter(i => i.market === 'TASI').length;
        const nomuCount = filteredData.filter(i => i.market === 'Nomu').length;

        return { avgReturn, bestReturn, bestCompany, worstReturn, worstCompany, tasiCount, nomuCount, isLive };
    }, [filteredData, livePrices, priceStatus]);

    const fmt = (n: number | null) => n === null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
    const color = (n: number | null) => n === null ? '#888' : n >= 0 ? '#16a34a' : '#dc2626';

    const Card = ({ label, value, valueColor, sub }: { label: string; value: string; valueColor?: string; sub?: string }) => (
        <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            padding: '0.875rem 1rem',
            flex: '1 1 120px',
            minWidth: 0,
        }}>
            <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: valueColor ?? '#333',
                lineHeight: 1.2,
                marginBottom: '0.2rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#bbb', fontFamily: 'var(--font-body)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        </div>
    );

    const liveTag = stats.isLive ? <span style={{ fontSize: '0.65rem', color: '#16a34a', marginLeft: '0.25rem' }}>↻ LIVE</span> : null;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Card
                label="IPOs"
                value={String(filteredData.length)}
                valueColor="#333"
            />
            <Card
                label="Avg Return"
                value={fmt(stats.avgReturn !== null ? Math.round(stats.avgReturn * 10) / 10 : null)}
                valueColor={color(stats.avgReturn)}
            />
            {stats.bestCompany && (
                <Card
                    label="Best"
                    value={fmt(stats.bestReturn)}
                    valueColor="#16a34a"
                    sub={stats.bestCompany.split(' ').slice(0, 2).join(' ')}
                />
            )}
            {stats.worstCompany && (
                <Card
                    label="Worst"
                    value={fmt(stats.worstReturn)}
                    valueColor="#dc2626"
                    sub={stats.worstCompany.split(' ').slice(0, 2).join(' ')}
                />
            )}
            <Card label="TASI" value={String(stats.tasiCount)} valueColor="#54634e" />
            <Card label="Nomu" value={String(stats.nomuCount)} valueColor="#92400e" />
        </div>
    );
}
