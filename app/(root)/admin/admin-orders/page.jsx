'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import ViewAction from "@/components/Application/Admin/ViewAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DT_ORDER_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_ORDER_DETAILS, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import { useCallback, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Calendar, ChevronDown, Filter, Plus, X, ScanLine, Key, StickyNote, Copy, Trash2, Eye, EyeOff, RefreshCw, Printer, Truck, Download, CheckCircle, XCircle, ToggleLeft, ToggleRight } from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { showToast } from "@/lib/showToast"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: "", label: 'Orders' },
]

const STATUS_TABS = [
    { key: 'all',              label: 'All Orders' },
    { key: 'pending',          label: 'New' },
    { key: 'confirmed',        label: 'Confirmed' },
    { key: 'processing',       label: 'Processing' },
    { key: 'ready',            label: 'Ready' },
    { key: 'shipped',          label: 'In Courier' },
    { key: 'delivered',        label: 'Delivered' },
    { key: 'partial_delivery', label: 'Partial' },
    { key: 'cancelled',        label: 'Cancelled' },
    { key: 'hold',             label: 'Hold' },
    { key: 'ship_later',       label: 'Ship Later' },
    { key: 'returned',         label: 'Return' },
    { key: 'lost',             label: 'Lost' },
    { key: 'incomplete',       label: 'Incomplete' },
]

const PAYMENT_OPTIONS = [
    { key: 'all',  label: 'All Payments' },
    { key: 'paid', label: 'Paid (Online)' },
    { key: 'unpaid', label: 'Unpaid (COD)' },
]

const SOURCE_OPTIONS = [
    { key: 'all',         label: 'All Sources' },
    { key: 'manual',      label: 'Manual' },
    { key: 'website',     label: 'Website' },
    { key: 'wordpress',   label: 'WordPress/WooCommerce' },
    { key: 'facebook',    label: 'Facebook' },
    { key: 'landing',     label: 'Landing Page' },
    { key: 'api',         label: 'API' },
    { key: 'organic',     label: 'Organic' },
    { key: 'tiktok',      label: 'TikTok' },
    { key: 'google',      label: 'Google' },
    { key: 'instagram',   label: 'Instagram' },
    { key: 'direct',      label: 'Direct' },
    { key: 'other',       label: 'Other' },
]

const PRINT_OPTIONS = [
    { key: 'all',         label: 'All Print Status' },
    { key: 'printed',     label: 'Printed' },
    { key: 'not_printed', label: 'Not Printed' },
]

const API_PLATFORMS = [
    { value: 'wordpress',   label: 'WordPress / WooCommerce' },
    { value: 'laravel',     label: 'Laravel' },
    { value: 'custom',      label: 'Custom Platform' },
    { value: 'other',       label: 'Other' },
]

