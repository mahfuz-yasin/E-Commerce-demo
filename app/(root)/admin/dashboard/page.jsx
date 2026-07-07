'use client'
import React, { Suspense, useState } from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrderOverview } from './OrderOverview'
import { OrderStatus } from './OrderStatus'
import LatestOrder from './LatestOrder'
import LatestReview from './LatestReview'
import { ADMIN_ORDER_SHOW, ADMIN_REVIEW_SHOW } from '@/routes/AdminPanelRoute'
import SmartMetrics from './SmartMetrics'
import LiveOrderStats from './LiveOrderStats'
import ProfitBreakdown from './ProfitBreakdown'
import AssetLiabilities from './AssetLiabilities'
import ProductBreakdown from './ProductBreakdown'
import DashboardCharts from './DashboardCharts'

const DashboardCard = ({ title, href, children, className = '' }) => (
    <Card className={`shadow-sm border border-border/60 rounded-xl overflow-hidden ${className}`}>
        <CardHeader className="px-5 py-4 border-b bg-muted/30 flex-row items-center justify-between space-y-0">
            <span className='font-semibold text-sm text-foreground'>{title}</span>
            {href && (
                <Button type="button" size="sm" variant="ghost" asChild className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">
                    <Link href={href}>View All →</Link>
                </Button>
            )}
        </CardHeader>
        <CardContent className='p-0'>{children}</CardContent>
    </Card>
)

const LoadingFallback = () => (
    <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading...
        </div>
    </div>
)

const GLOBAL_FILTERS = [
    { key: 'today',      label: 'Today' },
    { key: 'yesterday',  label: 'Yesterday' },
    { key: 'this_week',  label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year',  label: 'This Year' },
]

const AdminDashboard = () => {
    const [globalFilter, setGlobalFilter] = useState('this_month')

    return (
        <div className='space-y-6'>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-xl p-1">
                    {GLOBAL_FILTERS.map(f => (
                        <button key={f.key}
                            onClick={() => setGlobalFilter(f.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                globalFilter === f.key
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <Suspense fallback={<LoadingFallback />}>
                <CountOverview />
            </Suspense>

            <LiveOrderStats filter={globalFilter} />

            <SmartMetrics />

            <ProfitBreakdown filter={globalFilter} />

            <AssetLiabilities />

            <DashboardCharts filter={globalFilter} />

            <DashboardCard title="Product Breakdown" href={null}>
                <div className="p-5">
                    <ProductBreakdown filter={globalFilter} />
                </div>
            </DashboardCard>

            <Suspense fallback={<LoadingFallback />}>
                <QuickAdd />
            </Suspense>

            <div className='grid lg:grid-cols-[2fr_1fr] gap-5'>
                <DashboardCard title="Order Overview" href={ADMIN_ORDER_SHOW}>
                    <div className="p-5">
                        <Suspense fallback={<LoadingFallback />}>
                            <OrderOverview />
                        </Suspense>
                    </div>
                </DashboardCard>
                <DashboardCard title="Order Status" href={ADMIN_ORDER_SHOW}>
                    <div className="p-5">
                        <Suspense fallback={<LoadingFallback />}>
                            <OrderStatus />
                        </Suspense>
                    </div>
                </DashboardCard>
            </div>

            <div className='grid lg:grid-cols-[2fr_1fr] gap-5'>
                <DashboardCard title="Latest Orders" href={ADMIN_ORDER_SHOW}>
                    <div className='lg:h-[350px] overflow-auto'>
                        <Suspense fallback={<LoadingFallback />}>
                            <LatestOrder />
                        </Suspense>
                    </div>
                </DashboardCard>
                <DashboardCard title="Latest Reviews" href={ADMIN_REVIEW_SHOW}>
                    <div className='lg:h-[350px] overflow-auto'>
                        <Suspense fallback={<LoadingFallback />}>
                            <LatestReview />
                        </Suspense>
                    </div>
                </DashboardCard>
            </div>
        </div>
    )
}

export default AdminDashboard