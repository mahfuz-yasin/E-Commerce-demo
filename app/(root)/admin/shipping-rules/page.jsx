'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_SHIPPING_RULES } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Truck, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SHIPPING_RULES, label: 'Shipping Rules' },
]

const typeLabels = { flat: 'ফ্ল্যাট চার্জ', free: 'সম্পূর্ণ ফ্রি', conditional_free: 'শর্তসাপেক্ষ ফ্রি' }
const defaultForm = { name: '', type: 'flat', flatCharge: 60, freeShippingMinAmount: 0 }

export default function ShippingRulesPage() {
    const queryClient = useQueryClient()
    const [form, setForm] = useState(defaultForm)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['shipping-rules'],
        queryFn: async () => {
            const { data } = await axios.get('/api/shipping-rules')
            return data.data
        }
    })

    const saveMutation = useMutation({
        mutationFn: (payload) => editId
            ? axios.put('/api/shipping-rules', { _id: editId, ...payload })
            : axios.post('/api/shipping-rules', payload),
        onSuccess: () => {
            showToast('success', 'সেভ হয়েছে।')
            queryClient.invalidateQueries(['shipping-rules'])
            setForm(defaultForm); setEditId(null); setShowForm(false)
        },
        onError: (err) => showToast('error', err?.response?.data?.message || 'Error.')
    })

    const toggleMutation = useMutation({
        mutationFn: ({ _id, isActive }) => axios.put('/api/shipping-rules', { _id, isActive: !isActive }),
        onSuccess: () => queryClient.invalidateQueries(['shipping-rules'])
    })

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'><Truck className='w-5 h-5 text-primary' /> Shipping Rules</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }}>
                    <Plus className='w-4 h-4 mr-1' /> নতুন রুল
                </Button>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm">
                    <CardContent className="pt-4">
                        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate({ ...form, flatCharge: Number(form.flatCharge), freeShippingMinAmount: Number(form.freeShippingMinAmount) }) }} className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label>নাম *</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="যেমন: ঢাকার মধ্যে" />
                            </div>
                            <div>
                                <Label>ধরন *</Label>
                                <select className='w-full border rounded px-3 py-2 text-sm' value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="flat">ফ্ল্যাট চার্জ</option>
                                    <option value="free">সম্পূর্ণ ফ্রি</option>
                                    <option value="conditional_free">শর্তসাপেক্ষ ফ্রি</option>
                                </select>
                            </div>
                            {form.type === 'flat' && (
                                <div>
                                    <Label>চার্জ (৳)</Label>
                                    <Input type="number" value={form.flatCharge} onChange={e => setForm({ ...form, flatCharge: e.target.value })} />
                                </div>
                            )}
                            {form.type === 'conditional_free' && (
                                <div>
                                    <Label>ন্যূনতম অর্ডার পরিমাণ (৳)</Label>
                                    <Input type="number" value={form.freeShippingMinAmount} onChange={e => setForm({ ...form, freeShippingMinAmount: e.target.value })} placeholder="500" />
                                </div>
                            )}
                            <div className='col-span-2 flex gap-3'>
                                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'সেভ...' : 'সেভ করুন'}</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    {isLoading ? <p>লোড হচ্ছে...</p> : !data?.length ? (
                        <div className='text-center py-8 text-gray-500'>
                            <p>কোনো শিপিং রুল নেই।</p>
                            <p className='text-sm mt-1'>ডিফল্ট চার্জ ৳60 প্রযোজ্য।</p>
                        </div>
                    ) : (
                        <table className='w-full text-sm'>
                            <thead><tr className='border-b bg-gray-50'>
                                <th className='text-left p-2'>নাম</th>
                                <th className='text-left p-2'>ধরন</th>
                                <th className='text-left p-2'>চার্জ / শর্ত</th>
                                <th className='text-left p-2'>স্ট্যাটাস</th>
                                <th className='text-left p-2'>Action</th>
                            </tr></thead>
                            <tbody>
                                {data.map(r => (
                                    <tr key={r._id} className='border-b hover:bg-gray-50'>
                                        <td className='p-2 font-medium'>{r.name}</td>
                                        <td className='p-2'>{typeLabels[r.type]}</td>
                                        <td className='p-2'>
                                            {r.type === 'flat' && `৳${r.flatCharge}`}
                                            {r.type === 'free' && 'সম্পূর্ণ ফ্রি'}
                                            {r.type === 'conditional_free' && `৳${r.freeShippingMinAmount}+ অর্ডারে ফ্রি`}
                                        </td>
                                        <td className='p-2'>
                                            <span className={`px-2 py-0.5 rounded text-xs ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {r.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className='p-2'>
                                            <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ _id: r._id, isActive: r.isActive })}>
                                                {r.isActive ? <ToggleRight className='w-4 h-4 text-green-600' /> : <ToggleLeft className='w-4 h-4 text-gray-400' />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
