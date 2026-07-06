'use client'
import useFetch from '@/hooks/useFetch'
import { TrendingUp, TrendingDown, ShoppingBag, Shield, Package, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { ADMIN_REPORTS_PROFIT_LOSS, ADMIN_REPORTS_ADS_SOURCE, ADMIN_FRAUD_GUARD, ADMIN_REPORTS_STOCK } from '@/routes/AdminPanelRoute'

const platformIcon = { facebook: '📘', tiktok: '🎵', google: '🔍', organic: '🌿', instagram: '📸', direct: '🔗', other: '📌' }

const MetricCard = ({ href, icon, label, value, sub, accent }) => {
    const accentMap = {
        green:  { bar: 'bg-emerald-500', val: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        red:    { bar: 'bg-red-500',     val: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30' },
        blue:   { bar: 'bg-primary',     val: 'text-primary',                            bg: 'bg-primary/5 dark:bg-primary/10' },
        orange: { bar: 'bg-amber-500',   val: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
        purple: { bar: 'bg-purple-500',  val: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-950/30' },
    }
    const c = accentMap[accent] || accentMap.blue
    return (
        <Link href={href}>
            <div className={`relative overflow-hidden rounded-xl border border-border/60 shadow-sm cursor-pointer hover:shadow-md transition-all duration-150 p-4 ${c.bg}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} rounded-l-xl`} />
                <div className='flex items-center gap-2 mb-2 ml-1'>
                    <div className={`${c.val}`}>{icon}</div>
                    <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{label}</span>
                </div>
                <p className={`text-2xl font-bold ml-1 ${c.val}`}>{value}</p>
                {sub && <p className='text-xs text-muted-foreground mt-1 ml-1'>{sub}</p>}
            </div>
        </Link>
    )
}

const SmartMetrics = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    const { data: plData } = useFetch(`/api/reports/profit-loss?startDate=${firstDay}&endDate=${today}`)
    const { data: adsData } = useFetch(`/api/reports/ads-source?startDate=${firstDay}&endDate=${today}`)
    const { data: stockData } = useFetch('/api/reports/stock?lowStock=true')

    const pl = plData?.data?.summary
    const breakdown = adsData?.data?.breakdown || {}
    const topPlatforms = Object.entries(breakdown)
        .filter(([, v]) => v.totalOrders > 0)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 4)

    const isProfit = (pl?.netProfit ?? 0) >= 0

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>This Month — Smart Summary</h4>
                <Link href={ADMIN_REPORTS_PROFIT_LOSS} className='text-xs text-primary hover:underline'>View full report →</Link>
            </div>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                <MetricCard
                    href={ADMIN_REPORTS_PROFIT_LOSS}
                    icon={isProfit ? <TrendingUp className='w-4 h-4' /> : <TrendingDown className='w-4 h-4' />}
                    label="Net Profit"
                    value={`৳${pl?.netProfit?.toLocaleString() ?? '—'}`}
                    sub={`Revenue: ৳${pl?.totalRevenue?.toLocaleString() ?? 0}`}
                    accent={isProfit ? 'green' : 'red'}
                />
                <MetricCard
                    href={ADMIN_REPORTS_PROFIT_LOSS}
                    icon={<ShoppingBag className='w-4 h-4' />}
                    label="Total Orders"
                    value={pl?.totalOrders ?? '—'}
                    sub={`Cancel rate: ${pl?.cancelRate ?? '—'}`}
                    accent="blue"
                />
                <MetricCard
                    href={ADMIN_REPORTS_STOCK}
                    icon={<Package className='w-4 h-4' />}
                    label="Stock Alerts"
                    value={stockData?.data?.summary?.lowStock ?? 0}
                    sub={`Out of stock: ${stockData?.data?.summary?.outOfStock ?? 0}`}
                    accent={stockData?.data?.summary?.outOfStock > 0 ? 'red' : 'orange'}
                />
                <MetricCard
                    href={ADMIN_FRAUD_GUARD}
                    icon={<Shield className='w-4 h-4' />}
                    label="Fraud Guard"
                    value="Active"
                    sub="Phone + IP blocking"
                    accent="purple"
                />
            </div>

            {topPlatforms.length > 0 && (
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                    {topPlatforms.map(([plt, v]) => (
                        <Link key={plt} href={ADMIN_REPORTS_ADS_SOURCE}>
                            <div className='p-3.5 rounded-xl border border-border/60 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all bg-card'>
                                <div className='flex items-center gap-1.5 mb-2'>
                                    <span className='text-base'>{platformIcon[plt]}</span>
                                    <span className='text-xs font-semibold text-foreground capitalize'>{plt}</span>
                                </div>
                                <p className='text-lg font-bold text-foreground'>৳{v.revenue?.toLocaleString()}</p>
                                <div className='flex gap-3 text-xs mt-1 text-muted-foreground'>
                                    <span>{v.totalOrders} orders</span>
                                    <span className='text-emerald-600 font-medium'>{v.successRate}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SmartMetrics
