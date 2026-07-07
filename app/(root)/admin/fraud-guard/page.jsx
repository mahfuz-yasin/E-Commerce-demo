'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_FRAUD_GUARD, ADMIN_FRAUD_GUARD_BLOCKED } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import { Shield, AlertTriangle, CheckCircle, XCircle, Phone, Globe, ToggleLeft, ToggleRight, Eye, MessageSquare, Settings2, Lock, Users, Smartphone, ExternalLink, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FRAUD_GUARD, label: 'Fraud Guard' },
]

const TABS = [
    { key: 'overview',    label: 'Overview',         icon: Shield },
    { key: 'rules',       label: 'Validation Rules',  icon: Settings2 },
    { key: 'popup',       label: 'Block Popup',       icon: MessageSquare },
    { key: 'suspicious',  label: 'Suspicious IPs',    icon: Globe },
]

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                checked ? 'bg-emerald-500' : 'bg-muted',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <span className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                checked ? 'translate-x-5' : 'translate-x-0'
            )} />
        </button>
    )
}

export default function FraudGuardPage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [phone, setPhone] = useState('')
    const [ip, setIp] = useState('')
    const [checkLoading, setCheckLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [blockReason, setBlockReason] = useState('')
    const [blocking, setBlocking] = useState(false)
    const [settingsSaving, setSettingsSaving] = useState(false)
    const [settings, setSettings] = useState(null)
    const queryClient = useQueryClient()

    // Load fraud settings
    const { data: settingsData, isLoading: settingsLoading } = useQuery({
        queryKey: ['fraud-settings'],
        queryFn: async () => { const { data } = await axios.get('/api/fraud-guard/settings'); return data.data }
    })
    useEffect(() => { if (settingsData) setSettings({ ...settingsData }) }, [settingsData])

    // Suspicious IPs
    const { data: suspiciousIPs, isLoading: ipsLoading, refetch: refetchIPs } = useQuery({
        queryKey: ['suspicious-ips'],
        queryFn: async () => { const { data } = await axios.get('/api/fraud-guard/suspicious-ips'); return data.data || [] }
    })

    const saveSettings = async () => {
        setSettingsSaving(true)
        try {
            await axios.put('/api/fraud-guard/settings', settings)
            showToast('success', 'সেটিংস সেভ হয়েছে।')
            queryClient.invalidateQueries(['fraud-settings'])
        } catch { showToast('error', 'সেভ ব্যর্থ হয়েছে।') }
        finally { setSettingsSaving(false) }
    }

    const handleCheck = async () => {
        if (!phone && !ip) { showToast('error', 'Phone বা IP দিন।'); return }
        setCheckLoading(true); setResult(null)
        try {
            const { data } = await axios.post('/api/fraud-guard/check', { phone: phone || undefined, ipAddress: ip || undefined })
            setResult(data.data)
        } catch (err) { showToast('error', err?.response?.data?.message || 'Error.') }
        finally { setCheckLoading(false) }
    }

    const handleBlock = async () => {
        if (!phone && !ip) return
        setBlocking(true)
        try {
            await axios.post('/api/fraud-guard/block', { phone: phone || undefined, ipAddress: ip || undefined, reason: blockReason || 'Fraud / Fake order' })
            showToast('success', 'ব্লক করা হয়েছে।')
            handleCheck()
        } catch (err) { showToast('error', err?.response?.data?.message || 'Block failed.') }
        finally { setBlocking(false) }
    }

    const handleBlockIP = async (ipAddr) => {
        try {
            await axios.post('/api/fraud-guard/block', { ipAddress: ipAddr, reason: 'Suspicious IP — 3+ orders' })
            showToast('success', 'IP ব্লক করা হয়েছে।')
            refetchIPs()
        } catch { showToast('error', 'ব্লক ব্যর্থ।') }
    }

    const scoreColor = (s) => s >= 70 ? 'text-red-600' : s >= 40 ? 'text-orange-500' : 'text-green-600'

    const WA_VARS = ['{{order_id}}','{{customer_name}}','{{products}}','{{product_links}}','{{quantity}}','{{subtotal}}','{{delivery_charge}}','{{discount}}','{{total}}','{{address}}','{{status}}','{{site_name}}']

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Fraud Guard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Fake order detection & customer blocking system.</p>
                </div>
                {settings && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/60 bg-card shadow-sm">
                        <Shield className={cn('w-5 h-5', settings.protectionEnabled ? 'text-emerald-500' : 'text-muted-foreground')} />
                        <span className="text-sm font-semibold">Protection</span>
                        <Toggle
                            checked={settings.protectionEnabled}
                            onChange={(v) => { const s = { ...settings, protectionEnabled: v }; setSettings(s); axios.put('/api/fraud-guard/settings', { protectionEnabled: v }).catch(() => {}) }}
                        />
                        <span className={cn('text-xs font-bold', settings.protectionEnabled ? 'text-emerald-600' : 'text-muted-foreground')}>
                            {settings.protectionEnabled ? 'ACTIVE' : 'OFF'}
                        </span>
                    </div>
                )}
            </div>

            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border/60">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={cn('flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all -mb-px',
                            activeTab === tab.key ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        )}>
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                        {[
                            { label: 'Blocked List', icon: Lock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', desc: 'Blocked customers', href: ADMIN_FRAUD_GUARD_BLOCKED },
                            { label: 'Phone Block', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', desc: 'নম্বর দিয়ে অর্ডার ব্লক', href: null },
                            { label: 'IP Block', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', desc: 'ডিভাইস থেকে অর্ডার ব্লক', href: null },
                        ].map((c, i) => (
                            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <Card className={cn('shadow-sm border border-border/60', c.bg)}>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('p-2.5 rounded-lg bg-white dark:bg-black/20 shadow-sm', c.color)}><c.icon className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">{c.desc}</p>
                                                {c.href ? <Link href={c.href} className={cn('text-sm font-semibold hover:underline', c.color)}>{c.label} →</Link>
                                                    : <p className={cn('text-sm font-semibold', c.color)}>{c.label}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                        <Card className="shadow-sm border border-border/60">
                            <CardHeader className="border-b pb-3 px-5 py-4">
                                <h4 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Fraud Check</h4>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div><Label className="text-xs">ফোন নম্বর</Label><Input placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
                                <div><Label className="text-xs">IP Address (optional)</Label><Input placeholder="192.168.0.1" value={ip} onChange={e => setIp(e.target.value)} className="mt-1" /></div>
                                <Button onClick={handleCheck} disabled={checkLoading} className="w-full">{checkLoading ? 'চেক হচ্ছে...' : 'Fraud Check করুন'}</Button>
                            </CardContent>
                        </Card>

                        {result && (
                            <Card className={cn('shadow-sm border-2', result.isBlocked ? 'border-red-400' : result.fraudScore >= 40 ? 'border-orange-400' : 'border-green-400')}>
                                <CardHeader className="border-b pb-3 px-5 py-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {result.isBlocked ? <XCircle className="w-4 h-4 text-red-600" /> : result.fraudScore >= 40 ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                                        ফলাফল
                                    </h4>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Fraud Score:</span>
                                        <span className={cn('text-2xl font-bold', scoreColor(result.fraudScore))}>{result.fraudScore}/100</span>
                                    </div>
                                    {result.isBlocked && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded p-3 text-sm text-red-700 dark:text-red-400">🚫 ব্লকড। কারণ: {result.blockedRecord?.reason}</div>}
                                    {result.flags?.length > 0 && <div className="flex flex-wrap gap-1">{result.flags.map(f => <span key={f} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{f}</span>)}</div>}
                                    {result.history && (
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {[['মোট অর্ডার', result.history.totalOrders, ''], ['ক্যান্সেল', result.history.cancelledOrders, 'text-red-600'], ['ডেলিভার্ড', result.history.deliveredOrders, 'text-green-600'], ['পেন্ডিং', result.history.pendingOrders, 'text-amber-600']].map(([l, v, cls]) => (
                                                <div key={l} className="bg-muted/40 rounded p-2"><div className="text-muted-foreground">{l}</div><div className={cn('font-bold text-base', cls)}>{v}</div></div>
                                            ))}
                                        </div>
                                    )}
                                    {!result.isBlocked && (
                                        <div className="space-y-2 border-t pt-3">
                                            <Input placeholder="কারণ: Fake order / ফ্রড" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
                                            <Button variant="destructive" onClick={handleBlock} disabled={blocking} className="w-full">{blocking ? 'ব্লক হচ্ছে...' : '🚫 ব্লক করুন'}</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* VALIDATION RULES TAB */}
            {activeTab === 'rules' && settings && (
                <div className="space-y-4 max-w-2xl">
                    <Card className="shadow-sm border border-border/60">
                        <CardHeader className="border-b px-5 py-4"><h4 className="font-semibold flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" />Validation & Block Rules</h4></CardHeader>
                        <CardContent className="pt-5 space-y-5">
                            <div>
                                <Label className="text-sm font-semibold">Minimum Address Length</Label>
                                <p className="text-xs text-muted-foreground mb-2">অর্ডারের ঠিকানায় কমপক্ষে কত অক্ষর থাকতে হবে</p>
                                <div className="flex items-center gap-3">
                                    <Input type="number" min={5} max={100} value={settings.minAddressLength}
                                        onChange={e => setSettings(s => ({ ...s, minAddressLength: Number(e.target.value) }))}
                                        className="w-28" />
                                    <span className="text-sm text-muted-foreground">characters</span>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-semibold">Delivery Success Ratio Threshold</Label>
                                <p className="text-xs text-muted-foreground mb-2">ডেলিভারি সাকসেস রেট এর নিচে থাকলে অর্ডার ব্লক হবে ({settings.blockBelowDeliveryRatio}%)</p>
                                <div className="flex items-center gap-3">
                                    <input type="range" min={0} max={100} step={5} value={settings.blockBelowDeliveryRatio}
                                        onChange={e => setSettings(s => ({ ...s, blockBelowDeliveryRatio: Number(e.target.value) }))}
                                        className="w-48 accent-primary" />
                                    <span className="text-sm font-bold text-primary w-12">{settings.blockBelowDeliveryRatio}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
                                <div>
                                    <p className="text-sm font-semibold">Block New Customers</p>
                                    <p className="text-xs text-muted-foreground">কুরিয়ারে আগের কোনো ইতিহাস নেই এমন নতুন কাস্টমারদের অর্ডার ব্লক করুন</p>
                                </div>
                                <Toggle checked={settings.blockNewCustomers} onChange={v => setSettings(s => ({ ...s, blockNewCustomers: v }))} />
                            </div>

                            <Button onClick={saveSettings} disabled={settingsSaving} className="w-full">
                                {settingsSaving ? 'সেভ হচ্ছে...' : 'সেটিংস সেভ করুন'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* BLOCK POPUP MESSAGE TAB */}
            {activeTab === 'popup' && settings && (
                <div className="grid lg:grid-cols-2 gap-4">
                    <Card className="shadow-sm border border-border/60">
                        <CardHeader className="border-b px-5 py-4"><h4 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Block Popup Message</h4></CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <div>
                                <Label className="text-xs font-semibold">Block Message (Bangla)</Label>
                                <Textarea rows={4} value={settings.blockMessage}
                                    onChange={e => setSettings(s => ({ ...s, blockMessage: e.target.value }))}
                                    placeholder="দুঃখিত! আপনার অর্ডার গ্রহণ করা সম্ভব হচ্ছে না।"
                                    className="mt-1 text-sm" />
                            </div>
                            <div><Label className="text-xs font-semibold">WhatsApp নম্বর</Label><Input value={settings.blockWhatsappNumber} onChange={e => setSettings(s => ({ ...s, blockWhatsappNumber: e.target.value }))} placeholder="8801XXXXXXXXX" className="mt-1" /></div>
                            <div><Label className="text-xs font-semibold">Call নম্বর</Label><Input value={settings.blockCallNumber} onChange={e => setSettings(s => ({ ...s, blockCallNumber: e.target.value }))} placeholder="01XXXXXXXXX" className="mt-1" /></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                <span className="text-sm">WhatsApp বাটন দেখাবে</span>
                                <Toggle checked={settings.showWhatsappButton} onChange={v => setSettings(s => ({ ...s, showWhatsappButton: v }))} />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                <span className="text-sm">Call বাটন দেখাবে</span>
                                <Toggle checked={settings.showCallButton} onChange={v => setSettings(s => ({ ...s, showCallButton: v }))} />
                            </div>

                            {/* WhatsApp pre-filled message template */}
                            <div className="border-t pt-4">
                                <Label className="text-xs font-semibold">WhatsApp Pre-filled Message Template</Label>
                                <p className="text-xs text-muted-foreground mb-2">নিচের ভেরিয়েবলগুলো ক্লিক করে টেমপ্লেটে যোগ করুন</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {['{{order_id}}','{{customer_name}}','{{products}}','{{total}}','{{address}}','{{status}}','{{site_name}}','{{delivery_charge}}','{{discount}}'].map(v => (
                                        <button key={v} type="button" onClick={() => setSettings(s => ({ ...s, whatsappMessageTemplate: (s.whatsappMessageTemplate || '') + v }))}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-mono transition-colors">{v}</button>
                                    ))}
                                </div>
                                <Textarea rows={5} value={settings.whatsappMessageTemplate}
                                    onChange={e => setSettings(s => ({ ...s, whatsappMessageTemplate: e.target.value }))}
                                    className="text-xs font-mono" />
                            </div>
                            <Button onClick={saveSettings} disabled={settingsSaving} className="w-full">{settingsSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</Button>
                        </CardContent>
                    </Card>

                    {/* Live Preview */}
                    <Card className="shadow-sm border border-border/60">
                        <CardHeader className="border-b px-5 py-4"><h4 className="font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" />Popup Preview</h4></CardHeader>
                        <CardContent className="pt-5">
                            <div className="mx-auto max-w-xs">
                                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-border shadow-xl overflow-hidden">
                                    <div className="bg-red-500 p-4 text-center">
                                        <XCircle className="w-10 h-10 text-white mx-auto mb-1" />
                                        <p className="text-white font-bold text-sm">অর্ডার গ্রহণ করা যাচ্ছে না</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm text-center text-foreground leading-relaxed">{settings.blockMessage || '—'}</p>
                                        <div className="space-y-2">
                                            {settings.showWhatsappButton && settings.blockWhatsappNumber && (
                                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-semibold">
                                                    <MessageSquare className="w-3.5 h-3.5" />WhatsApp: {settings.blockWhatsappNumber}
                                                </div>
                                            )}
                                            {settings.showCallButton && settings.blockCallNumber && (
                                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-semibold">
                                                    <Phone className="w-3.5 h-3.5" />Call: {settings.blockCallNumber}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* SUSPICIOUS IPs TAB */}
            {activeTab === 'suspicious' && (
                <Card className="shadow-sm border border-border/60">
                    <CardHeader className="border-b px-5 py-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-purple-600" />Suspicious IP Addresses (3+ orders)</h4>
                            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => refetchIPs()}>
                                <RefreshCw className="w-3 h-3" />Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-0">
                        {ipsLoading ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
                        ) : suspiciousIPs?.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">কোনো Suspicious IP নেই।</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b bg-muted/30">
                                        {['IP Address','Order Count','Phone Numbers','Last Seen','Status','Action'].map(h => <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>)}
                                    </tr></thead>
                                    <tbody>
                                        {suspiciousIPs?.map((ip, i) => (
                                            <tr key={ip.ipAddress} className={cn('border-b', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                                                <td className="px-4 py-2.5 font-mono font-semibold">{ip.ipAddress}</td>
                                                <td className="px-4 py-2.5"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{ip.orderCount}</span></td>
                                                <td className="px-4 py-2.5">{ip.phones?.slice(0,3).join(', ') || '—'}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{ip.lastSeen ? new Date(ip.lastSeen).toLocaleDateString('en-BD') : '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    {ip.isBlocked
                                                        ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Blocked</span>
                                                        : <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Flagged</span>}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {!ip.isBlocked && (
                                                        <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => handleBlockIP(ip.ipAddress)}>Block</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
