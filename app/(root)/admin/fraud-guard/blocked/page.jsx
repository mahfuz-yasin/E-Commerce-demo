'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_FRAUD_GUARD, ADMIN_FRAUD_GUARD_BLOCKED } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FRAUD_GUARD, label: 'Fraud Guard' },
    { href: ADMIN_FRAUD_GUARD_BLOCKED, label: 'Blocked Customers' },
]

export default function BlockedCustomersPage() {
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['blocked-customers', search],
        queryFn: async () => {
            const { data } = await axios.get(`/api/fraud-guard/block?search=${search}&limit=50`)
            return data.data
        }
    })

    const unblockMutation = useMutation({
        mutationFn: (id) => axios.put('/api/fraud-guard/unblock', { id }),
        onSuccess: () => {
            showToast('success', 'আনব্লক সফল।')
            queryClient.invalidateQueries(['blocked-customers'])
        },
        onError: () => showToast('error', 'আনব্লক ব্যর্থ হয়েছে।')
    })

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className="shadow-sm">
                <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                    <h4 className='font-semibold text-lg'>🚫 ব্লকড কাস্টমার তালিকা</h4>
                    <Input
                        placeholder="ফোন / IP খুঁজুন..."
                        className="w-64"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <p className='text-gray-500'>লোড হচ্ছে...</p>
                    ) : !data?.data?.length ? (
                        <p className='text-gray-500'>কোনো ব্লকড কাস্টমার নেই।</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='text-left p-2'>ফোন</th>
                                        <th className='text-left p-2'>IP Address</th>
                                        <th className='text-left p-2'>ব্লক টাইপ</th>
                                        <th className='text-left p-2'>কারণ</th>
                                        <th className='text-left p-2'>ফ্রড অর্ডার</th>
                                        <th className='text-left p-2'>তারিখ</th>
                                        <th className='text-left p-2'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map(c => (
                                        <tr key={c._id} className='border-b hover:bg-gray-50'>
                                            <td className='p-2 font-mono'>{c.phone || '—'}</td>
                                            <td className='p-2 font-mono text-xs'>{c.ipAddress || '—'}</td>
                                            <td className='p-2'>
                                                <div className='flex gap-1'>
                                                    {c.blockType?.map(t => (
                                                        <span key={t} className='bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded'>{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className='p-2 text-xs'>{c.reason}</td>
                                            <td className='p-2 text-center font-bold text-red-600'>{c.fraudOrderCount}</td>
                                            <td className='p-2 text-xs'>{new Date(c.createdAt).toLocaleDateString('bn-BD')}</td>
                                            <td className='p-2'>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => unblockMutation.mutate(c._id)}
                                                    disabled={unblockMutation.isPending}
                                                >
                                                    আনব্লক
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
