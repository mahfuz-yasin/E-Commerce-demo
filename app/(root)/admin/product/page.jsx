'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_PRODUCT_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_EDIT, ADMIN_PRODUCT_SHOW, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Plus, ChevronDown, AlertTriangle, Package, TrendingUp, Archive, Upload, RefreshCw, Copy, ChevronLeft, ChevronRight, Filter, Eye, EyeOff, ToggleLeft, ToggleRight, Layers } from "lucide-react"
import useFetch from "@/hooks/useFetch"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { showToast } from "@/lib/showToast"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
]

const STOCK_FILTERS = [
    { key: 'all',        label: 'All Stock' },
    { key: 'instock',    label: 'In Stock' },
    { key: 'low',        label: 'Low Stock (≤5)' },
    { key: 'outofstock', label: 'Out of Stock' },
]

const LOG_ACTIONS = [
    { key: 'all',        label: 'All Actions' },
    { key: 'decrease',   label: 'কমেছে' },
    { key: 'return',     label: 'ফেরত' },
    { key: 'restock',    label: 'রিস্টক' },
    { key: 'increase',   label: 'যোগ' },
    { key: 'adjustment', label: 'সমন্বয়' },
]

const LOG_ACTION_LABELS = {
    decrease:   { label: 'কমেছে',  cls: 'bg-red-100 text-red-700' },
    return:     { label: 'ফেরত',   cls: 'bg-orange-100 text-orange-700' },
    restock:    { label: 'রিস্টক', cls: 'bg-blue-100 text-blue-700' },
    increase:   { label: 'যোগ',    cls: 'bg-green-100 text-green-700' },
    adjustment: { label: 'সমন্বয়', cls: 'bg-purple-100 text-purple-700' },
}

const fmt = (n) => typeof n === 'number' ? `৳${Math.round(n).toLocaleString('en-BD')}` : '৳0'

