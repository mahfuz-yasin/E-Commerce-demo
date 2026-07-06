'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_DASHBOARD, ADMIN_REPORTS_EMPLOYEE } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { UserCog } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_REPORTS_EMPLOYEE, label: 'Employee Report' },
]

export default function EmployeeReportPage() {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]
    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(today)
    const [queryParams, setQueryParams] = useState({ startDate: firstDay, endDate: today })

    const { data: staffList, isLoading: staffLoading } = useQuery({
        queryKey: ['staff-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/staff?limit=100')
            return data.data?.data || []
        }
    })

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['employee-orders', queryParams],
        queryFn: async () => {
            const { data } = await axios.get(`/api/orders?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}&size=1000&start=0&filters=[]&sorting=[]`)
            return data.data || []
        }
    })

    // Build per-staff report
    const staffReport = (staffList || []).map(staff => {
        const assigned = (ordersData || []).filter(o => o.assignedTo?.toString() === staff._id?.toString())
        const delivered = assigned.filter(o => o.status === 'delivered')
        const cancelled = assigned.filter(o => o.status === 'cancelled')
        const revenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0)
        return {
            ...staff,
            assigned: assigned.length,
            delivered: delivered.length,
            cancelled: cancelled.length,
            revenue,
            successRate: assigned.length > 0 ? Math.round((delivered.length / assigned.length) * 100) + '%' : '—',
        }
    }).sort((a, b) => b.delivered - a.delivered)

    const isLoading = staffLoading || ordersLoading

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
                        <Button onClick={() => setQueryParams({ startDate, endDate })}>রিপোর্ট দেখুন</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className='shadow-sm'>
                <CardHeader className='border-b pb-3'>
                    <h4 className='font-semibold flex items-center gap-2'>
                        <UserCog className='w-4 h-4' /> Employee Performance Report
                    </h4>
                </CardHeader>
                <CardContent className='pt-4'>
                    {isLoading ? (
                        <p className='text-center py-8 text-gray-400'>লোড হচ্ছে...</p>
                    ) : !staffReport.length ? (
                        <p className='text-center py-8 text-gray-400'>কোনো স্টাফ নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>স্টাফ</th>
                                        <th className='text-left p-2'>রোল</th>
                                        <th className='text-right p-2'>অ্যাসাইন</th>
                                        <th className='text-right p-2'>ডেলিভার্ড</th>
                                        <th className='text-right p-2'>ক্যান্সেল</th>
                                        <th className='text-right p-2'>সাকসেস রেট</th>
                                        <th className='text-right p-2'>রেভিনিউ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffReport.map(s => (
                                        <tr key={s._id} className='border-b hover:bg-gray-50'>
                                            <td className='p-2 font-medium'>
                                                {s.name}
                                                {s.phone && <p className='text-xs text-gray-400'>{s.phone}</p>}
                                            </td>
                                            <td className='p-2'>
                                                <span className='capitalize text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded'>{s.role}</span>
                                            </td>
                                            <td className='p-2 text-right font-semibold'>{s.assigned}</td>
                                            <td className='p-2 text-right text-green-600 font-semibold'>{s.delivered}</td>
                                            <td className='p-2 text-right text-red-500'>{s.cancelled}</td>
                                            <td className='p-2 text-right'>
                                                <span className={`font-bold ${parseInt(s.successRate) >= 70 ? 'text-green-600' : parseInt(s.successRate) >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                                    {s.successRate}
                                                </span>
                                            </td>
                                            <td className='p-2 text-right font-semibold text-green-700'>৳{s.revenue.toLocaleString()}</td>
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
