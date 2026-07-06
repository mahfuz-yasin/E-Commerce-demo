'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ADMIN_DASHBOARD, ADMIN_SMS_BULK, ADMIN_SMS_LOGS } from '@/routes/AdminPanelRoute'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare, CheckCircle, XCircle, Users } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SMS_LOGS, label: 'SMS Logs' },
]

export default function SMSLogsPage() {
    const [page, setPage] = useState(0)
    const [expanded, setExpanded] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['sms-logs', page],
        queryFn: async () => {
            const { data } = await axios.get(`/api/sms/bulk?page=${page}&limit=20`)
            return data.data
        }
    })

    const logs = data?.data || []
    const total = data?.total || 0
    const hasMore = data?.hasMore || false

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                    <MessageSquare className='w-5 h-5 text-primary' /> SMS Logs
                </h2>
                <Link href={ADMIN_SMS_BULK}>
                    <Button variant='outline'>Bulk SMS পাঠান</Button>
                </Link>
            </div>

            <Card className='shadow-sm'>
                <CardHeader className='border-b pb-3'>
                    <p className='text-sm text-gray-500'>মোট {total} টি SMS লগ</p>
                </CardHeader>
                <CardContent className='pt-4'>
                    {isLoading ? (
                        <p className='text-center py-8 text-gray-400'>লোড হচ্ছে...</p>
                    ) : !logs.length ? (
                        <p className='text-center py-8 text-gray-400'>কোনো SMS লগ নেই।</p>
                    ) : (
                        <div className='space-y-3'>
                            {logs.map(log => (
                                <div key={log._id} className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${log.messageType === 'bulk' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {log.messageType === 'bulk' ? 'Bulk' : 'Single'}
                                                </span>
                                                <span className='text-xs text-gray-400'>
                                                    {new Date(log.createdAt).toLocaleString('bn-BD')}
                                                </span>
                                                {log.sentBy?.name && (
                                                    <span className='text-xs text-gray-400'>by {log.sentBy.name}</span>
                                                )}
                                            </div>
                                            <p className='text-sm font-medium text-gray-700 mb-2 line-clamp-2'>{log.message}</p>
                                            <div className='flex items-center gap-4 text-sm'>
                                                <span className='flex items-center gap-1'>
                                                    <Users className='w-3.5 h-3.5 text-gray-400' />
                                                    {log.totalCount} জন
                                                </span>
                                                <span className='flex items-center gap-1 text-green-600'>
                                                    <CheckCircle className='w-3.5 h-3.5' />
                                                    {log.sentCount} সফল
                                                </span>
                                                {log.failedCount > 0 && (
                                                    <span className='flex items-center gap-1 text-red-500'>
                                                        <XCircle className='w-3.5 h-3.5' />
                                                        {log.failedCount} ব্যর্থ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                                            className='text-xs text-primary hover:underline ml-4 shrink-0'
                                        >
                                            {expanded === log._id ? 'লুকান ▲' : 'বিস্তারিত ▼'}
                                        </button>
                                    </div>

                                    {expanded === log._id && (
                                        <div className='mt-3 border-t pt-3'>
                                            <p className='text-xs font-semibold text-gray-500 mb-2'>প্রাপক তালিকা:</p>
                                            <div className='max-h-48 overflow-y-auto space-y-1'>
                                                {(log.recipients || []).map((r, i) => (
                                                    <div key={i} className='flex items-center justify-between text-xs px-2 py-1 rounded bg-gray-50'>
                                                        <span>{r.name || '—'} • {r.phone}</span>
                                                        <span className={`flex items-center gap-1 font-semibold ${r.status === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {r.status === 'sent' ? <CheckCircle className='w-3 h-3' /> : <XCircle className='w-3 h-3' />}
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {(page > 0 || hasMore) && (
                        <div className='flex justify-center gap-2 mt-4'>
                            <Button variant='outline' size='sm' disabled={page === 0} onClick={() => setPage(p => p - 1)}>← আগের পাতা</Button>
                            <span className='text-sm text-gray-500 self-center'>পাতা {page + 1}</span>
                            <Button variant='outline' size='sm' disabled={!hasMore} onClick={() => setPage(p => p + 1)}>পরের পাতা →</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
