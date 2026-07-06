'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_INVENTORY_PURCHASES, ADMIN_SUPPLIERS } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Building2, Plus, Pencil } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SUPPLIERS, label: 'Suppliers' },
]

const defaultForm = { name: '', phone: '', email: '', address: '', notes: '' }

export default function SuppliersPage() {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['suppliers', search],
        queryFn: async () => {
            const { data } = await axios.get(`/api/inventory/suppliers?search=${search}`)
            return data.data
        }
    })

    const saveMutation = useMutation({
        mutationFn: (payload) => editId
            ? axios.put('/api/inventory/suppliers', { _id: editId, ...payload })
            : axios.post('/api/inventory/suppliers', payload),
        onSuccess: () => {
            showToast('success', editId ? 'আপডেট হয়েছে।' : 'সাপ্লায়ার যোগ হয়েছে।')
            queryClient.invalidateQueries(['suppliers'])
            setForm(defaultForm); setEditId(null); setShowForm(false)
        },
        onError: (err) => showToast('error', err?.response?.data?.message || 'Error.')
    })

    const handleEdit = (s) => {
        setEditId(s._id)
        setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', notes: s.notes || '' })
        setShowForm(true)
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'><Building2 className='w-5 h-5 text-primary' /> Suppliers</h2>
                <div className='flex gap-2'>
                    <Link href={ADMIN_INVENTORY_PURCHASES}><Button variant="outline">ক্রয় রেকর্ড</Button></Link>
                    <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }}>
                        <Plus className='w-4 h-4 mr-1' /> নতুন সাপ্লায়ার
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold'>{editId ? 'সাপ্লায়ার এডিট' : 'নতুন সাপ্লায়ার'}</h4>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label>নাম *</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="সাপ্লায়ারের নাম" />
                            </div>
                            <div>
                                <Label>ফোন</Label>
                                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <Label>ইমেইল</Label>
                                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="supplier@example.com" />
                            </div>
                            <div>
                                <Label>ঠিকানা</Label>
                                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="সাপ্লায়ারের ঠিকানা" />
                            </div>
                            <div className='col-span-2'>
                                <Label>নোট</Label>
                                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="অতিরিক্ত তথ্য..." />
                            </div>
                        </div>
                        <div className='flex gap-2 mt-4'>
                            <Button onClick={() => { if (!form.name) { showToast('error', 'নাম দিন।'); return } saveMutation.mutate(form) }} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'সেভ...' : editId ? 'আপডেট করুন' : 'যোগ করুন'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                    <h4 className='font-semibold'>সাপ্লায়ার তালিকা</h4>
                    <Input placeholder="সার্চ করুন..." className="w-56" value={search} onChange={e => setSearch(e.target.value)} />
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? <p className='text-center py-8'>লোড হচ্ছে...</p>
                        : !data?.data?.length ? <p className='text-center py-8 text-gray-500'>কোনো সাপ্লায়ার নেই।</p>
                        : (
                            <table className='w-full text-sm'>
                                <thead><tr className='border-b bg-gray-50'>
                                    <th className='text-left p-2'>নাম</th>
                                    <th className='text-left p-2'>ফোন</th>
                                    <th className='text-left p-2'>ইমেইল</th>
                                    <th className='text-left p-2'>ঠিকানা</th>
                                    <th className='text-right p-2'>মোট ক্রয়</th>
                                    <th className='text-right p-2'>বাকি</th>
                                    <th className='text-left p-2'>Action</th>
                                </tr></thead>
                                <tbody>
                                    {data.data.map(s => (
                                        <tr key={s._id} className='border-b hover:bg-gray-50'>
                                            <td className='p-2 font-medium'>{s.name}</td>
                                            <td className='p-2'>{s.phone || '—'}</td>
                                            <td className='p-2 text-xs'>{s.email || '—'}</td>
                                            <td className='p-2 text-xs'>{s.address || '—'}</td>
                                            <td className='p-2 text-right font-semibold'>৳{s.totalPurchaseAmount?.toLocaleString() || 0}</td>
                                            <td className={`p-2 text-right font-semibold ${s.totalDueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                ৳{s.totalDueAmount?.toLocaleString() || 0}
                                            </td>
                                            <td className='p-2'>
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                                                    <Pencil className='w-3 h-3' />
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
