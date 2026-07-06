'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_FLASH_SALE } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Zap, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FLASH_SALE, label: 'Flash Sale' },
]

const defaultForm = { title: '', discountPercentage: '', startTime: '', endTime: '', showCountdown: true }

export default function FlashSalePage() {
    const queryClient = useQueryClient()
    const [form, setForm] = useState(defaultForm)
    const [editId, setEditId] = useState(null)
    const [showForm, setShowForm] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['flash-sales'],
        queryFn: async () => {
            const { data } = await axios.get('/api/flash-sale')
            return data.data
        }
    })

    const saveMutation = useMutation({
        mutationFn: (payload) => editId
            ? axios.put('/api/flash-sale', { _id: editId, ...payload })
            : axios.post('/api/flash-sale', payload),
        onSuccess: () => {
            showToast('success', editId ? 'আপডেট হয়েছে।' : 'ফ্লাশ সেল তৈরি হয়েছে।')
            queryClient.invalidateQueries(['flash-sales'])
            setForm(defaultForm)
            setEditId(null)
            setShowForm(false)
        },
        onError: (err) => showToast('error', err?.response?.data?.message || 'Error.')
    })

    const toggleMutation = useMutation({
        mutationFn: ({ _id, isActive }) => axios.put('/api/flash-sale', { _id, isActive: !isActive }),
        onSuccess: () => queryClient.invalidateQueries(['flash-sales'])
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title || !form.discountPercentage || !form.startTime || !form.endTime) {
            showToast('error', 'সব ফিল্ড পূরণ করুন।')
            return
        }
        saveMutation.mutate({ ...form, discountPercentage: Number(form.discountPercentage) })
    }

    const handleEdit = (sale) => {
        setEditId(sale._id)
        setForm({
            title: sale.title,
            discountPercentage: sale.discountPercentage,
            startTime: new Date(sale.startTime).toISOString().slice(0, 16),
            endTime: new Date(sale.endTime).toISOString().slice(0, 16),
            showCountdown: sale.showCountdown,
        })
        setShowForm(true)
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'><Zap className='w-5 h-5 text-yellow-500' /> Flash Sale</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }}>
                    <Plus className='w-4 h-4 mr-1' /> নতুন ফ্লাশ সেল
                </Button>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold'>{editId ? 'ফ্লাশ সেল এডিট' : 'নতুন ফ্লাশ সেল তৈরি'}</h4>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label>শিরোনাম *</Label>
                                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="যেমন: ঈদ স্পেশাল সেল" />
                            </div>
                            <div>
                                <Label>ছাড়ের % *</Label>
                                <Input type="number" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: e.target.value })} placeholder="10" min="1" max="100" />
                            </div>
                            <div>
                                <Label>শুরুর সময় *</Label>
                                <Input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                            </div>
                            <div>
                                <Label>শেষের সময় *</Label>
                                <Input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                            </div>
                            <div className='col-span-2 flex gap-3'>
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? 'সেভ হচ্ছে...' : editId ? 'আপডেট করুন' : 'তৈরি করুন'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    {isLoading ? <p>লোড হচ্ছে...</p> : !data?.length ? (
                        <p className='text-gray-500'>কোনো ফ্লাশ সেল নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>শিরোনাম</th>
                                        <th className='text-left p-2'>ছাড়</th>
                                        <th className='text-left p-2'>শুরু</th>
                                        <th className='text-left p-2'>শেষ</th>
                                        <th className='text-left p-2'>স্ট্যাটাস</th>
                                        <th className='text-left p-2'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(s => {
                                        const now = new Date()
                                        const isLive = s.isActive && new Date(s.startTime) <= now && new Date(s.endTime) >= now
                                        return (
                                            <tr key={s._id} className='border-b hover:bg-gray-50'>
                                                <td className='p-2 font-medium'>{s.title}</td>
                                                <td className='p-2 text-orange-600 font-bold'>{s.discountPercentage}%</td>
                                                <td className='p-2 text-xs'>{new Date(s.startTime).toLocaleString('bn-BD')}</td>
                                                <td className='p-2 text-xs'>{new Date(s.endTime).toLocaleString('bn-BD')}</td>
                                                <td className='p-2'>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isLive ? 'bg-green-100 text-green-700' : s.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {isLive ? '🔴 Live' : s.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className='p-2 flex gap-2'>
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                                                        <Pencil className='w-3 h-3' />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ _id: s._id, isActive: s.isActive })}>
                                                        {s.isActive ? <ToggleRight className='w-4 h-4 text-green-600' /> : <ToggleLeft className='w-4 h-4 text-gray-400' />}
                                                    </Button>
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
