import { useState, useMemo } from 'react';
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

interface Props {
    data: IPORecord[];
    sectors: string[];
    availableCaseStudySlugs: string[];
}

export default function IPOTable({ data, sectors, availableCaseStudySlugs }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');

    const filteredData = useMemo(() => {
        if (sectorFilter === 'all') return data;
        return data.filter((ipo) => ipo.sector === sectorFilter);
    }, [data, sectorFilter]);

    const hasPublishedCaseStudy = (ipo: IPORecord) =>
        ipo.has_case_study && availableCaseStudySlugs.includes(ipo.id);

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
                accessorKey: 'market_cap_display',
                header: 'Market Cap',
                cell: ({ getValue }) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{getValue() as string}</span>
                ),
            },
            {
                accessorKey: 'return_from_ipo',
                header: 'Return',
                cell: ({ getValue }) => {
                    const val = getValue() as number;
                    const color = val > 0 ? '#16a34a' : val < 0 ? '#dc2626' : '#888';
                    const sign = val > 0 ? '+' : '';
                    return (
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>
                            {sign}{val.toFixed(1)}%
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
        [availableCaseStudySlugs]
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

    return (
        <div>
            {/* Filter Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
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
                    const returnColor = ipo.return_from_ipo > 0 ? '#16a34a' : ipo.return_from_ipo < 0 ? '#dc2626' : '#888';
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
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: returnColor, fontSize: '0.9rem' }}>
                                    {ipo.return_from_ipo > 0 ? '+' : ''}{ipo.return_from_ipo.toFixed(1)}%
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                                <div>
                                    <span style={{ color: '#888' }}>IPO Price: </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SAR {ipo.offer_price.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>Market Cap: </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{ipo.market_cap_display}</span>
                                </div>
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
