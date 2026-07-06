'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_SMS_BULK } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import { MessageSquare, Upload } from 'lucide-react'
import { useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SMS_BULK, label: 'Bulk SMS' },
]

const MESSAGE_TEMPLATES = [
    { label: 'অর্ডার কনফার্মেশন', text: 'আপনার অর্ডার কনফার্ম হয়েছে। আমরা শীঘ্রই পাঠাবো। ধন্যবাদ - E-Online Fashion' },
    { label: 'ডেলিভারি আপডেট', text: 'আপনার পার্সেল রওনা দিয়েছে। ট্র্যাকিং কোড: [TRACKING]. - E-Online Fashion' },
    { label: 'প্রমোশনাল অফার', text: 'বিশেষ অফার! এখন [DISCOUNT]% ছাড়। কুপন: [CODE]. সীমিত সময়ের জন্য। - E-Online Fashion' },
]

export default function BulkSMSPage() {
    const [phones, setPhones] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleSend = async () => {
        const phoneList = phones.split(/[\n,]/).map(p => p.trim()).filter(Boolean)
        if (!phoneList.length) { showToast('error', 'কমপক্ষে একটি ফোন নম্বর দিন।'); return }
        if (!message.trim()) { showToast('error', 'মেসেজ লিখুন।'); return }
        if (message.length > 160) { showToast('error', 'মেসেজ ১৬০ অক্ষরের বেশি হবে না।'); return }

        setLoading(true)
        setResult(null)
        try {
            const { data } = await axios.post('/api/sms/bulk', {
                recipients: phoneList.map(p => ({ phone: p })),
                message,
                messageType: 'bulk',
            })
            setResult(data.data)
            showToast('success', data.message)
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'SMS পাঠানো ব্যর্থ হয়েছে।')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className='grid lg:grid-cols-3 gap-4'>
                <div className='lg:col-span-2 space-y-4'>
                    <Card className="shadow-sm">
                        <CardHeader className="border-b pb-3">
                            <h4 className='font-semibold flex items-center gap-2'><MessageSquare className='w-4 h-4' /> Bulk SMS পাঠান</h4>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <Label>ফোন নম্বর সমূহ (প্রতি লাইনে একটি বা কমা দিয়ে আলাদা করুন)</Label>
                                <textarea
                                    className='w-full border rounded p-3 text-sm mt-1 min-h-[120px] font-mono'
                                    placeholder={"01XXXXXXXXX\n01YYYYYYYYY\nঅথবা 01XXXXXXXXX, 01YYYYYYYYY"}
                                    value={phones}
                                    onChange={e => setPhones(e.target.value)}
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    {phones.split(/[\n,]/).filter(p => p.trim()).length} নম্বর
                                </p>
                            </div>

                            <div>
                                <div className='flex justify-between'>
                                    <Label>মেসেজ</Label>
                                    <span className={`text-xs ${message.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>{message.length}/160</span>
                                </div>
                                <textarea
                                    className='w-full border rounded p-3 text-sm mt-1 min-h-[100px]'
                                    placeholder="আপনার মেসেজ লিখুন..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <Button onClick={handleSend} disabled={loading} className="w-full">
                                {loading ? 'পাঠানো হচ্ছে...' : `📤 SMS পাঠান (${phones.split(/[\n,]/).filter(p => p.trim()).length} জন)`}
                            </Button>

                            {result && (
                                <div className='bg-gray-50 rounded p-3 text-sm grid grid-cols-2 gap-2'>
                                    <div className='text-green-700'>✓ সফল: <strong>{result.sentCount}</strong></div>
                                    <div className='text-red-600'>✗ ব্যর্থ: <strong>{result.failedCount}</strong></div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm h-fit">
                    <CardHeader className="border-b pb-3">
                        <h4 className='font-semibold'>মেসেজ টেমপ্লেট</h4>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                        {MESSAGE_TEMPLATES.map(t => (
                            <button
                                key={t.label}
                                onClick={() => setMessage(t.text)}
                                className='w-full text-left p-3 border rounded hover:bg-gray-50 text-sm transition-colors'
                            >
                                <p className='font-semibold text-primary text-xs mb-1'>{t.label}</p>
                                <p className='text-gray-600 text-xs leading-relaxed'>{t.text}</p>
                            </button>
                        ))}
                        <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800'>
                            ⚠️ SSL Wireless API key সেটআপ না করা থাকলে SMS যাবে না। .env-এ <code>SSL_WIRELESS_API_KEY</code> ও <code>SSL_WIRELESS_SID</code> যোগ করুন।
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
