'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_COURIER_SETTINGS, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AlertTriangle, Search } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_COURIER_SETTINGS, label: 'Courier Settings' },
    { href: '', label: 'Missing Parcels' },
]

export default function MissingParcelsPage() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [courier, setCourier] = useState('all')
    const [queryParams, setQueryParams] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['missing-parcels', queryParams],
        enabled: !!queryParams,
        queryFn: async () => {
            const params = new URLSearchParams({
                status: 'shipped',
                deleteType: 'SD',
                size: '200',
                start: '0',
                filters: '[]',
                sorting: JSON.stringify([{ id: 'createdAt', desc: true }]),
            })
            const { data } = await axios.get(`/api/orders?${params.toString()}`)
            const orders = data.data || []

            // Filter: shipped but not delivered after threshold days
            const now = new Date()
            const missingThresholdDays = 7
            return orders.filter(o => {
                if (o.status !== 'shipped') return false
                const shipped = new Date(o.updatedAt || o.createdAt)
                const daysElapsed = (now - shipped) / (1000 * 60 * 60 * 24)
                if (daysElapsed < missingThresholdDays) return false
                if (startDate && new Date(o.createdAt) < new Date(startDate)) return false
                if (endDate && new Date(o.createdAt) > new Date(endDate)) return false
                if (courier !== 'all' && o.courierInfo?.courierName !== courier) return false
                return true
            })
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
                        <div>
                            <Label>কুরিয়ার</Label>
                            <select className='border rounded px-3 py-2 text-sm' value={courier} onChange={e => setCourier(e.target.value)}>
                                <option value="all">সব</option>
                                <option value="steadfast">Steadfast</option>
                                <option value="pathao">Pathao</option>
                                <option value="redx">RedX</option>
                                <option value="paperfly">Paperfly</option>
                            </select>
                        </div>
                        <Button onClick={() => setQueryParams({ startDate, endDate, courier })}>
                            <Search className='w-4 h-4 mr-1' /> খুঁজুন
                        </Button>
                    </div>
                    <p className='text-xs text-orange-600 mt-2'>⚠️ Shipped হওয়ার ৭+ দিন পরেও delivered না হলে "missing" ধরা হচ্ছে।</p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="border-b pb-3">
                    <h4 className='font-semibold flex items-center gap-2'>
                        <AlertTriangle className='w-4 h-4 text-orange-500' />
                        মিসিং পার্সেল তালিকা
                        {data && <span className='ml-auto text-sm font-normal text-gray-500'>{data.length} টি</span>}
                    </h4>
                </CardHeader>
                <CardContent className="pt-4">
                    {!queryParams ? (
                        <p className='text-gray-400 text-center py-8'>ফিল্টার দিয়ে সার্চ করুন।</p>
                    ) : isLoading ? (
                        <p className='text-center py-8 text-gray-400'>লোড হচ্ছে...</p>
                    ) : !data?.length ? (
                        <p className='text-center py-8 text-green-600'>✓ কোনো মিসিং পার্সেল নেই!</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>Order ID</th>
                                        <th className='text-left p-2'>কাস্টমার</th>
                                        <th className='text-left p-2'>ফোন</th>
                                        <th className='text-left p-2'>Tracking</th>
                                        <th className='text-left p-2'>কুরিয়ার</th>
                                        <th className='text-right p-2'>পরিমাণ</th>
                                        <th className='text-left p-2'>Shipped</th>
                                        <th className='text-right p-2'>দিন অতিবাহিত</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(o => {
                                        const shippedDate = new Date(o.updatedAt || o.createdAt)
                                        const daysElapsed = Math.floor((new Date() - shippedDate) / (1000 * 60 * 60 * 24))
                                        return (
                                            <tr key={o._id} className='border-b hover:bg-orange-50'>
                                                <td className='p-2 font-mono text-xs'>{o.order_id}</td>
                                                <td className='p-2'>{o.name}</td>
                                                <td className='p-2'>{o.phone}</td>
                                                <td className='p-2 font-mono text-xs'>{o.courierInfo?.trackingCode || '—'}</td>
                                                <td className='p-2 text-xs'>{o.courierInfo?.courierName || '—'}</td>
                                                <td className='p-2 text-right font-semibold'>৳{o.totalAmount}</td>
                                                <td className='p-2 text-xs'>{shippedDate.toLocaleDateString('bn-BD')}</td>
                                                <td className='p-2 text-right'>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${daysElapsed >= 14 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'}`}>
                                                        {daysElapsed} দিন
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
