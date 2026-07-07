"use client"

import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    XAxis, YAxis, ResponsiveContainer, Tooltip, defs, linearGradient, stop
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useEffect, useState, useMemo } from "react"
import useFetch from "@/hooks/useFetch"
import { TrendingUp, TrendingDown } from "lucide-react"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const chartConfig = {
    amount: { label: "Revenue", color: "#087ea4" },
    orders: { label: "Orders",  color: "#149eca" },
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-background border border-border rounded-xl shadow-xl px-4 py-3 min-w-[140px]">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs text-muted-foreground">{p.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground tabular-nums">
                        {p.dataKey === 'amount' ? `৳${p.value?.toLocaleString()}` : p.value?.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function OrderOverview() {
    const [chartData, setChartData] = useState([])
    const { data: monthlySales } = useFetch('/api/dashboard/admin/monthly-sales')

    useEffect(() => {
        if (monthlySales?.success) {
            const monthly = Array.isArray(monthlySales.data?.monthly) ? monthlySales.data.monthly : []
            // monthly items: { month: "Jan 2025", revenue, adsCost, orders }
            const currentYear = new Date().getFullYear()
            const data = MONTHS.map((month, i) => {
                const found = monthly.find(d => d.month === `${month} ${currentYear}` || d.month?.startsWith(month))
                return {
                    month,
                    amount: found?.revenue ?? 0,
                    orders: found?.orders  ?? 0,
                }
            })
            setChartData(data)
        }
    }, [monthlySales])

    const trend = useMemo(() => {
        const nonZero = chartData.filter(d => d.amount > 0)
        if (nonZero.length < 2) return null
        const last = nonZero[nonZero.length - 1].amount
        const prev = nonZero[nonZero.length - 2].amount
        if (!prev) return null
        const pct = Math.round(((last - prev) / prev) * 100)
        return pct
    }, [chartData])

    const totalRevenue = chartData.reduce((s, d) => s + d.amount, 0)
    const totalOrders  = chartData.reduce((s, d) => s + d.orders, 0)

    return (
        <div className="space-y-4">
            {/* Summary row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-6">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Total Revenue</p>
                        <p className="text-xl font-bold text-foreground tabular-nums">৳{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Total Orders</p>
                        <p className="text-xl font-bold text-foreground tabular-nums">{totalOrders.toLocaleString()}</p>
                    </div>
                </div>
                {trend !== null && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        trend >= 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                    }`}>
                        {trend >= 0
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend >= 0 ? '+' : ''}{trend}% vs prev month
                    </div>
                )}
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#087ea4" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#087ea4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#149eca" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#149eca" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        strokeOpacity={0.06}
                        strokeDasharray="3 3"
                    />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={52}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#087ea4', strokeWidth: 1, strokeOpacity: 0.3 }} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        name="Revenue"
                        stroke="#087ea4"
                        strokeWidth={2.5}
                        fill="url(#gradAmount)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#087ea4', strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#149eca"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        fill="url(#gradOrders)"
                        dot={false}
                        activeDot={{ r: 3, fill: '#149eca', strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ChartContainer>

            {/* Legend */}
            <div className="flex items-center gap-5 justify-end">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#087ea4] rounded-full" />
                    <span className="text-xs text-muted-foreground">Revenue (৳)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#149eca] rounded-full border-dashed" style={{borderTop: '1.5px dashed #149eca', background: 'none'}} />
                    <span className="text-xs text-muted-foreground">Orders</span>
                </div>
            </div>
        </div>
    )
}
