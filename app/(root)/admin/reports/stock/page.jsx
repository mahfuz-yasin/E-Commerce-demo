'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ADMIN_DASHBOARD, ADMIN_REPORTS_STOCK } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_REPORTS_STOCK, label: 'Stock Report' },
]

const statusBadge = {
    in_stock: { label: 'স্টকে আছে', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className='w-3 h-3 inline mr-1' /> },
    low_stock: { label: 'কম স্টক', cls: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className='w-3 h-3 inline mr-1' /> },
    out_of_stock: { label: 'স্টক শেষ', cls: 'bg-red-100 text-red-600', icon: <XCircle className='w-3 h-3 inline mr-1' /> },
}

export default function StockReportPage() {
    const [search, setSearch] = useState('')
    const [lowStockOnly, setLowStockOnly] = useState(false)
    const [queryParams, setQueryParams] = useState({ search: '', lowStock: false })

    const { data, isLoading } = useQuery({
        queryKey: ['stock-report', queryParams],
        queryFn: async () => {
            const { data } = await axios.get(`/api/reports/stock?search=${queryParams.search}&lowStock=${queryParams.lowStock}`)
            return data.data
        }
    })

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {data?.summary && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
                    {[
                        { label: 'মোট ভ্যারিয়েন্ট', value: data.summary.total, cls: 'border-l-blue-400' },
                        { label: 'স্টকে আছে', value: data.summary.inStock, cls: 'border-l-green-400' },
                        { label: 'কম স্টক', value: data.summary.lowStock, cls: 'border-l-orange-400' },
                        { label: 'স্টক শেষ', value: data.summary.outOfStock, cls: 'border-l-red-400' },
                    ].map(s => (
                        <Card key={s.label} className={`shadow-sm border-l-4 ${s.cls}`}>
                            <CardContent className="pt-3 pb-3">
                                <p className='text-xs text-gray-500'>{s.label}</p>
                                <p className='text-2xl font-bold'>{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="shadow-sm">
                <CardHeader className="border-b pb-3">
                    <div className='flex flex-wrap gap-3 items-center justify-between'>
                        <h4 className='font-semibold flex items-center gap-2'><Package className='w-4 h-4' /> স্টক রিপোর্ট</h4>
                        <div className='flex gap-2 items-center'>
                            <Input
                                placeholder="পণ্যের নাম খুঁজুন..."
                                className="w-56"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <label className='flex items-center gap-1 text-sm cursor-pointer'>
                                <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} />
                                শুধু কম স্টক
                            </label>
                            <Button size="sm" onClick={() => setQueryParams({ search, lowStock: lowStockOnly })}>ফিল্টার</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <p className='text-center py-8 text-gray-400'>লোড হচ্ছে...</p>
                    ) : !data?.data?.length ? (
                        <p className='text-center py-8 text-gray-400'>কোনো ডেটা নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>পণ্য</th>
                                        <th className='text-left p-2'>SKU</th>
                                        <th className='text-left p-2'>কালার</th>
                                        <th className='text-left p-2'>সাইজ</th>
                                        <th className='text-right p-2'>মূল্য</th>
                                        <th className='text-right p-2'>স্টক</th>
                                        <th className='text-right p-2'>বিক্রয়</th>
                                        <th className='text-left p-2'>স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map(v => {
                                        const badge = statusBadge[v.status] || statusBadge.in_stock
                                        return (
                                            <tr key={v._id} className='border-b hover:bg-gray-50'>
                                                <td className='p-2 font-medium'>{v.productName}</td>
                                                <td className='p-2 font-mono text-xs'>{v.sku}</td>
                                                <td className='p-2 text-xs'>{v.colors || '—'}</td>
                                                <td className='p-2 text-xs'>{v.sizes || '—'}</td>
                                                <td className='p-2 text-right'>৳{v.sellingPrice}</td>
                                                <td className={`p-2 text-right font-bold ${v.stock === 0 ? 'text-red-600' : v.stock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {v.stock}
                                                </td>
                                                <td className='p-2 text-right text-gray-600'>{v.sold}</td>
                                                <td className='p-2'>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.cls}`}>
                                                        {badge.icon}{badge.label}
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
