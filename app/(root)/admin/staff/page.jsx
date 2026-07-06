'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_STAFF } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { UserCog, Plus, Pencil, Shield } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_STAFF, label: 'Staff Management' },
]

const PERMISSIONS = [
    { value: 'view_orders', label: 'অর্ডার দেখা' },
    { value: 'update_order_status', label: 'স্ট্যাটাস আপডেট' },
    { value: 'view_products', label: 'পণ্য দেখা' },
    { value: 'manage_products', label: 'পণ্য ম্যানেজ' },
    { value: 'view_customers', label: 'কাস্টমার দেখা' },
    { value: 'manage_inventory', label: 'ইনভেন্টরি ম্যানেজ' },
    { value: 'view_reports', label: 'রিপোর্ট দেখা' },
    { value: 'manage_fraud', label: 'Fraud Guard' },
    { value: 'send_sms', label: 'SMS পাঠানো' },
]

const ROLE_PRESETS = {
    admin: PERMISSIONS.map(p => p.value),
    manager: ['view_orders', 'update_order_status', 'view_products', 'manage_products', 'view_customers', 'view_reports'],
    operator: ['view_orders', 'update_order_status', 'view_products', 'view_customers'],
    delivery: ['view_orders', 'update_order_status'],
}

const defaultForm = { name: '', email: '', phone: '', role: 'operator', permissions: ['view_orders', 'update_order_status'] }

export default function StaffPage() {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [editId, setEditId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: async () => {
            const { data } = await axios.get('/api/staff')
            return data.data
        }
    })

    const saveMutation = useMutation({
        mutationFn: (payload) => editId
            ? axios.put('/api/staff', { _id: editId, ...payload })
            : axios.post('/api/staff', payload),
        onSuccess: () => {
            showToast('success', editId ? 'স্টাফ আপডেট হয়েছে।' : 'নতুন স্টাফ যোগ হয়েছে।')
            queryClient.invalidateQueries(['staff'])
            setForm(defaultForm); setEditId(null); setShowForm(false)
        },
        onError: (err) => showToast('error', err?.response?.data?.message || 'Error.')
    })

    const togglePermission = (perm) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }))
    }

    const applyPreset = (role) => {
        setForm(prev => ({ ...prev, role, permissions: ROLE_PRESETS[role] || [] }))
    }

    const handleEdit = (s) => {
        setEditId(s._id)
        setForm({ name: s.name, email: s.email || '', phone: s.phone || '', role: s.role, permissions: s.permissions || [] })
        setShowForm(true)
    }

    const roleColors = { admin: 'bg-red-100 text-red-700', manager: 'bg-blue-100 text-blue-700', operator: 'bg-green-100 text-green-700', delivery: 'bg-yellow-100 text-yellow-700' }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'><UserCog className='w-5 h-5 text-primary' /> Staff Management</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }}>
                    <Plus className='w-4 h-4 mr-1' /> নতুন স্টাফ
                </Button>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold'>{editId ? 'স্টাফ এডিট' : 'নতুন স্টাফ যোগ করুন'}</h4>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label>নাম *</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="স্টাফের নাম" />
                            </div>
                            <div>
                                <Label>ফোন</Label>
                                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <Label>ইমেইল</Label>
                                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" />
                            </div>
                            <div>
                                <Label>রোল</Label>
                                <div className='flex gap-2 mt-1 flex-wrap'>
                                    {Object.keys(ROLE_PRESETS).map(r => (
                                        <button key={r} onClick={() => applyPreset(r)}
                                            className={`px-3 py-1 rounded text-sm capitalize border transition-colors ${form.role === r ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className='flex items-center gap-2 mb-2'><Shield className='w-4 h-4' /> পারমিশন</Label>
                            <div className='flex flex-wrap gap-2'>
                                {PERMISSIONS.map(p => (
                                    <label key={p.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer text-sm transition-colors ${form.permissions.includes(p.value) ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="checkbox" className='hidden' checked={form.permissions.includes(p.value)} onChange={() => togglePermission(p.value)} />
                                        {form.permissions.includes(p.value) ? '✓' : '○'} {p.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <Button onClick={() => { if (!form.name) { showToast('error', 'নাম দিন।'); return } saveMutation.mutate(form) }} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'সেভ হচ্ছে...' : editId ? 'আপডেট করুন' : 'যোগ করুন'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    {isLoading ? <p className='text-center py-8'>লোড হচ্ছে...</p>
                        : !data?.data?.length ? <p className='text-center py-8 text-gray-500'>কোনো স্টাফ নেই।</p>
                        : (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead><tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>নাম</th>
                                        <th className='text-left p-2'>ফোন</th>
                                        <th className='text-left p-2'>ইমেইল</th>
                                        <th className='text-left p-2'>রোল</th>
                                        <th className='text-left p-2'>পারমিশন</th>
                                        <th className='text-left p-2'>Action</th>
                                    </tr></thead>
                                    <tbody>
                                        {data.data.map(s => (
                                            <tr key={s._id} className='border-b hover:bg-gray-50'>
                                                <td className='p-2 font-medium'>{s.name}</td>
                                                <td className='p-2'>{s.phone || '—'}</td>
                                                <td className='p-2 text-xs'>{s.email || '—'}</td>
                                                <td className='p-2'>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${roleColors[s.role] || 'bg-gray-100 text-gray-700'}`}>{s.role}</span>
                                                </td>
                                                <td className='p-2'>
                                                    <div className='flex flex-wrap gap-1'>
                                                        {(s.permissions || []).slice(0, 3).map(p => (
                                                            <span key={p} className='bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded'>{p.replace(/_/g, ' ')}</span>
                                                        ))}
                                                        {(s.permissions || []).length > 3 && <span className='text-xs text-gray-400'>+{s.permissions.length - 3}</span>}
                                                    </div>
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
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    )
}
