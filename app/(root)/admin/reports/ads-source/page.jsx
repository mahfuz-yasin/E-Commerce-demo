'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_DASHBOARD, ADMIN_REPORTS_ADS_SOURCE } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_REPORTS_ADS_SOURCE, label: 'Ads Source Report' },
]

const platformColors = {
    facebook: 'bg-blue-50 border-blue-200',
    tiktok: 'bg-pink-50 border-pink-200',
    google: 'bg-yellow-50 border-yellow-200',
    instagram: 'bg-purple-50 border-purple-200',
    organic: 'bg-green-50 border-green-200',
    direct: 'bg-gray-50 border-gray-200',
    other: 'bg-orange-50 border-orange-200',
}

const platformLabels = {
    facebook: '📘 Facebook Ads',
    tiktok: '🎵 TikTok Ads',
    google: '🔍 Google Ads',
    instagram: '📸 Instagram Ads',
    organic: '🌿 Organic',
    direct: '🔗 Direct',
    other: '📌 Other',
}

export default function AdsSourceReportPage() {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(today)
    const [queryParams, setQueryParams] = useState({ startDate: firstDay, endDate: today })

    const { data, isLoading } = useQuery({
        queryKey: ['ads-source', queryParams],
        queryFn: async () => {
            const { data } = await axios.get(`/api/reports/ads-source?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}`)
            return data.data
        }
    })

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
                        <Button onClick={() => setQueryParams({ startDate, endDate })} disabled={isLoading}>রিপোর্ট দেখুন</Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <p className='text-center py-10 text-gray-500'>লোড হচ্ছে...</p>
            ) : data && (
                <>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4'>
                        {data.breakdown && Object.entries(data.breakdown)
                            .filter(([, v]) => v.totalOrders > 0)
                            .sort(([, a], [, b]) => b.revenue - a.revenue)
                            .map(([plt, v]) => (
                                <Card key={plt} className={`shadow-sm border ${platformColors[plt] || ''}`}>
                                    <CardContent className="pt-3 pb-3">
                                        <p className='text-xs font-semibold mb-2'>{platformLabels[plt] || plt}</p>
                                        <p className='text-2xl font-bold'>{v.totalOrders}</p>
                                        <p className='text-xs text-gray-500'>অর্ডার</p>
                                        <p className='text-sm font-semibold text-green-600 mt-1'>৳{v.revenue?.toLocaleString()}</p>
                                        <div className='flex gap-2 mt-1 text-xs'>
                                            <span className='text-green-600'>✓ {v.successRate}</span>
                                            <span className='text-red-500'>✗ {v.cancelRate}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>

                    <div className='grid md:grid-cols-2 gap-4'>
                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-3">
                                <h4 className='font-semibold'>📘 Facebook Campaign Breakdown</h4>
                            </CardHeader>
                            <CardContent className="pt-3">
                                {!data.facebookCampaigns || !Object.keys(data.facebookCampaigns).length ? (
                                    <p className='text-gray-400 text-sm'>কোনো ক্যাম্পেইন ডেটা নেই।</p>
                                ) : (
                                    <table className='w-full text-sm'>
                                        <thead><tr className='border-b'><th className='text-left p-1'>Campaign</th><th className='text-right p-1'>Orders</th><th className='text-right p-1'>Revenue</th></tr></thead>
                                        <tbody>
                                            {Object.entries(data.facebookCampaigns).map(([cid, v]) => (
                                                <tr key={cid} className='border-b hover:bg-gray-50'>
                                                    <td className='p-1 text-xs font-mono truncate max-w-[120px]'>{cid}</td>
                                                    <td className='p-1 text-right'>{v.orders}</td>
                                                    <td className='p-1 text-right font-semibold text-green-600'>৳{v.revenue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-3">
                                <h4 className='font-semibold'>🎵 TikTok Campaign Breakdown</h4>
                            </CardHeader>
                            <CardContent className="pt-3">
                                {!data.tiktokCampaigns || !Object.keys(data.tiktokCampaigns).length ? (
                                    <p className='text-gray-400 text-sm'>কোনো ক্যাম্পেইন ডেটা নেই।</p>
                                ) : (
                                    <table className='w-full text-sm'>
                                        <thead><tr className='border-b'><th className='text-left p-1'>Campaign</th><th className='text-right p-1'>Orders</th><th className='text-right p-1'>Revenue</th></tr></thead>
                                        <tbody>
                                            {Object.entries(data.tiktokCampaigns).map(([cid, v]) => (
                                                <tr key={cid} className='border-b hover:bg-gray-50'>
                                                    <td className='p-1 text-xs font-mono truncate max-w-[120px]'>{cid}</td>
                                                    <td className='p-1 text-right'>{v.orders}</td>
                                                    <td className='p-1 text-right font-semibold text-green-600'>৳{v.revenue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
