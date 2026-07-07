'use client'
import { useState, useEffect } from 'react'
import useFetch from '@/hooks/useFetch'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Sector
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, RefreshCw, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const FILTERS = [
    { key: 'today',      label: 'Today' },
    { key: 'this_week',  label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year',  label: 'This Year' },
]

const STATUS_COLORS = {
    delivered:       '#10b981',
    confirmed:       '#22c55e',
    shipped:         '#6366f1',
    processing:      '#f59e0b',
    pending:         '#3b82f6',
    cancelled:       '#ef4444',
    hold:            '#64748b',
    returned:        '#f97316',
    lost:            '#e11d48',
    partial_delivery:'#84cc16',
    unverified:      '#fb923c',
}

const fmt = (v) => v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${v}`

const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-semibold">{fmt(p.value || 0)}</span>
                </div>
            ))}
        </div>
    )
}

export default function DashboardCharts({ filter: externalFilter }) {
    const [filter, setFilter] = useState(externalFilter || 'this_month')
    useEffect(() => { if (externalFilter) setFilter(externalFilter) }, [externalFilter])
    const { data, loading, refetch } = useFetch(`/api/dashboard/admin/live-stats?filter=${filter}`)
    const { data: monthlyData, loading: monthlyLoading } = useFetch(`/api/dashboard/admin/monthly-sales?filter=${filter}`)
    const { data: adsData } = useFetch(`/api/reports/profit-loss?filter=${filter}`)

    const s = data?.data || {}
    const filterLabel = FILTERS.find(f => f.key === filter)?.label || 'This Month'

    // Donut data from order statuses
    const pieData = Object.entries(STATUS_COLORS)
        .map(([key, color]) => ({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: s[key]?.count || 0,
            color,
        }))
        .filter(d => d.value > 0)

    // Bar chart: monthly revenue vs ads spend
    const barData = monthlyData?.data?.monthly || []
    const plSummary = adsData?.data?.summary || {}

    return (
        <div className="grid lg:grid-cols-2 gap-4">
            {/* Order Status Donut */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Order Status Distribution</h4>
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
                                        className={cn('text-xs cursor-pointer', filter === f.key && 'text-primary font-semibold')}
                                        onClick={() => setFilter(f.key)}>
                                        {f.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {loading ? (
                    <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />Loading...
                    </div>
                ) : pieData.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">কোনো ডেটা নেই।</div>
                ) : (
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                    dataKey="value" paddingAngle={2}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v + ' orders', n]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-44">
                            {pieData.map(d => (
                                <div key={d.name} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                        <span className="text-[10px] text-muted-foreground truncate">{d.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground tabular-nums">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ads Spend summary cards */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                    <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ads Spend</p>
                        <p className="text-sm font-bold text-blue-600">
                            {plSummary.totalAdsCost != null ? `৳${Math.round(plSummary.totalAdsCost).toLocaleString('en-BD')}` : '—'}
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ad / Order</p>
                        <p className="text-sm font-bold text-violet-600">
                            {plSummary.totalAdsCost && s.total?.count
                                ? `৳${Math.round(plSummary.totalAdsCost / s.total.count).toLocaleString('en-BD')}`
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Revenue vs Ads Bar Chart */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Revenue vs Ads Spend</h4>
                </div>

                {monthlyLoading ? (
                    <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />Loading...
                    </div>
                ) : barData.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">কোনো ডেটা নেই।</div>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                            barSize={14} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => `৳${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={45} />
                            <Tooltip content={<CustomBarTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="adsCost" name="Ads Cost" fill="#6366f1" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