const SummaryCard = ({ label, value, sub, icon: Icon, color, bar, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm p-4 flex items-center justify-between"
    >
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${bar}`} />
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bar.replace('bg-', 'bg-').replace('-500', '-100')} dark:${bar.replace('bg-', 'bg-').replace('-500', '-950')} ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
    </motion.div>
)

const STATUS_FILTERS = [
    { key: 'all',      label: 'All Status' },
    { key: 'active',   label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
]

const ShowProduct = () => {
    const [stockFilter, setStockFilter]   = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [searchQuery, setSearchQuery]   = useState('')
    const [searchInput, setSearchInput]   = useState('')
    const searchTimer = useRef(null)
    const [activeTab, setActiveTab]     = useState('products')
    const [logAction, setLogAction]     = useState('all')
    const [logPage, setLogPage]         = useState(1)
    const [showImport, setShowImport]   = useState(false)
    const [importFile, setImportFile]   = useState(null)
    const [duplicating, setDuplicating] = useState(null)

    const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
        queryKey: ['stock-logs', logAction, logPage],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (logAction !== 'all') params.set('action', logAction)
            params.set('page', logPage)
            params.set('size', '30')
            const { data } = await axios.get(`/api/product/stock-logs?${params}`)
            return data.data
        },
        enabled: activeTab === 'stocklogs',
    })

    const handleDuplicate = async (productId) => {
        setDuplicating(productId)
        try {
            await axios.post('/api/product/duplicate', { id: productId })
            showToast('success', 'পণ্য কপি হয়েছে।')
        } catch { showToast('error', 'কপি ব্যর্থ।') }
        finally { setDuplicating(null) }
    }

    const { data: summaryData, loading: summaryLoading } = useFetch('/api/product/summary')
    const s = summaryData?.data || {}

    const { data: categoryData } = useFetch('/api/category?deleteType=SD&&size=10000')
    const categoryOptions = useMemo(() => categoryData?.data?.map(c => ({ label: c.name, value: c._id })) || [], [categoryData])

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => setSearchQuery(searchInput), 400)
        return () => clearTimeout(searchTimer.current)
    }, [searchInput])

    const columns = useMemo(() => columnConfig(DT_PRODUCT_COLUMN), [])

    const [togglingId, setTogglingId] = useState(null)
    const handleToggleStatus = async (productId, currentActive) => {
        setTogglingId(productId)
        try {
            await axios.post('/api/product/toggle-status', { id: productId })
            showToast('success', currentActive ? 'পণ্য নিষ্ক্রিয় হয়েছে।' : 'পণ্য সক্রিয় হয়েছে।')
            // force datatable refetch via key change trick — just toast is enough
        } catch { showToast('error', 'পরিবর্তন ব্যর্থ।') }
        finally { setTogglingId(null) }
    }

    const action = useCallback((row, deleteType, handleDelete) => {
        const editHref = ADMIN_PRODUCT_EDIT(row.original._id)
        const productId = row.original._id
        const isActive  = row.original.isActive !== false
        return [
            editHref && <EditAction key="edit" href={editHref} />,
            <button key="duplicate" title="Duplicate"
                onClick={() => handleDuplicate(productId)}
                disabled={duplicating === productId}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-40">
                {duplicating === productId ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
            </button>,
            <button key="toggle" title={isActive ? 'Deactivate' : 'Activate'}
                onClick={() => handleToggleStatus(productId, isActive)}
                disabled={togglingId === productId}
                className={`inline-flex items-center justify-center h-7 w-7 rounded-md border transition-colors ${
                    isActive ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50' : 'border-slate-300 text-slate-400 hover:bg-slate-50'
                }`}>
                {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>,
            <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
        ].filter(Boolean)
    }, [duplicating, togglingId])

    const fetchUrl = useMemo(() => {
        const params = new URLSearchParams()
        if (stockFilter !== 'all')   params.set('stock', stockFilter)
        if (statusFilter !== 'all')  params.set('status', statusFilter)
        if (categoryFilter)          params.set('category', categoryFilter)
        if (searchQuery)             params.set('search', searchQuery)
        return '/api/product' + (params.toString() ? `?${params}` : '')
    }, [stockFilter, statusFilter, categoryFilter, searchQuery])

    const stockLabel    = STOCK_FILTERS.find(f => f.key === stockFilter)?.label || 'All Stock'
    const statusLabel   = STATUS_FILTERS.find(f => f.key === statusFilter)?.label || 'All Status'
    const categoryLabel = categoryOptions.find(c => c.value === categoryFilter)?.label || 'All Categories'

    const summaryCards = [
        { label: 'Total Products',   value: s.totalProducts   ?? '—', icon: Archive,       color: 'text-violet-600',  bar: 'bg-violet-500' },
        { label: 'Active Products',  value: s.activeProducts  ?? '—', icon: Eye,            color: 'text-emerald-600', bar: 'bg-emerald-500' },
        { label: 'Out of Stock',     value: s.outOfStock      ?? '—', icon: AlertTriangle,  color: 'text-red-600',     bar: 'bg-red-500',   sub: `Low Stock: ${s.lowStock ?? 0}` },
        { label: 'Total In Stock',   value: (s.totalStock ?? 0).toLocaleString(), icon: Package, color: 'text-blue-600', bar: 'bg-blue-500' },
        { label: 'Cost Value',       value: fmt(s.totalCostValue),  icon: TrendingUp, color: 'text-amber-600', bar: 'bg-amber-500' },
        { label: 'Sell Value',       value: fmt(s.totalSellValue),  icon: TrendingUp, color: 'text-primary',   bar: 'bg-primary' },
        { label: 'Potential Profit', value: fmt(s.potentialProfit), icon: TrendingUp, color: 'text-teal-600', bar: 'bg-teal-500' },
    ]

    const TABS = [
        { key: 'products',   label: 'Products',    href: null },
        { key: 'categories', label: 'Categories',  href: ADMIN_CATEGORY_SHOW },
        { key: 'stocklogs',  label: 'Stock Logs',  href: null },
        { key: 'sync',       label: 'Product Sync', href: null },
    ]

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Products & Stock</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage inventory, pricing and product catalog.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowImport(true)}>
                        <Upload className="w-3.5 h-3.5" /> CSV Import
                    </Button>
                    <Button asChild size="sm" className="gap-1.5 h-8 text-xs">
                        <Link href={ADMIN_PRODUCT_ADD}><Plus className="w-3.5 h-3.5" /> New Product</Link>
                    </Button>
                </div>
            </div>

            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Summary Cards */}
            {summaryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl border border-border/60 bg-muted/30 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {summaryCards.map((c, i) => <SummaryCard key={c.label} {...c} index={i} />)}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border/60 pb-0">
                {TABS.map(tab => (
                    tab.href ? (
                        <Link key={tab.key} href={tab.href}
                            className="px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all -mb-px"
                        >
                            {tab.label}
                        </Link>
                    ) : (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all duration-150 -mb-px",
                                activeTab === tab.key
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                        >
                            {tab.label}
                        </button>
                    )
                ))}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by name or code..."
                        className="h-8 pl-7 text-xs w-52"
                    />
                </div>

                {/* Category filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs max-w-[140px] truncate", categoryFilter && "border-primary text-primary bg-primary/5")}>
                            <span className="truncate">{categoryLabel}</span> <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
                        <DropdownMenuItem className={cn('text-xs cursor-pointer', !categoryFilter && 'text-primary font-semibold')} onClick={() => setCategoryFilter('')}>All Categories</DropdownMenuItem>
                        {categoryOptions.map(c => (
                            <DropdownMenuItem key={c.value} className={cn('text-xs cursor-pointer', categoryFilter === c.value && 'text-primary font-semibold')} onClick={() => setCategoryFilter(c.value)}>
                                {c.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", statusFilter !== 'all' && "border-primary text-primary bg-primary/5")}>
                            {statusLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                        {STATUS_FILTERS.map(f => (
                            <DropdownMenuItem key={f.key} className={cn('text-xs cursor-pointer', statusFilter === f.key && 'text-primary font-semibold')} onClick={() => setStatusFilter(f.key)}>
                                {f.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Stock filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs", stockFilter !== 'all' && "border-primary text-primary bg-primary/5")}>
                            {stockLabel} <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                        {STOCK_FILTERS.map(f => (
                            <DropdownMenuItem key={f.key} className={cn("text-xs cursor-pointer", stockFilter === f.key && "text-primary font-semibold")} onClick={() => setStockFilter(f.key)}>
                                {f.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear filters */}
                {(searchQuery || categoryFilter || statusFilter !== 'all' || stockFilter !== 'all') && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setCategoryFilter(''); setStatusFilter('all'); setStockFilter('all') }}>
                        <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                )}
            </div>

            {/* CSV Import modal */}
            {showImport && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowImport(false)}>
                    <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><Upload className="w-4 h-4 text-primary" />CSV / Excel Import</h3>
                            <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <p className="text-xs text-muted-foreground">CSV বা Excel ফাইল আপলোড করুন। কলাম: name, sellingPrice, mrp, stock, category</p>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <input type="file" accept=".csv,.xlsx,.xls" onChange={e => setImportFile(e.target.files?.[0] || null)}
                                className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary" />
                            {importFile && <p className="text-xs text-emerald-600 font-medium">{importFile.name}</p>}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs"
                                onClick={() => { const a = document.createElement('a'); a.href = '/api/product/import-sample'; a.download = 'sample.csv'; a.click() }}>
                                Sample Download
                            </Button>
                            <Button size="sm" className="flex-1 text-xs" disabled={!importFile}
                                onClick={async () => {
                                    if (!importFile) return
                                    const fd = new FormData(); fd.append('file', importFile)
                                    try {
                                        await axios.post('/api/product/import', fd)
                                        showToast('success', 'ইম্পোর্ট সফল।')
                                        setShowImport(false); setImportFile(null)
                                    } catch { showToast('error', 'ইম্পোর্ট ব্যর্থ।') }
                                }}>
                                Import
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold text-foreground">Manage Products</h4>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        key={fetchUrl}
                        queryKey={`product-${stockFilter}`}
                        fetchUrl={fetchUrl}
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/product/export"
                        deleteEndpoint="/api/product/delete"
                        deleteType="SD"
                        trashView={`${ADMIN_TRASH}?trashof=product`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
            )}

            {/* STOCK LOGS TAB */}
            {activeTab === 'stocklogs' && (
            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-semibold">Stock Logs</h4>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={cn('h-7 gap-1 text-xs', logAction !== 'all' && 'border-primary text-primary bg-primary/5')}>
                                        <Filter className="w-3 h-3" />
                                        {LOG_ACTIONS.find(a => a.key === logAction)?.label || 'All Actions'}
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                    {LOG_ACTIONS.map(a => (
                                        <DropdownMenuItem key={a.key} className={cn('text-xs cursor-pointer', logAction === a.key && 'text-primary font-semibold')}
                                            onClick={() => { setLogAction(a.key); setLogPage(1) }}>{a.label}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetchLogs()}>
                                <RefreshCw className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {logsLoading ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : !logsData?.logs?.length ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">কোনো স্টক লগ নেই।</div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b bg-muted/30">
                                    {['সময়','পণ্য','অ্যাকশন','কারণ','পরিবর্তন','আগে → পরে','ইউজার'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {logsData.logs.map((log, i) => {
                                        const ac = LOG_ACTION_LABELS[log.action] || { label: log.action, cls: 'bg-gray-100 text-gray-700' }
                                        return (
                                            <tr key={log._id} className={cn('border-b', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                                                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleString('en-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-2.5 font-medium max-w-[160px] truncate">{log.product?.name || log.productName || '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', ac.cls)}>{ac.label}</span>
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground max-w-[140px] truncate">{log.reason || log.reference || '—'}</td>
                                                <td className="px-4 py-2.5 font-bold">
                                                    <span className={log.change < 0 ? 'text-red-600' : 'text-emerald-600'}>
                                                        {log.change > 0 ? `+${log.change}` : log.change}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-muted-foreground">{log.before} → {log.after}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{log.performedBy || 'system'}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {logsData.total > 30 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t">
                                <p className="text-xs text-muted-foreground">মোট {logsData.total} রেকর্ড</p>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-6 w-6 p-0" disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)}>
                                        <ChevronLeft className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs px-2 py-1">{logPage}</span>
                                    <Button variant="outline" size="sm" className="h-6 w-6 p-0" disabled={logPage * 30 >= logsData.total} onClick={() => setLogPage(p => p + 1)}>
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </CardContent>
            </Card>
            )}

            {/* PRODUCT SYNC TAB */}
            {activeTab === 'sync' && (
            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Product Sync</h4>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={async () => {
                            try {
                                await axios.post('/api/product/sync')
                                showToast('success', 'সিঙ্ক সম্পন্ন।')
                            } catch { showToast('info', 'সিঙ্ক করার কিছু নেই।') }
                        }}>
                            <RefreshCw className="w-3 h-3" /> Auto Sync
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                    <ProductSyncPanel />
                </CardContent>
            </Card>
            )}
        </div>
    )
}

function ProductSyncPanel() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['product-sync'],
        queryFn: async () => {
            const { data } = await axios.get('/api/product/sync')
            return data.data || { needsMapping: [], mapped: [] }
        },
    })
    const unmapped = data?.needsMapping || []
    const mapped   = data?.mapped       || []

    const handleMap = async (itemId, productId) => {
        try {
            await axios.post('/api/product/sync', { itemId, productId })
            showToast('success', 'ম্যাপিং সেভ হয়েছে।')
            refetch()
        } catch { showToast('error', 'ম্যাপিং ব্যর্থ।') }
    }

    if (isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{unmapped.length}</p>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">Needs Mapping</p>
                    <p className="text-[10px] text-muted-foreground mt-1">অর্ডার আইটেম যা এখনো প্রোডাক্টের সাথে ম্যাচ হয়নি</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{mapped.length}</p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">Mapped</p>
                    <p className="text-[10px] text-muted-foreground mt-1">সফলভাবে ম্যাপ করা আইটেম</p>
                </div>
            </div>
            {unmapped.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unmatched Order Items</p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-xs">
                            <thead><tr className="border-b bg-muted/30">
                                {['Product Name from Order', 'Source', 'Count', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {unmapped.map((item, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="px-4 py-2.5 font-medium">{item.name}</td>
                                        <td className="px-4 py-2.5 text-muted-foreground capitalize">{item.source || '—'}</td>
                                        <td className="px-4 py-2.5 text-muted-foreground">{item.count || 1}</td>
                                        <td className="px-4 py-2.5">
                                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                                                onClick={() => handleMap(item._id, item.suggestedProductId)}>
                                                Auto Match
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-6 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
                    সব অর্ডার আইটেম ম্যাপ করা আছে।
                </div>
            )}
        </div>
    )
}

export default ShowProduct