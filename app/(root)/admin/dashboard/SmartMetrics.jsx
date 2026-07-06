'use client'
import useFetch from '@/hooks/useFetch'
import { TrendingUp, TrendingDown, ShoppingBag, Shield, Zap, Package } from 'lucide-react'
import Link from 'next/link'
import { ADMIN_REPORTS_PROFIT_LOSS, ADMIN_REPORTS_ADS_SOURCE, ADMIN_FRAUD_GUARD, ADMIN_FLASH_SALE, ADMIN_REPORTS_STOCK } from '@/routes/AdminPanelRoute'

const platformEmoji = { facebook: '📘', tiktok: '🎵', google: '🔍', organic: '🌿', instagram: '📸', direct: '🔗', other: '📌' }

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

    return (
        <div className='mt-6'>
            <h4 className='font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3'>এই মাসের স্মার্ট সারসংক্ষেপ</h4>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4'>
                {/* Profit/Loss */}
                <Link href={ADMIN_REPORTS_PROFIT_LOSS}>
                    <div className={`p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 ${pl?.netProfit >= 0 ? 'border-l-green-500 bg-green-50 dark:bg-card' : 'border-l-red-500 bg-red-50 dark:bg-card'}`}>
                        <div className='flex items-center gap-2 mb-1'>
                            {pl?.netProfit >= 0 ? <TrendingUp className='w-4 h-4 text-green-600' /> : <TrendingDown className='w-4 h-4 text-red-500' />}
                            <span className='text-xs text-gray-500'>নেট প্রফিট</span>
                        </div>
                        <p className={`text-xl font-bold ${pl?.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            ৳{pl?.netProfit?.toLocaleString() || '—'}
                        </p>
                        <p className='text-xs text-gray-400 mt-1'>আয়: ৳{pl?.totalRevenue?.toLocaleString() || 0}</p>
                    </div>
                </Link>

                {/* Delivered orders */}
                <Link href={ADMIN_REPORTS_PROFIT_LOSS}>
                    <div className='p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-blue-50 dark:bg-card'>
                        <div className='flex items-center gap-2 mb-1'>
                            <ShoppingBag className='w-4 h-4 text-blue-600' />
                            <span className='text-xs text-gray-500'>মোট অর্ডার</span>
                        </div>
                        <p className='text-xl font-bold text-blue-700'>{pl?.totalOrders || '—'}</p>
                        <p className='text-xs text-gray-400 mt-1'>ক্যান্সেল রেট: {pl?.cancelRate || '—'}</p>
                    </div>
                </Link>

                {/* Low stock alert */}
                <Link href={ADMIN_REPORTS_STOCK}>
                    <div className={`p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 ${stockData?.data?.summary?.outOfStock > 0 ? 'border-l-red-500 bg-red-50 dark:bg-card' : 'border-l-orange-500 bg-orange-50 dark:bg-card'}`}>
                        <div className='flex items-center gap-2 mb-1'>
                            <Package className='w-4 h-4 text-orange-600' />
                            <span className='text-xs text-gray-500'>স্টক অ্যালার্ট</span>
                        </div>
                        <p className='text-xl font-bold text-orange-700'>{stockData?.data?.summary?.lowStock || 0}</p>
                        <p className='text-xs text-gray-400 mt-1'>স্টক শেষ: {stockData?.data?.summary?.outOfStock || 0}</p>
                    </div>
                </Link>

                {/* Fraud guard */}
                <Link href={ADMIN_FRAUD_GUARD}>
                    <div className='p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-purple-50 dark:bg-card'>
                        <div className='flex items-center gap-2 mb-1'>
                            <Shield className='w-4 h-4 text-purple-600' />
                            <span className='text-xs text-gray-500'>Fraud Guard</span>
                        </div>
                        <p className='text-xl font-bold text-purple-700'>সক্রিয়</p>
                        <p className='text-xs text-gray-400 mt-1'>Phone + IP Block</p>
                    </div>
                </Link>
            </div>

            {/* Ads Platform Breakdown */}
            {topPlatforms.length > 0 && (
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                    {topPlatforms.map(([plt, v]) => (
                        <Link key={plt} href={ADMIN_REPORTS_ADS_SOURCE}>
                            <div className='p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-card'>
                                <p className='text-sm font-semibold mb-1'>{platformEmoji[plt]} {plt.charAt(0).toUpperCase() + plt.slice(1)}</p>
                                <p className='text-lg font-bold'>৳{v.revenue?.toLocaleString()}</p>
                                <div className='flex gap-3 text-xs mt-1'>
                                    <span className='text-gray-500'>{v.totalOrders} অর্ডার</span>
                                    <span className='text-green-600'>{v.successRate}</span>
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