const DATE_PRESETS = [
    { key: 'today',     label: 'Today',        days: 0 },
    { key: 'yesterday', label: 'Yesterday',    days: 1 },
    { key: 'last7',     label: 'Last 7 Days',  days: 7 },
    { key: 'last14',    label: 'Last 14 Days', days: 14 },
    { key: 'last30',    label: 'Last 30 Days', days: 30 },
    { key: 'last365',   label: 'Last Year',    days: 365 },
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
    const days = { last7: 7, last14: 14, last30: 30, last365: 365 }[key]
    if (days) {
        const from = new Date(today); from.setDate(from.getDate() - days)
        return { from: from.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
    }
    return null
}

const ShowOrder = () => {
    const [activeStatus, setActiveStatus]     = useState('all')
    const [payment, setPayment]               = useState('all')
    const [source, setSource]                 = useState('all')
    const [printStatus, setPrintStatus]       = useState('all')
    const [datePreset, setDatePreset]         = useState('')
    const [dateFrom, setDateFrom]             = useState('')
    const [dateTo, setDateTo]                 = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showAdvanced, setShowAdvanced]     = useState(false)
    const [advPhone, setAdvPhone]             = useState('')
    const [advName, setAdvName]               = useState('')
    const [advOrderId, setAdvOrderId]         = useState('')
    const [showCourier, setShowCourier]       = useState(false)
    // Popups
    const [showScan, setShowScan]             = useState(false)
    const [showApiKeys, setShowApiKeys]       = useState(false)
    const [showNotes, setShowNotes]           = useState(false)
    // Scan state
    const [scanQuery, setScanQuery]           = useState('')
    const [scanLoading, setScanLoading]       = useState(false)
    const [scanResult, setScanResult]         = useState(null)
    // API Key state
    const [newKeyLabel, setNewKeyLabel]       = useState('')
    const [newKeyPlatform, setNewKeyPlatform] = useState('custom')
    const [revealedKey, setRevealedKey]       = useState(null)
    // Note preset state
    const [newNote, setNewNote]               = useState('')
    const queryClient = useQueryClient()

    // Courier query
    const { data: courierData, isLoading: courierLoading, refetch: refetchCouriers } = useQuery({
        queryKey: ['courier-configs'],
        queryFn: async () => { const { data } = await axios.get('/api/admin/courier/config'); return data.data || [] },
        enabled: showCourier,
    })
    const toggleCourier = async (courierName, current) => {
        try {
            await axios.patch(`/api/admin/courier/config/${courierName}`, { isActive: !current })
            showToast('success', !current ? 'Courier সক্রিয় হয়েছে।' : 'Courier নিষ্ক্রিয় হয়েছে।')
            refetchCouriers()
        } catch { showToast('error', 'আপডেট ব্যর্থ।') }
    }

    // API Keys query
    const { data: apiKeysData, isLoading: apiKeysLoading } = useQuery({
        queryKey: ['order-api-keys'],
        queryFn: async () => { const { data } = await axios.get('/api/orders/api-keys'); return data.data || [] },
        enabled: showApiKeys,
    })
    // Note presets query
    const { data: presetsData, isLoading: presetsLoading } = useQuery({
        queryKey: ['note-presets'],
        queryFn: async () => { const { data } = await axios.get('/api/orders/note-presets'); return data.data || [] },
        enabled: showNotes,
    })

    const createKey = async () => {
        if (!newKeyLabel.trim()) return
        try {
            await axios.post('/api/orders/api-keys', { label: newKeyLabel, platform: newKeyPlatform })
            showToast('success', 'API Key তৈরি হয়েছে।')
            setNewKeyLabel('')
            queryClient.invalidateQueries(['order-api-keys'])
        } catch { showToast('error', 'তৈরি ব্যর্থ।') }
    }
    const deleteKey = async (id) => {
        try {
            await axios.delete('/api/orders/api-keys', { data: { id } })
            showToast('success', 'মুছে ফেলা হয়েছে।')
            queryClient.invalidateQueries(['order-api-keys'])
        } catch { showToast('error', 'মুছতে ব্যর্থ।') }
    }
    const createPreset = async () => {
        if (!newNote.trim()) return
        try {
            await axios.post('/api/orders/note-presets', { note: newNote })
            showToast('success', 'প্রিসেট সেভ হয়েছে।')
            setNewNote('')
            queryClient.invalidateQueries(['note-presets'])
        } catch { showToast('error', 'সেভ ব্যর্থ।') }
    }
    const deletePreset = async (id) => {
        try {
            await axios.delete('/api/orders/note-presets', { data: { id } })
            showToast('success', 'মুছে ফেলা হয়েছে।')
            queryClient.invalidateQueries(['note-presets'])
        } catch { showToast('error', 'মুছতে ব্যর্থ।') }
    }
    const handleScan = async () => {
        if (!scanQuery.trim()) return
        setScanLoading(true); setScanResult(null)
        try {
            const { data } = await axios.get(`/api/orders?globalFilter=${encodeURIComponent(scanQuery)}&size=5`)
            setScanResult(data.data || [])
        } catch { showToast('error', 'অনুসন্ধান ব্যর্থ।') }
        finally { setScanLoading(false) }
    }

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
        if (printStatus !== 'all')  params.set('print', printStatus)
        if (dateFrom)               params.set('dateFrom', dateFrom)
        if (dateTo)                 params.set('dateTo', dateTo)
        const qs = params.toString()
        return qs ? `/api/orders?${qs}` : '/api/orders'
    }, [activeStatus, payment, source, printStatus, dateFrom, dateTo])

    const activeFiltersCount = [
        payment !== 'all', source !== 'all',
        printStatus !== 'all', !!dateFrom || !!dateTo,
    ].filter(Boolean).length

    const paymentLabel    = PAYMENT_OPTIONS.find(p => p.key === payment)?.label    || 'All Payments'
    const sourceLabel     = SOURCE_OPTIONS.find(s => s.key === source)?.label      || 'All Sources'
    const printLabel      = PRINT_OPTIONS.find(p => p.key === printStatus)?.label  || 'Print Status'

    const clearAllFilters = () => {
        setPayment('all'); setSource('all'); setPrintStatus('all')
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
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setShowCourier(true)}>
                        <Truck className="w-3.5 h-3.5" /> Courier
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => window.open(`/api/orders/export?${fetchUrl.split('?')[1] || ''}`, '_blank')}>
                        <Download className="w-3.5 h-3.5" /> Export
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => window.print()}>
                        <Printer className="w-3.5 h-3.5" /> Print
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setShowScan(true)}>
                        <ScanLine className="w-3.5 h-3.5" /> Scan Here
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setShowNotes(true)}>
                        <StickyNote className="w-3.5 h-3.5" /> Note Presets
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setShowApiKeys(true)}>
                        <Key className="w-3.5 h-3.5" /> API Keys
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setShowAdvanced(true)}>
                        <Filter className="w-3.5 h-3.5" /> Advanced Filter
                    </Button>
                    <Button size="sm" className="gap-1.5 h-8 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Create Order
                    </Button>
                </div>
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

                {/* Print Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", printStatus !== 'all' && "border-primary text-primary bg-primary/5")}>
                            <Printer className="w-3.5 h-3.5" />{printLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        {PRINT_OPTIONS.map(o => (
                            <DropdownMenuItem key={o.key} className={cn("text-xs cursor-pointer", printStatus === o.key && "text-primary font-semibold")} onClick={() => setPrintStatus(o.key)}>
                                {o.label}
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

            {/* COURIER MANAGEMENT POPUP */}
            <AnimatePresence>
            {showCourier && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setShowCourier(false)}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><Truck className="w-4 h-4 text-primary" />Courier Management</h3>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => refetchCouriers()} disabled={courierLoading}>
                                    <RefreshCw className={cn('w-3 h-3', courierLoading && 'animate-spin')} /> Refresh All
                                </Button>
                                <button onClick={() => setShowCourier(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">সক্রিয় courier provider দেখুন এবং on/off করুন। বিস্তারিত সেটিংসের জন্য Courier Settings পেজে যান।</p>

                        {courierLoading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl border border-border/60 bg-muted/30 animate-pulse" />)}
                            </div>
                        ) : !courierData?.length ? (
                            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                                কোনো courier কনফিগার করা নেই।
                                <br /><a href="/admin/courier-settings" className="text-primary text-xs hover:underline mt-1 block">Courier Settings →</a>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {courierData.map(c => (
                                    <div key={c._id} className={cn(
                                        'flex items-center justify-between p-3.5 rounded-xl border transition-all',
                                        c.isActive ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-muted/10'
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                                                c.isActive ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-muted'
                                            )}>
                                                <Truck className={cn('w-4 h-4', c.isActive ? 'text-emerald-600' : 'text-muted-foreground')} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{c.displayName || c.courierName}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {c.isActive ? (
                                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                                            <CheckCircle className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                                            <XCircle className="w-3 h-3" /> Inactive
                                                        </span>
                                                    )}
                                                    {c.settings?.autoAssign && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Auto Assign</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={`/admin/courier-settings/${c.courierName}`}
                                                className="text-[10px] text-primary hover:underline px-2 py-1 rounded border border-primary/20 hover:bg-primary/5">
                                                Settings
                                            </a>
                                            <button
                                                onClick={() => toggleCourier(c.courierName, c.isActive)}
                                                className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none',
                                                    c.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                                )}>
                                                <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5',
                                                    c.isActive ? 'translate-x-4' : 'translate-x-0.5'
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-1 flex justify-end">
                            <a href="/admin/courier-settings" className="text-xs text-primary hover:underline flex items-center gap-1">
                                সব Courier Settings দেখুন →
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* SCAN POPUP */}
            <AnimatePresence>
            {showScan && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setShowScan(false)}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><ScanLine className="w-4 h-4 text-primary" />Scan / Quick Search</h3>
                            <button onClick={() => setShowScan(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-muted-foreground">Parcel ID, Tracking Number, Order ID বা Phone দিয়ে তাৎক্ষণিক সার্চ করুন</p>
                        <div className="flex gap-2">
                            <Input placeholder="Order ID / Phone / Tracking..." value={scanQuery}
                                onChange={e => setScanQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleScan()}
                                className="flex-1" autoFocus />
                            <Button onClick={handleScan} disabled={scanLoading} size="sm">{scanLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}</Button>
                        </div>
                        {scanResult !== null && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {scanResult.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-4">কোনো অর্ডার পাওয়া যায়নি।</p>
                                ) : scanResult.map(o => (
                                    <a key={o._id} href={ADMIN_ORDER_DETAILS(o.order_id)}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-all">
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">{o.order_id}</p>
                                            <p className="text-[10px] text-muted-foreground">{o.name} · {o.phone}</p>
                                        </div>
                                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',
                                            o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        )}>{o.status}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* NOTE PRESETS POPUP */}
            <AnimatePresence>
            {showNotes && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setShowNotes(false)}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><StickyNote className="w-4 h-4 text-primary" />Reusable Note Presets</h3>
                            <button onClick={() => setShowNotes(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="নতুন নোট লিখুন..." value={newNote} onChange={e => setNewNote(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && createPreset()} className="flex-1 text-sm" />
                            <Button size="sm" onClick={createPreset} disabled={!newNote.trim()}>Add</Button>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {presetsLoading ? <p className="text-xs text-center text-muted-foreground">Loading...</p> :
                                presetsData?.length === 0 ? <p className="text-xs text-center text-muted-foreground py-4">কোনো প্রিসেট নেই।</p> :
                                presetsData?.map(p => (
                                    <div key={p._id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/20">
                                        <p className="text-xs flex-1 leading-relaxed">{p.note}</p>
                                        <div className="flex gap-1">
                                            <button onClick={() => { navigator.clipboard.writeText(p.note); showToast('success', 'কপি হয়েছে।') }}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                                            <button onClick={() => deletePreset(p._id)}
                                                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* API KEYS POPUP */}
            <AnimatePresence>
            {showApiKeys && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setShowApiKeys(false)}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-primary" />Order API Keys</h3>
                            <button onClick={() => setShowApiKeys(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-muted-foreground">অন্য সিস্টেমের সাথে (WordPress, Laravel) অর্ডার সিঙ্ক করতে API Key ব্যবহার করুন।</p>
                        <div className="flex gap-2">
                            <Input placeholder="Key label (e.g. My WooCommerce Site)" value={newKeyLabel}
                                onChange={e => setNewKeyLabel(e.target.value)} className="flex-1 text-xs" />
                            <select value={newKeyPlatform} onChange={e => setNewKeyPlatform(e.target.value)}
                                className="h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground">
                                {API_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                            <Button size="sm" onClick={createKey} disabled={!newKeyLabel.trim()}>Generate</Button>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {apiKeysLoading ? <p className="text-xs text-center text-muted-foreground">Loading...</p> :
                                apiKeysData?.length === 0 ? <p className="text-xs text-center text-muted-foreground py-4">কোনো API Key নেই।</p> :
                                apiKeysData?.map(k => (
                                    <div key={k._id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-foreground">{k.label}</p>
                                                <p className="text-[10px] text-muted-foreground capitalize">{k.platform} · Created {new Date(k.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => setRevealedKey(revealedKey === k._id ? null : k._id)}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground">
                                                    {revealedKey === k._id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                </button>
                                                <button onClick={() => { navigator.clipboard.writeText(k.key); showToast('success', 'Copied!') }}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground"><Copy className="w-3 h-3" /></button>
                                                <button onClick={() => deleteKey(k._id)}
                                                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                        {revealedKey === k._id && (
                                            <p className="text-[10px] font-mono bg-muted rounded px-2 py-1 break-all text-muted-foreground">{k.key}</p>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* ADVANCED FILTER POPUP */}
            <AnimatePresence>
            {showAdvanced && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setShowAdvanced(false)}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4 text-primary" />Advanced Filter</h3>
                            <button onClick={() => setShowAdvanced(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Order ID</Label>
                                <Input placeholder="e.g. ORD-12345" value={advOrderId} onChange={e => setAdvOrderId(e.target.value)} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Customer Phone</Label>
                                <Input placeholder="e.g. 01700000000" value={advPhone} onChange={e => setAdvPhone(e.target.value)} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Customer Name</Label>
                                <Input placeholder="e.g. Rahman" value={advName} onChange={e => setAdvName(e.target.value)} className="h-8 text-xs" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button size="sm" className="flex-1 text-xs" onClick={() => {
                                const params = new URLSearchParams()
                                if (advOrderId.trim()) params.set('globalFilter', advOrderId.trim())
                                else if (advPhone.trim()) params.set('globalFilter', advPhone.trim())
                                else if (advName.trim()) params.set('globalFilter', advName.trim())
                                window.location.href = '/admin/admin-orders?' + params.toString()
                            }}>
                                Apply Filter
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => { setAdvOrderId(''); setAdvPhone(''); setAdvName('') }}>
                                Clear
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

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