'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import { useEffect, useState } from "react"
import { statusBadge } from "@/lib/helperFunction"
import { ShoppingBag } from "lucide-react"

const LatestOrder = () => {
    const [latestOrder, setLatestOrder] = useState([])
    const { data, loading } = useFetch('/api/dashboard/admin/latest-order')

    useEffect(() => {
        if (data?.success) setLatestOrder(data.data)
    }, [data])

    if (loading) return (
        <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4 animate-pulse">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded flex-1" />
                    <div className="h-5 bg-muted rounded-full w-16" />
                    <div className="h-3 bg-muted rounded w-16" />
                </div>
            ))}
        </div>
    )

    if (!latestOrder.length) return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <ShoppingBag className="w-10 h-10 opacity-30" />
            <p className="text-sm">No recent orders</p>
        </div>
    )

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-5 text-xs font-semibold uppercase tracking-wide">Order ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Items</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-right pr-5">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {latestOrder.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-5 py-3">
                            <span className="font-mono text-xs text-muted-foreground">#{order.order_id || order._id?.slice(-6).toUpperCase()}</span>
                        </TableCell>
                        <TableCell className="py-3">
                            <div>
                                <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{order.name || '—'}</p>
                                <p className="text-xs text-muted-foreground">{order.phone || ''}</p>
                            </div>
                        </TableCell>
                        <TableCell className="py-3">
                            <span className="text-sm text-muted-foreground">{order.products?.length ?? 0}</span>
                        </TableCell>
                        <TableCell className="py-3">{statusBadge(order.status)}</TableCell>
                        <TableCell className="py-3 text-right pr-5">
                            <span className="text-sm font-semibold text-foreground tabular-nums">৳{order.totalAmount?.toLocaleString()}</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default LatestOrder