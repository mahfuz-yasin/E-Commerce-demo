'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_FRAUD_GUARD } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import { Shield, AlertTriangle, CheckCircle, XCircle, Phone, Globe } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FRAUD_GUARD, label: 'Fraud Guard' },
]

export default function FraudGuardPage() {
    const [phone, setPhone] = useState('')
    const [ip, setIp] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [blockReason, setBlockReason] = useState('')
    const [blocking, setBlocking] = useState(false)

    const handleCheck = async () => {
        if (!phone && !ip) {
            showToast('error', 'Phone বা IP দিন।')
            return
        }
        setLoading(true)
        setResult(null)
        try {
            const { data } = await axios.post('/api/fraud-guard/check', { phone: phone || undefined, ipAddress: ip || undefined })
            setResult(data.data)
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'Error checking fraud status.')
        } finally {
            setLoading(false)
        }
    }

    const handleBlock = async () => {
        if (!phone && !ip) { showToast('error', 'Phone বা IP দিন।'); return }
        setBlocking(true)
        try {
            await axios.post('/api/fraud-guard/block', {
                phone: phone || undefined,
                ipAddress: ip || undefined,
                reason: blockReason || 'Fraud / Fake order',
            })
            showToast('success', 'কাস্টমার ব্লক করা হয়েছে।')
            handleCheck()
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'Block failed.')
        } finally {
            setBlocking(false)
        }
    }

    const scoreColor = (score) => {
        if (score >= 70) return 'text-red-600'
        if (score >= 40) return 'text-orange-500'
        return 'text-green-600'
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='grid lg:grid-cols-2 gap-4'>
                <Card className="shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold text-lg flex items-center gap-2'>
                            <Shield className='w-5 h-5 text-primary' />
                            Fraud Check
                        </h4>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div>
                            <Label>ফোন নম্বর</Label>
                            <Input placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <Label>IP Address (optional)</Label>
                            <Input placeholder="192.168.0.1" value={ip} onChange={e => setIp(e.target.value)} />
                        </div>
                        <Button onClick={handleCheck} disabled={loading} className="w-full">
                            {loading ? 'চেক হচ্ছে...' : 'Fraud Check করুন'}
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className={`shadow-sm border-2 ${result.isBlocked ? 'border-red-400' : result.fraudScore >= 40 ? 'border-orange-400' : 'border-green-400'}`}>
                        <CardHeader className="border-b pb-3">
                            <h4 className='font-semibold text-lg flex items-center gap-2'>
                                {result.isBlocked
                                    ? <XCircle className='w-5 h-5 text-red-600' />
                                    : result.fraudScore >= 40
                                        ? <AlertTriangle className='w-5 h-5 text-orange-500' />
                                        : <CheckCircle className='w-5 h-5 text-green-600' />
                                }
                                ফলাফল
                            </h4>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className='flex justify-between items-center'>
                                <span className='font-medium'>Fraud Score:</span>
                                <span className={`text-2xl font-bold ${scoreColor(result.fraudScore)}`}>{result.fraudScore}/100</span>
                            </div>

                            {result.isBlocked && (
                                <div className='bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700'>
                                    🚫 এই কাস্টমার ব্লকড আছেন। কারণ: {result.blockedRecord?.reason}
                                </div>
                            )}

                            {result.flags?.length > 0 && (
                                <div>
                                    <Label>সতর্কতা:</Label>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                        {result.flags.map(f => (
                                            <span key={f} className='bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded'>{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.history && (
                                <div className='grid grid-cols-2 gap-2 text-sm'>
                                    <div className='bg-gray-50 rounded p-2'>
                                        <div className='text-gray-500'>মোট অর্ডার</div>
                                        <div className='font-bold text-lg'>{result.history.totalOrders}</div>
                                    </div>
                                    <div className='bg-red-50 rounded p-2'>
                                        <div className='text-gray-500'>ক্যান্সেল</div>
                                        <div className='font-bold text-lg text-red-600'>{result.history.cancelledOrders}</div>
                                    </div>
                                    <div className='bg-green-50 rounded p-2'>
                                        <div className='text-gray-500'>ডেলিভার্ড</div>
                                        <div className='font-bold text-lg text-green-600'>{result.history.deliveredOrders}</div>
                                    </div>
                                    <div className='bg-yellow-50 rounded p-2'>
                                        <div className='text-gray-500'>পেন্ডিং</div>
                                        <div className='font-bold text-lg text-yellow-600'>{result.history.pendingOrders}</div>
                                    </div>
                                </div>
                            )}

                            {!result.isBlocked && (
                                <div className='space-y-2 border-t pt-3'>
                                    <Label>ব্লকের কারণ (optional)</Label>
                                    <Input placeholder="Fake order / ফ্রড" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
                                    <Button variant="destructive" onClick={handleBlock} disabled={blocking} className="w-full">
                                        {blocking ? 'ব্লক হচ্ছে...' : '🚫 ব্লক করুন (Phone + IP)'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card className="shadow-sm">
                    <CardContent className="pt-4">
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-blue-100 rounded-lg'><Phone className='w-5 h-5 text-blue-600' /></div>
                            <div>
                                <p className='text-sm text-gray-500'>Phone Block</p>
                                <p className='font-semibold text-sm'>নম্বর দিয়ে অর্ডার ব্লক</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="pt-4">
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-purple-100 rounded-lg'><Globe className='w-5 h-5 text-purple-600' /></div>
                            <div>
                                <p className='text-sm text-gray-500'>IP Block</p>
                                <p className='font-semibold text-sm'>ডিভাইস থেকে অর্ডার ব্লক</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="pt-4">
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-green-100 rounded-lg'><Shield className='w-5 h-5 text-green-600' /></div>
                            <div>
                                <p className='text-sm text-gray-500'>Blocked List</p>
                                <a href="/admin/fraud-guard/blocked" className='font-semibold text-sm text-primary hover:underline'>সকল ব্লকড দেখুন →</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
