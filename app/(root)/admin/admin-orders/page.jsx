'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import ViewAction from "@/components/Application/Admin/ViewAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_ORDER_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_ORDER_DETAILS, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import { useCallback, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Calendar, ChevronDown, Filter, Plus, X } from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: "", label: 'Orders' },
]

const STATUS_TABS = [
    { key: 'all',         label: 'All Orders' },
    { key: 'pending',     label: 'Pending' },
    { key: 'processing',  label: 'Processing' },
    { key: 'shipped',     label: 'In Courier' },
    { key: 'delivered',   label: 'Delivered' },
    { key: 'cancelled',   label: 'Cancelled' },
    { key: 'unverified',  label: 'Unverified' },
    { key: 'incomplete',  label: 'Incomplete' },
]

const PAYMENT_OPTIONS = [
    { key: 'all',  label: 'All Payments' },
    { key: 'paid', label: 'Paid (Online)' },
    { key: 'unpaid', label: 'Unpaid (COD)' },
]

const SOURCE_OPTIONS = [
    { key: 'all',       label: 'All Sources' },
    { key: 'organic',   label: 'Organic' },
    { key: 'facebook',  label: 'Facebook' },
    { key: 'tiktok',    label: 'TikTok' },
    { key: 'google',    label: 'Google' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'direct',    label: 'Direct' },
    { key: 'other',     label: 'Other' },
]

const DATE_PRESETS = [
    { key: 'today',     label: 'Today',       days: 0 },
    { key: 'yesterday', label: 'Yesterday',   days: 1 },
    { key: 'last7',     label: 'Last 7 Days', days: 7 },
    { key: 'last14',    label: 'Last 14 Days', days: 14 },
    { key: 'last30',    label: 'Last 30 Days', days: 30 },
    { key: 'custom',    label: 'Custom Range' },
]

function getPresetDates(key) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (key === 'today') return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
    if (key === 'yesterday') {
        const y = new Date(today); y.setDate(y.getDate() - 1)
        return { from: y.toISOString().split('T')[0], to: y.toISOString().split('T')[0] }
    }
    const days = { last7: 7, last14: 14, last30: 30 }[key]
    if (days) {
        const from = new Date(today); from.setDate(from.getDate() - days)
        return { from: from.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
    }
    return null
}

const ShowOrder = () => {
    const [activeStatus, setActiveStatus] = useState('all')
    const [payment, setPayment]           = useState('all')
    const [source, setSource]             = useState('all')
    const [datePreset, setDatePreset]     = useState('')
    const [dateFrom, setDateFrom]         = useState('')
    const [dateTo, setDateTo]             = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)

    const columns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

    const action = useCallback((row, deleteType, handleDelete) => {
        const viewHref = ADMIN_ORDER_DETAILS(row.original.order_id)
        return [
            viewHref && <ViewAction key="view" href={viewHref} />,
            <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
        ].filter(Boolean)
    }, [])

    // Build fetch URL with all filters
    const fetchUrl = useMemo(() => {
        const params = new URLSearchParams()
        if (activeStatus !== 'all') params.set('status', activeStatus)
        if (payment !== 'all')      params.set('payment', payment)
        if (source !== 'all')       params.set('source', source)
        if (dateFrom)               params.set('dateFrom', dateFrom)
        if (dateTo)                 params.set('dateTo', dateTo)
        const qs = params.toString()
        return qs ? `/api/orders?${qs}` : '/api/orders'
    }, [activeStatus, payment, source, dateFrom, dateTo])

    const activeFiltersCount = [
        payment !== 'all',
        source !== 'all',
        !!dateFrom || !!dateTo,
    ].filter(Boolean).length

    const paymentLabel = PAYMENT_OPTIONS.find(p => p.key === payment)?.label || 'All Payments'
    const sourceLabel  = SOURCE_OPTIONS.find(s => s.key === source)?.label   || 'All Sources'

    const clearAllFilters = () => {
        setPayment('all'); setSource('all')
        setDateFrom(''); setDateTo(''); setDatePreset('')
        setShowDatePicker(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Orders</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage and track all customer orders.</p>
                </div>
                <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" /> Create Order
                </Button>
            </div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Status Tabs */}
            <div className="flex gap-1 flex-wrap border-b border-border/60 pb-0">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveStatus(tab.key)}
                        className={cn(
                            "px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all duration-150 -mb-px",
                            activeStatus === tab.key
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Payment Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", payment !== 'all' && "border-primary text-primary bg-primary/5")}>
                            {paymentLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        {PAYMENT_OPTIONS.map(o => (
                            <DropdownMenuItem key={o.key} className={cn("text-xs cursor-pointer", payment === o.key && "text-primary font-semibold")} onClick={() => setPayment(o.key)}>
                                {o.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Source Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", source !== 'all' && "border-primary text-primary bg-primary/5")}>
                            {sourceLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        {SOURCE_OPTIONS.map(o => (
                            <DropdownMenuItem key={o.key} className={cn("text-xs cursor-pointer", source === o.key && "text-primary font-semibold")} onClick={() => setSource(o.key)}>
                                {o.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Date Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", (dateFrom || dateTo) && "border-primary text-primary bg-primary/5")}>
                            <Calendar className="w-3.5 h-3.5" />
                            {datePreset ? DATE_PRESETS.find(d => d.key === datePreset)?.label : 'Date Filter'}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                        {DATE_PRESETS.map(d => (
                            <DropdownMenuItem key={d.key} className={cn("text-xs cursor-pointer", datePreset === d.key && "text-primary font-semibold")}
                                onClick={() => {
                                    setDatePreset(d.key)
                                    if (d.key === 'custom') { setShowDatePicker(true); return }
                                    setShowDatePicker(false)
                                    const r = getPresetDates(d.key)
                                    if (r) { setDateFrom(r.from); setDateTo(r.to) }
                                }}
                            >
                                {d.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear filters */}
                {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-destructive hover:text-destructive" onClick={clearAllFilters}>
                        <X className="w-3.5 h-3.5" /> Clear ({activeFiltersCount})
                    </Button>
                )}
            </div>

            {/* Custom date picker */}
            {showDatePicker && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap items-end gap-3 p-3 bg-muted/40 rounded-xl border border-border/60"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Start</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="h-8 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">End</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="h-8 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowDatePicker(false)}>
                        Done
                    </Button>
                </motion.div>
            )}

            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                            {STATUS_TABS.find(t => t.key === activeStatus)?.label}
                        </h4>
                        {activeFiltersCount > 0 && (
                            <span className="text-xs text-primary font-medium flex items-center gap-1">
                                <Filter className="w-3 h-3" /> {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        key={fetchUrl}
                        queryKey={`orders-${activeStatus}-${payment}-${source}-${dateFrom}-${dateTo}`}
                        fetchUrl={fetchUrl}
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/orders/export"
                        deleteEndpoint="/api/orders/delete"
                        deleteType="SD"
                        trashView={`${ADMIN_TRASH}?trashof=orders`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowOrder