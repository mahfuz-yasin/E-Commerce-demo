"use client"

import { Cell, Label, Pie, PieChart, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import useFetch from "@/hooks/useFetch"

const STATUS_META = {
    pending:    { label: "Pending",    color: "#3b82f6", bg: "bg-blue-500" },
    processing: { label: "Processing", color: "#f59e0b", bg: "bg-amber-500" },
    shipped:    { label: "Shipped",    color: "#06b6d4", bg: "bg-cyan-500" },
    delivered:  { label: "Delivered",  color: "#10b981", bg: "bg-emerald-500" },
    cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "bg-red-500" },
    unverified: { label: "Unverified", color: "#f97316", bg: "bg-orange-500" },
}

const chartConfig = Object.fromEntries(
    Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, color: v.color }])
)

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0]
    const meta = STATUS_META[item.name] || {}
    return (
        <div className="bg-background border border-border rounded-xl shadow-xl px-3 py-2 text-xs min-w-[110px]">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color || item.payload.fill }} />
                <span className="font-semibold text-foreground">{meta.label || item.name}</span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Count</span>
                <span className="font-bold text-foreground tabular-nums">{item.value?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Share</span>
                <span className="font-bold text-foreground tabular-nums">{item.payload.pct}%</span>
            </div>
        </div>
    )
}

export function OrderStatus() {
    const [chartData, setChartData] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const { data: orderStatus } = useFetch('/api/dashboard/admin/order-status')

    useEffect(() => {
        if (orderStatus?.success) {
            const total = orderStatus.data.reduce((a, c) => a + c.count, 0)
            setTotalCount(total)
            const mapped = orderStatus.data.map((o) => ({
                name: o._id,
                count: o.count,
                pct: total > 0 ? Math.round((o.count / total) * 100) : 0,
                fill: STATUS_META[o._id]?.color || '#94a3b8',
            }))
            setChartData(mapped)
        }
    }, [orderStatus])

    return (
        <div className="space-y-5">
            {/* Donut chart */}
            <ChartContainer config={chartConfig} className="mx-auto h-[200px] w-full max-w-[200px]">
                <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                        ))}
                        <Label
                            content={({ viewBox }) => {
                                if (!viewBox || !("cx" in viewBox)) return null
                                return (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            style={{ fontSize: 26, fontWeight: 700, fill: 'currentColor' }}
                                        >
                                            {totalCount.toLocaleString()}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 20}
                                            style={{ fontSize: 11, fill: '#6b7280' }}
                                        >
                                            Total
                                        </tspan>
                                    </text>
                                )
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>

            {/* Progress bar legend */}
            <div className="space-y-2.5">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                    const item = chartData.find(d => d.name === key)
                    const count = item?.count ?? 0
                    const pct = item?.pct ?? 0
                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                                    <span className="text-xs text-foreground font-medium">{meta.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground tabular-nums">{count}</span>
                                    <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">{pct}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
