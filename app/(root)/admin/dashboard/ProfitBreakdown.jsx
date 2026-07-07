'use client'
import useFetch from '@/hooks/useFetch'
import { TrendingUp, TrendingDown, DollarSign, Truck, Megaphone, RotateCcw, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ADMIN_REPORTS_PROFIT_LOSS } from '@/routes/AdminPanelRoute'
import { cn } from '@/lib/utils'

const fmt = (v) => v != null ? `৳${Number(v).toLocaleString('en-BD')}` : '—'

function getDateRange(filter) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const fmt = (d) => d.toISOString().split('T')[0]
    switch (filter) {
        case 'today':      return { s: fmt(today), e: fmt(now) }
        case 'yesterday':  { const y = new Date(today); y.setDate(y.getDate()-1); return { s: fmt(y), e: fmt(today) } }
        case 'this_week':  { const ws = new Date(today); ws.setDate(today.getDate()-today.getDay()); return { s: fmt(ws), e: fmt(now) } }
        case 'this_year':  return { s: `${now.getFullYear()}-01-01`, e: fmt(now) }
        default:           return { s: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], e: fmt(now) }
    }
}

const FILTER_LABELS = { today: 'Today', yesterday: 'Yesterday', this_week: 'This Week', this_month: 'This Month', this_year: 'This Year' }

export default function ProfitBreakdown({ filter = 'this_month' }) {
    const { s: startDate, e: endDate } = getDateRange(filter)
    const { data, loading } = useFetch(`/api/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`)
    const pl = data?.data?.summary

    const rows = [
        { label: 'Revenue',      value: fmt(pl?.totalRevenue),   icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Ads Cost',     value: fmt(pl?.totalAdsCost),   icon: <Megaphone className="w-4 h-4" />, color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
        { label: 'Delivery',     value: fmt(pl?.totalShipping),  icon: <Truck className="w-4 h-4" />,     color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Returns',      value: fmt(pl?.totalReturns ?? 0),   icon: <RotateCcw className="w-4 h-4" />, color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-950/30' },
        { label: 'Est. Profit',  value: fmt(pl?.netProfit),      icon: <TrendingUp className="w-4 h-4" />,color: pl?.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: pl?.netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30' },
        { label: 'Final Profit', value: 'Pending',               icon: <Clock className="w-4 h-4" />,     color: 'text-muted-foreground', bg: 'bg-muted/30', pending: true },
    ]

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profit Breakdown — {FILTER_LABELS[filter] || 'This Month'}</h4>
                <Link href={ADMIN_REPORTS_PROFIT_LOSS} className="text-xs text-primary hover:underline">Full report →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {rows.map((r, i) => (
                    <motion.div key={r.label}
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}
                        className={cn('relative rounded-xl border border-border/60 shadow-sm p-3 space-y-2', r.bg)}
                    >
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-black/20 shadow-sm', r.color)}>
                            {r.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{r.label}</p>
                            <p className={cn('text-base font-bold leading-tight mt-0.5', r.pending ? 'text-muted-foreground text-xs italic' : r.color)}>
                                {loading ? '...' : r.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
