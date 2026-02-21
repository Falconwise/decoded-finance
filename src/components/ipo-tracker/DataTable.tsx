import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import type { IPORecord } from '../../data/ipo-data';
import type { LivePriceMap, PriceStatus } from './types';

interface DataTableProps {
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

function MarketBadge({ market }: { market: string }) {
    const isTasi = market === 'TASI';
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.15rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: isTasi ? '#e5e9e3' : '#fef3c7',
            color: isTasi ? '#54634e' : '#92400e',
            fontFamily: 'var(--font-body)',
        }}>
            {market}
        </span>
    );
}

export default function DataTable({
    data,
    livePrices,
    priceStatus,
    availableCaseStudySlugs,
    pageSize = 25,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const isLive = priceStatus === 'ok';

    // Row data with live price merged
    const tableData = useMemo(() => data.map((ipo, idx) => {
        const live = livePrices[ipo.symbol];
        return {
            ...ipo,
            _idx: idx + 1,
            _currentPrice: live?.currentPrice ?? null,
            _returnPct: live?.returnPct ?? null,
            _peRatio: live?.peRatio ?? null,
            _hasStudy: availableCaseStudySlugs.includes(ipo.id),
        };
    }), [data, livePrices, availableCaseStudySlugs]);

    type Row = (typeof tableData)[0];

    const columns = useMemo<ColumnDef<Row>[]>(() => [
        {
            id: 'rank',
            header: '#',
            size: 40,
            enableSorting: false,
            cell: ({ row }) => (
                <span style={{ color: '#bbb', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {row.index + 1}
                </span>
            ),
        },
        {
            id: 'company',
            header: 'Company',
            accessorKey: 'company_name',
            enableSorting: true,
            cell: ({ row }) => {
                const ipo = row.original;
                return (
                    <div>
                        {ipo._hasStudy ? (
                            <a
                                href={`/case-studies/${ipo.id}`}
                                style={{ fontWeight: 600, fontSize: '0.875rem', color: '#B86E4B', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
                            >
                                {ipo.company_name}
                            </a>
                        ) : (
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#333', fontFamily: 'var(--font-body)' }}>
                                {ipo.company_name}
                            </span>
                        )}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                            {ipo.symbol}
                            {ipo.listing_type === 'direct_listing' && (
                                <span style={{
                                    marginLeft: '0.35rem',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.6rem',
                                    padding: '0.1rem 0.3rem',
                                    borderRadius: '0.2rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.04em',
                                }}>DIRECT</span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'market',
            header: 'Market',
            accessorKey: 'market',
            enableSorting: true,
            size: 80,
            cell: ({ row }) => <MarketBadge market={row.original.market} />,
        },
        {
            id: 'listed',
            header: 'Listed',
            accessorKey: 'listing_date',
            enableSorting: true,
            size: 90,
            cell: ({ row }) => (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666' }}>
                    {formatDate(row.original.listing_date)}
                </span>
            ),
        },
        {
            id: 'ipo_price',
            header: 'IPO Price',
            accessorFn: (row) => row.offer_price,
            enableSorting: true,
            size: 90,
            cell: ({ row }) => {
                const price = row.original.offer_price;
                if (price === null) {
                    return (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#bbb' }}
                              title="Direct listing — no IPO offer price">N/A</span>
                    );
                }
                return (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#333' }}>
                        {price.toFixed(2)}
                    </span>
                );
            },
        },
        {
            id: 'current_price',
            header: 'Price (Live)',
            accessorFn: (row) => row._currentPrice,
            enableSorting: true,
            size: 100,
            cell: ({ row }) => {
                const price = row.original._currentPrice;
                if (price === null) {
                    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#bbb' }}>—</span>;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                            {price.toFixed(2)}
                        </span>
                        {isLive && (
                            <span style={{
                                fontSize: '0.6rem', fontWeight: 700, color: '#16a34a',
                                background: '#dcfce7', padding: '0.05rem 0.3rem',
                                borderRadius: '0.2rem', letterSpacing: '0.05em',
                                fontFamily: 'var(--font-body)',
                            }}>LIVE</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'pe_ratio',
            header: 'P/E',
            accessorFn: (row) => row._peRatio,
            enableSorting: true,
            size: 70,
            cell: ({ row }) => {
                const pe = row.original._peRatio;
                if (pe === null) {
                    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#bbb' }}>—</span>;
                }
                return (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#333' }}>
                        {pe.toFixed(1)}x
                    </span>
                );
            },
        },
        {
            id: 'return',
            header: 'Return',
            accessorFn: (row) => row._returnPct,
            enableSorting: true,
            size: 90,
            sortUndefined: 'last',
            cell: ({ row }) => {
                const ret = row.original._returnPct;
                if (ret === null) {
                    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#bbb' }}>—</span>;
                }
                const positive = ret >= 0;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: positive ? '#16a34a' : '#dc2626',
                        }}>
                            {positive ? '+' : ''}{ret.toFixed(1)}%
                        </span>
                        {isLive && <span style={{ fontSize: '0.75rem', color: positive ? '#16a34a' : '#dc2626' }}>↻</span>}
                    </div>
                );
            },
        },
    ], [isLive]);

    const table = useReactTable({
        data: tableData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize } },
    });

    const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
    const totalRows = data.length;
    const startRow = pageIndex * currentPageSize + 1;
    const endRow = Math.min((pageIndex + 1) * currentPageSize, totalRows);

    return (
        <div className="ipo-table-desktop">
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem',
                }}>
                    <thead>
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>
                                {hg.headers.map(header => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();
                                    return (
                                        <th
                                            key={header.id}
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                            style={{
                                                padding: '0.625rem 0.75rem',
                                                textAlign: 'left',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                color: '#7A8B72',
                                                background: '#f9fafb',
                                                borderBottom: '2px solid #e5e7eb',
                                                whiteSpace: 'nowrap',
                                                cursor: canSort ? 'pointer' : 'default',
                                                userSelect: 'none',
                                                fontFamily: 'var(--font-body)',
                                                width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                {canSort && (
                                                    <span style={{ color: sorted ? '#7A8B72' : '#d1d5db', fontSize: '0.6rem' }}>
                                                        {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '⇅'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row, rowIdx) => (
                            <tr
                                key={row.id}
                                style={{
                                    background: rowIdx % 2 === 0 ? 'white' : '#fafaf9',
                                    borderBottom: '1px solid #f3f4f6',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ee')}
                                onMouseLeave={e => (e.currentTarget.style.background = rowIdx % 2 === 0 ? 'white' : '#fafaf9')}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        style={{
                                            padding: '0.75rem 0.75rem',
                                            verticalAlign: 'middle',
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

            {/* Pagination controls */}
            {totalRows > currentPageSize && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    padding: '0.5rem 0',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                }}>
                    <span style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'var(--font-body)' }}>
                        Showing {startRow}–{endRow} of {totalRows}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            style={{
                                padding: '0.3rem 0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                background: 'white',
                                cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                                color: table.getCanPreviousPage() ? '#333' : '#bbb',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            style={{
                                padding: '0.3rem 0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                background: 'white',
                                cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                                color: table.getCanNextPage() ? '#333' : '#bbb',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
