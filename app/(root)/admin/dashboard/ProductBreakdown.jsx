'use client'
import { useState, useEffect } from 'react'
import useFetch from '@/hooks/useFetch'
import { motion } from 'framer-motion'
import { BarChart2, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const FILTERS = [
    { key: 'today',      label: 'Today' },
    { key: 'yesterday',  label: 'Yesterday' },
    { key: 'this_week',  label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year',  label: 'This Year' },
]

const STATUS_COLS = [
    { key: 'new',        label: 'New',        cls: 'bg-amber-100 text-amber-700' },
    { key: 'confirmed',  label: 'Confirmed',  cls: 'bg-emerald-100 text-emerald-700' },
    { key: 'in_courier', label: 'In Courier', cls: 'bg-indigo-100 text-indigo-700' },
    { key: 'delivered',  label: 'Delivered',  cls: 'bg-teal-100 text-teal-700' },
    { key: 'cancelled',  label: 'Cancelled',  cls: 'bg-red-100 text-red-700' },
    { key: 'hold',       label: 'Hold',       cls: 'bg-blue-100 text-blue-700' },
    { key: 'returned',   label: 'Return',     cls: 'bg-orange-100 text-orange-700' },
]

export default function ProductBreakdown({ filter: externalFilter }) {
    const [filter, setFilter] = useState(externalFilter || 'this_month')
    useEffect(() => { if (externalFilter) setFilter(externalFilter) }, [externalFilter])
    const { data, loading, refetch } = useFetch(`/api/dashboard/admin/product-breakdown?filter=${filter}`)
    const rows = data?.data?.rows || []
    const filterLabel = FILTERS.find(f => f.key === filter)?.label || 'This Month'

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Product Breakdown</h4>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">orders per product</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refetch} disabled={loading}>
                        <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                                {filterLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            {FILTERS.map(f => (
                                <DropdownMenuItem key={f.key}
                                    className={cn('text-xs cursor-pointer', filter === f.key && 'text-primary font-semibold bg-primary/5')}
                                    onClick={() => setFilter(f.key)}>
                                    {f.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-9 rounded-lg bg-muted/30 animate-pulse border border-border/40" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                    এই সময়ে কোনো অর্ডার নেই।
                </div>
            ) : (
                <div className="rounded-xl border border-border/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground sticky left-0 bg-muted/30">Product</th>
                                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Total</th>
                                    {STATUS_COLS.map(s => (
                                        <th key={s.key} className="px-3 py-2.5 text-center font-semibold text-muted-foreground whitespace-nowrap">{s.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <motion.tr key={row._id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={cn('border-b', i % 2 === 0 ? 'bg-background' : 'bg-muted/10')}>
                                        <td className="px-4 py-2.5 font-medium max-w-[180px] truncate sticky left-0 bg-inherit">{row._id || '—'}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className="font-bold text-foreground">{row.total}</span>
                                        </td>
                                        {STATUS_COLS.map(s => (
                                            <td key={s.key} className="px-3 py-2.5 text-center">
                                                {row[s.key] > 0 ? (
                                                    <span className={cn('px-2 py-0.5 rounded-full font-semibold text-[10px]', s.cls)}>
                                                        {row[s.key]}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/40">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
