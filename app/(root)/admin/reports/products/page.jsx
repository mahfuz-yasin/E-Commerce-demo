'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_DASHBOARD, ADMIN_REPORTS_PRODUCTS } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_REPORTS_PRODUCTS, label: 'Product Report' },
]

export default function ProductReportPage() {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]
    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(today)
    const [search, setSearch] = useState('')
    const [queryParams, setQueryParams] = useState({ startDate: firstDay, endDate: today, search: '' })

    const { data, isLoading } = useQuery({
        queryKey: ['product-report', queryParams],
        queryFn: async () => {
            const { data } = await axios.get(
                `/api/reports/products?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}&search=${queryParams.search}`
            )
            return data.data
        }
    })

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className='mb-4 shadow-sm'>
                <CardContent className='pt-4'>
                    <div className='flex flex-wrap gap-3 items-end'>
                        <div>
                            <Label>শুরুর তারিখ</Label>
                            <Input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>শেষের তারিখ</Label>
                            <Input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <Label>পণ্য সার্চ</Label>
                            <Input placeholder='পণ্যের নাম...' value={search} onChange={e => setSearch(e.target.value)} className='w-48' />
                        </div>
                        <Button onClick={() => setQueryParams({ startDate, endDate, search })}>রিপোর্ট দেখুন</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className='shadow-sm'>
                <CardHeader className='border-b pb-3'>
                    <h4 className='font-semibold flex items-center gap-2'>
                        <ShoppingBag className='w-4 h-4' /> Product Sales Report
                    </h4>
                </CardHeader>
                <CardContent className='pt-4'>
                    {isLoading ? (
                        <p className='text-center py-8 text-gray-400'>লোড হচ্ছে...</p>
                    ) : !data?.length ? (
                        <p className='text-center py-8 text-gray-400'>কোনো ডেটা নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>পণ্য</th>
                                        <th className='text-right p-2'>বিক্রি (পিস)</th>
                                        <th className='text-right p-2'>রেভিনিউ</th>
                                        <th className='text-right p-2'>ক্যান্সেল</th>
                                        <th className='text-right p-2'>সাকসেস রেট</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((p, i) => (
                                        <tr key={i} className='border-b hover:bg-gray-50'>
                                            <td className='p-2 font-medium'>{p.productName}</td>
                                            <td className='p-2 text-right font-semibold'>{p.totalQty}</td>
                                            <td className='p-2 text-right font-semibold text-green-600'>৳{p.revenue?.toLocaleString()}</td>
                                            <td className='p-2 text-right text-red-500'>{p.cancelledQty}</td>
                                            <td className='p-2 text-right'>
                                                <span className={`font-bold ${p.successRate >= 70 ? 'text-green-600' : p.successRate >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                                    {p.successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
