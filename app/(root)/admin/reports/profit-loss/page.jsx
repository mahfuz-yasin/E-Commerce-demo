'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_DASHBOARD, ADMIN_REPORTS_PROFIT_LOSS } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { TrendingUp, TrendingDown, ShoppingBag, Truck, Package } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_REPORTS_PROFIT_LOSS, label: 'Profit & Loss Report' },
]

const platformColors = {
    facebook: 'bg-blue-100 text-blue-700',
    tiktok: 'bg-pink-100 text-pink-700',
    google: 'bg-yellow-100 text-yellow-700',
    instagram: 'bg-purple-100 text-purple-700',
    organic: 'bg-green-100 text-green-700',
    direct: 'bg-gray-100 text-gray-700',
    other: 'bg-orange-100 text-orange-700',
}

const platformLabels = {
    facebook: '📘 Facebook',
    tiktok: '🎵 TikTok',
    google: '🔍 Google',
    instagram: '📸 Instagram',
    organic: '🌿 Organic',
    direct: '🔗 Direct',
    other: '📌 Other',
}

export default function ProfitLossPage() {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(today)
    const [platform, setPlatform] = useState('all')
    const [queryParams, setQueryParams] = useState({ startDate: firstDay, endDate: today, platform: 'all' })

    const { data, isLoading } = useQuery({
        queryKey: ['profit-loss', queryParams],
        queryFn: async () => {
            const { data } = await axios.get(`/api/reports/profit-loss?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}&platform=${queryParams.platform}`)
            return data.data
        }
    })

    const handleFilter = () => setQueryParams({ startDate, endDate, platform })

    const stat = data?.summary

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="mb-4 shadow-sm">
                <CardContent className="pt-4">
                    <div className='flex flex-wrap gap-3 items-end'>
                        <div>
                            <Label>শুরুর তারিখ</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>শেষের তারিখ</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>Platform</Label>
                            <select className='border rounded px-3 py-2 text-sm' value={platform} onChange={e => setPlatform(e.target.value)}>
                                <option value="all">সব</option>
                                <option value="facebook">Facebook</option>
                                <option value="tiktok">TikTok</option>
                                <option value="google">Google</option>
                                <option value="organic">Organic</option>
                            </select>
                        </div>
                        <Button onClick={handleFilter} disabled={isLoading}>রিপোর্ট দেখুন</Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <p className='text-center py-10 text-gray-500'>লোড হচ্ছে...</p>
            ) : stat && (
                <>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                        <Card className="shadow-sm">
                            <CardContent className="pt-4">
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-green-100 rounded-lg'><TrendingUp className='w-5 h-5 text-green-600' /></div>
                                    <div>
                                        <p className='text-xs text-gray-500'>মোট আয়</p>
                                        <p className='font-bold text-xl text-green-600'>৳{stat.totalRevenue?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="pt-4">
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-red-100 rounded-lg'><Package className='w-5 h-5 text-red-600' /></div>
                                    <div>
                                        <p className='text-xs text-gray-500'>পণ্য ক্রয় খরচ</p>
                                        <p className='font-bold text-xl text-red-600'>৳{stat.totalPurchaseCost?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="pt-4">
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-orange-100 rounded-lg'><Truck className='w-5 h-5 text-orange-600' /></div>
                                    <div>
                                        <p className='text-xs text-gray-500'>শিপিং খরচ</p>
                                        <p className='font-bold text-xl text-orange-600'>৳{stat.totalShipping?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={`shadow-sm border-2 ${stat.netProfit >= 0 ? 'border-green-400' : 'border-red-400'}`}>
                            <CardContent className="pt-4">
                                <div className='flex items-center gap-3'>
                                    <div className={`p-2 rounded-lg ${stat.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {stat.netProfit >= 0
                                            ? <TrendingUp className='w-5 h-5 text-green-600' />
                                            : <TrendingDown className='w-5 h-5 text-red-600' />}
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500'>নেট প্রফিট/লস</p>
                                        <p className={`font-bold text-xl ${stat.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ৳{stat.netProfit?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='grid md:grid-cols-2 gap-4 mb-4'>
                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-3">
                                <h4 className='font-semibold flex items-center gap-2'><ShoppingBag className='w-4 h-4' /> অর্ডার সারসংক্ষেপ</h4>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-2 text-sm">
                                {[
                                    ['মোট অর্ডার', stat.totalOrders],
                                    ['ডেলিভার্ড', stat.deliveredOrders],
                                    ['ক্যান্সেল', stat.cancelledOrders],
                                    ['পেন্ডিং/প্রসেসিং', stat.pendingOrders],
                                    ['ক্যান্সেল রেট', stat.cancelRate],
                                ].map(([label, value]) => (
                                    <div key={label} className='flex justify-between py-1 border-b last:border-0'>
                                        <span className='text-gray-600'>{label}</span>
                                        <span className='font-semibold'>{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-3">
                                <h4 className='font-semibold'>Platform ভিত্তিক বিক্রয়</h4>
                            </CardHeader>
                            <CardContent className="pt-3">
                                {data?.platformBreakdown && Object.entries(data.platformBreakdown)
                                    .filter(([, v]) => v.orders > 0)
                                    .sort(([, a], [, b]) => b.revenue - a.revenue)
                                    .map(([plt, v]) => (
                                        <div key={plt} className='flex items-center justify-between py-2 border-b last:border-0 text-sm'>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${platformColors[plt] || 'bg-gray-100 text-gray-700'}`}>
                                                {platformLabels[plt] || plt}
                                            </span>
                                            <div className='text-right'>
                                                <span className='font-bold text-green-600'>৳{v.revenue?.toLocaleString()}</span>
                                                <span className='text-gray-400 text-xs ml-2'>({v.orders} অর্ডার)</span>
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
