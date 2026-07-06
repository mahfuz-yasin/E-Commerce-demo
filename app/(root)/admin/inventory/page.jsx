'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ADMIN_DASHBOARD, ADMIN_INVENTORY, ADMIN_INVENTORY_PURCHASES, ADMIN_SUPPLIERS, ADMIN_REPORTS_STOCK } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Building2, ShoppingCart, AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INVENTORY, label: 'Inventory' },
]

export default function InventoryPage() {
    const { data: stockData } = useQuery({
        queryKey: ['inventory-stock-summary'],
        queryFn: async () => {
            const { data } = await axios.get('/api/reports/stock')
            return data.data?.summary
        }
    })

    const { data: purchaseData } = useQuery({
        queryKey: ['inventory-purchase-summary'],
        queryFn: async () => {
            const { data } = await axios.get('/api/inventory/purchases?limit=5')
            return data.data
        }
    })

    const { data: supplierData } = useQuery({
        queryKey: ['supplier-summary'],
        queryFn: async () => {
            const { data } = await axios.get('/api/inventory/suppliers?limit=5')
            return data.data
        }
    })

    const menuItems = [
        {
            title: 'ক্রয় রেকর্ড',
            desc: 'নতুন পণ্য কেনার রেকর্ড করুন, পেমেন্ট ট্র্যাক করুন',
            href: ADMIN_INVENTORY_PURCHASES,
            icon: <ShoppingCart className='w-6 h-6 text-blue-600' />,
            bg: 'bg-blue-50 border-blue-200',
        },
        {
            title: 'সাপ্লায়ার',
            desc: 'সাপ্লায়ার যোগ করুন, বাকি ট্র্যাক করুন',
            href: ADMIN_SUPPLIERS,
            icon: <Building2 className='w-6 h-6 text-purple-600' />,
            bg: 'bg-purple-50 border-purple-200',
        },
        {
            title: 'স্টক রিপোর্ট',
            desc: 'কালার-সাইজ ভিত্তিক স্টক, কম স্টক অ্যালার্ট',
            href: ADMIN_REPORTS_STOCK,
            icon: <Package className='w-6 h-6 text-green-600' />,
            bg: 'bg-green-50 border-green-200',
        },
    ]

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                <Package className='w-5 h-5 text-primary' /> Inventory Management
            </h2>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
                {[
                    { label: 'মোট ভ্যারিয়েন্ট', value: stockData?.total ?? '—', color: 'border-l-blue-400' },
                    { label: 'স্টকে আছে', value: stockData?.inStock ?? '—', color: 'border-l-green-400' },
                    { label: 'কম স্টক', value: stockData?.lowStock ?? '—', color: 'border-l-orange-400' },
                    { label: 'স্টক শেষ', value: stockData?.outOfStock ?? '—', color: 'border-l-red-400' },
                ].map(s => (
                    <Card key={s.label} className={`shadow-sm border-l-4 ${s.color}`}>
                        <CardContent className='pt-3 pb-3'>
                            <p className='text-xs text-gray-500'>{s.label}</p>
                            <p className='text-2xl font-bold'>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Menu Cards */}
            <div className='grid md:grid-cols-3 gap-4 mb-6'>
                {menuItems.map(item => (
                    <Link key={item.href} href={item.href}>
                        <Card className={`shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${item.bg}`}>
                            <CardContent className='pt-4 pb-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 bg-white rounded-lg shadow-sm'>{item.icon}</div>
                                        <div>
                                            <p className='font-semibold'>{item.title}</p>
                                            <p className='text-xs text-gray-500 mt-0.5'>{item.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className='w-4 h-4 text-gray-400 mt-1' />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
                {/* Recent Purchases */}
                <Card className='shadow-sm'>
                    <CardHeader className='border-b pb-3 flex flex-row items-center justify-between'>
                        <h4 className='font-semibold'>সাম্প্রতিক ক্রয়</h4>
                        <Link href={ADMIN_INVENTORY_PURCHASES} className='text-xs text-primary hover:underline'>সব দেখুন →</Link>
                    </CardHeader>
                    <CardContent className='pt-3'>
                        {!purchaseData?.data?.length ? (
                            <p className='text-gray-400 text-sm text-center py-4'>কোনো ক্রয় রেকর্ড নেই।</p>
                        ) : purchaseData.data.map(p => (
                            <div key={p._id} className='flex justify-between items-center py-2 border-b last:border-0 text-sm'>
                                <div>
                                    <p className='font-medium'>{p.purchaseNumber}</p>
                                    <p className='text-xs text-gray-400'>{p.supplier?.name || 'সাপ্লায়ার নেই'} • {new Date(p.purchaseDate).toLocaleDateString('bn-BD')}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-semibold'>৳{p.totalAmount?.toLocaleString()}</p>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : p.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                        {p.paymentStatus === 'paid' ? 'পরিশোধিত' : p.paymentStatus === 'partial' ? 'আংশিক' : 'বাকি'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card className='shadow-sm'>
                    <CardHeader className='border-b pb-3 flex flex-row items-center justify-between'>
                        <h4 className='font-semibold flex items-center gap-2'>
                            <AlertTriangle className='w-4 h-4 text-orange-500' /> কম স্টক অ্যালার্ট
                        </h4>
                        <Link href={ADMIN_REPORTS_STOCK + '?lowStock=true'} className='text-xs text-primary hover:underline'>সব দেখুন →</Link>
                    </CardHeader>
                    <CardContent className='pt-3'>
                        <LowStockList />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function LowStockList() {
    const { data } = useQuery({
        queryKey: ['low-stock-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/reports/stock?lowStock=true')
            return data.data?.data?.slice(0, 6)
        }
    })

    if (!data?.length) return <p className='text-gray-400 text-sm text-center py-4'>কোনো কম স্টক নেই।</p>

    return data.map(v => (
        <div key={v._id} className='flex justify-between items-center py-2 border-b last:border-0 text-sm'>
            <div>
                <p className='font-medium'>{v.productName}</p>
                <p className='text-xs text-gray-400'>{v.sku} • {v.colors}</p>
            </div>
            <div className='text-right'>
                <span className={`text-lg font-bold ${v.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{v.stock}</span>
                <p className='text-xs text-gray-400'>স্টক</p>
            </div>
        </div>
    ))
}
