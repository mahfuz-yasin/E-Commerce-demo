'use client'
import { useState, useCallback } from 'react'
import useFetch from '@/hooks/useFetch'
import { motion } from 'framer-motion'
import { Calendar, ChevronDown, ShoppingBag, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const FILTERS = [
    { key: 'all',        label: 'All Time' },
    { key: 'today',      label: 'Today' },
    { key: 'yesterday',  label: 'Yesterday' },
    { key: 'this_week',  label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year',  label: 'This Year' },
    { key: 'custom',     label: 'Custom Range' },
]

const fmt = (n) => typeof n === 'number' ? `৳${n.toLocaleString('en-BD')}` : '৳0'

const StatCard = ({ label, count, amount, pct, color, bar, subBadges, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.055, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm p-4 flex flex-col gap-1.5`}
    >
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${bar}`} />
        <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</span>
            {pct !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bar.replace('bg-', 'bg-').replace('500', '100')} ${color}`}>
                    {pct}%
                </span>
            )}
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{count?.toLocaleString() ?? 0}</p>
        {amount !== undefined && (
            <p className="text-xs text-muted-foreground font-medium">{fmt(amount)}</p>
        )}
        {subBadges && (
            <div className="flex flex-wrap gap-1 mt-1">
                {subBadges.map(b => (
                    <span key={b.label} className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${b.cls}`}>
                        {b.label}: {b.value}
                    </span>
                ))}
            </div>
        )}
    </motion.div>
)

export default function LiveOrderStats() {
    const [activeFilter, setActiveFilter] = useState('today')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [showCustom, setShowCustom] = useState(false)

    const buildUrl = useCallback(() => {
        if (activeFilter === 'custom' && customStart && customEnd) {
            return `/api/dashboard/admin/live-stats?filter=custom&startDate=${customStart}&endDate=${customEnd}`
        }
        return `/api/dashboard/admin/live-stats?filter=${activeFilter}`
    }, [activeFilter, customStart, customEnd])

    const { data, loading, refetch } = useFetch(buildUrl())
    const s = data?.data || {}

    const filterLabel = FILTERS.find(f => f.key === activeFilter)?.label || 'Today'

    const cards = [
        {
            label: 'Total Orders',
            count: s.total?.count,
            amount: s.total?.amount,
            color: 'text-violet-600',
            bar: 'bg-violet-500',
        },
        {
            label: 'Processing / New',
            count: s.processing?.count,
            pct: s.processing?.pct,
            color: 'text-amber-600',
            bar: 'bg-amber-500',
        },
        {
            label: 'Confirmed',
            count: s.confirmed?.count,
            amount: s.confirmed?.amount,
            pct: s.confirmed?.pct,
            color: 'text-emerald-600',
            bar: 'bg-emerald-500',
        },
        {
            label: 'Cancelled',
            count: s.cancelled?.count,
            pct: s.cancelled?.pct,
            color: 'text-red-600',
            bar: 'bg-red-500',
        },
        {
            label: 'Pending / Hold',
            count: s.pending?.count,
            pct: s.pending?.pct,
            color: 'text-blue-600',
            bar: 'bg-blue-500',
        },
        {
            label: 'Delivered',
            count: s.delivered?.count,
            amount: s.delivered?.amount,
            pct: s.delivered?.pct,
            color: 'text-teal-600',
            bar: 'bg-teal-500',
        },
        {
            label: 'Unverified',
            count: s.unverified?.count,
            pct: s.unverified?.pct,
            color: 'text-orange-600',
            bar: 'bg-orange-500',
        },
        {
            label: 'Incomplete',
            count: s.incomplete?.count,
            pct: s.incomplete?.pct,
            color: 'text-slate-600',
            bar: 'bg-slate-400',
            subBadges: [
                { label: 'Pending',    value: s.pending?.count    ?? 0, cls: 'bg-blue-100 text-blue-700' },
                { label: 'Processing', value: s.processing?.count ?? 0, cls: 'bg-amber-100 text-amber-700' },
                { label: 'Unverified', value: s.unverified?.count ?? 0, cls: 'bg-orange-100 text-orange-700' },
            ]
        },
    ]

    return (
        <div className="space-y-3">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Live Order Stats</h4>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={refetch}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                {filterLabel}
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {FILTERS.map(f => (
                                <DropdownMenuItem
                                    key={f.key}
                                    className={cn("text-xs cursor-pointer", activeFilter === f.key && "text-primary font-semibold bg-primary/5")}
                                    onClick={() => {
                                        setActiveFilter(f.key)
                                        if (f.key === 'custom') setShowCustom(true)
                                        else setShowCustom(false)
                                    }}
                                >
                                    {f.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Custom date range picker */}
            {showCustom && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap items-end gap-3 p-3 bg-muted/40 rounded-xl border border-border/60"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Start Date</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={e => setCustomStart(e.target.value)}
                            className="h-8 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">End Date</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={e => setCustomEnd(e.target.value)}
                            className="h-8 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={refetch}
                        disabled={!customStart || !customEnd}
                    >
                        Apply
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => { setShowCustom(false); setActiveFilter('today') }}
                    >
                        Clear
                    </Button>
                </motion.div>
            )}

            {/* Skeleton loading */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl border border-border/60 bg-muted/30 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Cards */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {cards.map((c, i) => (
                        <StatCard key={c.label} {...c} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}
