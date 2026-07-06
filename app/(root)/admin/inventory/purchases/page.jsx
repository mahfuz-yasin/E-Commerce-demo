'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_INVENTORY_PURCHASES } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Plus, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INVENTORY_PURCHASES, label: 'Inventory Purchases' },
]

const emptyItem = { product: '', productName: '', qty: 1, costPrice: 0, totalCost: 0 }

export default function InventoryPurchasesPage() {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [items, setItems] = useState([{ ...emptyItem }])
    const [supplier, setSupplier] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paidAmount, setPaidAmount] = useState(0)
    const [notes, setNotes] = useState('')
    const [search, setSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['inventory-purchases', search],
        queryFn: async () => {
            const { data } = await axios.get(`/api/inventory/purchases?search=${search}`)
            return data.data
        }
    })

    const { data: supplierData } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await axios.get('/api/inventory/suppliers?limit=100')
            return data.data?.data
        }
    })

    const saveMutation = useMutation({
        mutationFn: () => axios.post('/api/inventory/purchases', {
            supplier: supplier || null,
            items,
            paymentMethod,
            paidAmount: Number(paidAmount),
            notes,
        }),
        onSuccess: () => {
            showToast('success', 'ক্রয় রেকর্ড করা হয়েছে।')
            queryClient.invalidateQueries(['inventory-purchases'])
            setShowForm(false); setItems([{ ...emptyItem }]); setSupplier(''); setPaidAmount(0); setNotes('')
        },
        onError: (err) => showToast('error', err?.response?.data?.message || 'Error.')
    })

    const updateItem = (i, field, value) => {
        const updated = [...items]
        updated[i] = { ...updated[i], [field]: value }
        if (field === 'qty' || field === 'costPrice') {
            updated[i].totalCost = (Number(field === 'qty' ? value : updated[i].qty)) * (Number(field === 'costPrice' ? value : updated[i].costPrice))
        }
        setItems(updated)
    }

    const totalAmount = items.reduce((sum, i) => sum + (Number(i.qty) * Number(i.costPrice)), 0)

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'><Package className='w-5 h-5 text-primary' /> ইনভেন্টরি ক্রয়</h2>
                <div className='flex gap-2'>
                    <Link href="/admin/inventory/suppliers"><Button variant="outline">Suppliers</Button></Link>
                    <Button onClick={() => setShowForm(!showForm)}><Plus className='w-4 h-4 mr-1' /> নতুন ক্রয়</Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold'>নতুন পণ্য ক্রয় রেকর্ড করুন</h4>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className='grid grid-cols-3 gap-3'>
                            <div>
                                <Label>সাপ্লায়ার (optional)</Label>
                                <select className='w-full border rounded px-3 py-2 text-sm' value={supplier} onChange={e => setSupplier(e.target.value)}>
                                    <option value="">-- সাপ্লায়ার নির্বাচন করুন --</option>
                                    {supplierData?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>পেমেন্ট পদ্ধতি</Label>
                                <select className='w-full border rounded px-3 py-2 text-sm' value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                    <option value="cash">নগদ</option>
                                    <option value="bank">ব্যাংক</option>
                                    <option value="mobile_banking">মোবাইল ব্যাংকিং</option>
                                    <option value="credit">বাকি</option>
                                </select>
                            </div>
                            <div>
                                <Label>পরিশোধিত পরিমাণ (৳)</Label>
                                <Input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <div className='flex justify-between mb-2'>
                                <Label>পণ্য তালিকা</Label>
                                <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, { ...emptyItem }])}>+ আরও যোগ করুন</Button>
                            </div>
                            {items.map((item, i) => (
                                <div key={i} className='grid grid-cols-5 gap-2 mb-2 items-end'>
                                    <div className='col-span-2'>
                                        <Input placeholder="পণ্যের নাম" value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} />
                                    </div>
                                    <div>
                                        <Input type="number" placeholder="পরিমাণ" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} min="1" />
                                    </div>
                                    <div>
                                        <Input type="number" placeholder="ক্রয় মূল্য (৳)" value={item.costPrice} onChange={e => updateItem(i, 'costPrice', e.target.value)} />
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <span className='text-sm font-semibold text-green-700'>৳{Number(item.qty) * Number(item.costPrice)}</span>
                                        {items.length > 1 && (
                                            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className='text-red-400 hover:text-red-600 ml-1'><X className='w-4 h-4' /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='flex justify-between items-center border-t pt-3'>
                            <div>
                                <Label>নোট (optional)</Label>
                                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="বিশেষ নোট..." className="w-64" />
                            </div>
                            <div className='text-right'>
                                <p className='text-sm text-gray-500'>মোট: <span className='font-bold text-lg text-primary'>৳{totalAmount.toLocaleString()}</span></p>
                                <p className='text-xs text-gray-400'>বাকি: ৳{(totalAmount - Number(paidAmount)).toLocaleString()}</p>
                                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="mt-2">
                                    {saveMutation.isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                    <h4 className='font-semibold'>ক্রয়ের ইতিহাস</h4>
                    <Input placeholder="সার্চ করুন..." className="w-60" value={search} onChange={e => setSearch(e.target.value)} />
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? <p>লোড হচ্ছে...</p> : !data?.data?.length ? (
                        <p className='text-gray-500 text-center py-8'>কোনো ক্রয় রেকর্ড নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead><tr className='border-b bg-gray-50'>
                                    <th className='text-left p-2'>Purchase #</th>
                                    <th className='text-left p-2'>সাপ্লায়ার</th>
                                    <th className='text-left p-2'>মোট পণ্য</th>
                                    <th className='text-right p-2'>মোট মূল্য</th>
                                    <th className='text-right p-2'>পরিশোধিত</th>
                                    <th className='text-right p-2'>বাকি</th>
                                    <th className='text-left p-2'>পেমেন্ট স্ট্যাটাস</th>
                                    <th className='text-left p-2'>তারিখ</th>
                                </tr></thead>
                                <tbody>
                                    {data.data.map(p => (
                                        <tr key={p._id} className='border-b hover:bg-gray-50'>
                                            <td className='p-2 font-mono text-xs'>{p.purchaseNumber}</td>
                                            <td className='p-2'>{p.supplier?.name || '—'}</td>
                                            <td className='p-2'>{p.items?.length} টি</td>
                                            <td className='p-2 text-right font-semibold'>৳{p.totalAmount?.toLocaleString()}</td>
                                            <td className='p-2 text-right text-green-600'>৳{p.paidAmount?.toLocaleString()}</td>
                                            <td className='p-2 text-right text-red-600'>৳{p.dueAmount?.toLocaleString()}</td>
                                            <td className='p-2'>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : p.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                                    {p.paymentStatus === 'paid' ? 'পরিশোধিত' : p.paymentStatus === 'partial' ? 'আংশিক' : 'বাকি'}
                                                </span>
                                            </td>
                                            <td className='p-2 text-xs'>{new Date(p.purchaseDate).toLocaleDateString('bn-BD')}</td>
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
