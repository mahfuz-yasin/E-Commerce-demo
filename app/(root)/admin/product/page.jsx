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
import { useCallback, useMemo, useState } from "react"
import { Plus, ChevronDown, AlertTriangle, Package, TrendingUp, Archive } from "lucide-react"
import useFetch from "@/hooks/useFetch"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
]

const STOCK_FILTERS = [
    { key: 'all',       label: 'All Stock' },
    { key: 'instock',   label: 'In Stock' },
    { key: 'low',       label: 'Low Stock (≤5)' },
    { key: 'outofstock', label: 'Out of Stock' },
]

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

const ShowProduct = () => {
    const [stockFilter, setStockFilter] = useState('all')
    const [activeTab, setActiveTab]     = useState('products')

    const { data: summaryData, loading: summaryLoading } = useFetch('/api/product/summary')
    const s = summaryData?.data || {}

    const columns = useMemo(() => columnConfig(DT_PRODUCT_COLUMN), [])

    const action = useCallback((row, deleteType, handleDelete) => {
        const editHref = ADMIN_PRODUCT_EDIT(row.original._id)
        return [
            editHref && <EditAction key="edit" href={editHref} />,
            <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
        ].filter(Boolean)
    }, [])

    const fetchUrl = useMemo(() => {
        const params = new URLSearchParams()
        if (stockFilter === 'outofstock') params.set('globalFilter', '0')
        return '/api/product' + (params.toString() ? `?${params}` : '')
    }, [stockFilter])

    const stockLabel = STOCK_FILTERS.find(f => f.key === stockFilter)?.label || 'All Stock'

    const summaryCards = [
        { label: 'Total Products', value: s.totalProducts ?? '—', icon: Archive,       color: 'text-violet-600', bar: 'bg-violet-500' },
        { label: 'Out of Stock',   value: s.outOfStock    ?? '—', icon: AlertTriangle,  color: 'text-red-600',    bar: 'bg-red-500',    sub: `Low Stock: ${s.lowStock ?? 0}` },
        { label: 'Total In Stock', value: (s.totalStock ?? 0).toLocaleString(), icon: Package, color: 'text-emerald-600', bar: 'bg-emerald-500' },
        { label: 'Cost Value',     value: fmt(s.totalCostValue),  icon: TrendingUp, color: 'text-amber-600', bar: 'bg-amber-500' },
        { label: 'Sell Value',     value: fmt(s.totalSellValue),  icon: TrendingUp, color: 'text-primary',   bar: 'bg-primary' },
        { label: 'Potential Profit', value: fmt(s.potentialProfit), icon: TrendingUp, color: 'text-teal-600', bar: 'bg-teal-500' },
    ]

    const TABS = [
        { key: 'products',   label: 'Products',   href: null },
        { key: 'categories', label: 'Categories', href: ADMIN_CATEGORY_SHOW },
    ]

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Products & Stock</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage inventory, pricing and product catalog.</p>
                </div>
                <Button asChild size="sm" className="gap-1.5">
                    <Link href={ADMIN_PRODUCT_ADD}><Plus className="w-4 h-4" /> New Product</Link>
                </Button>
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
            </div>

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
        </div>
    )
}

export default ShowProduct