'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Save, CreditCard, Smartphone, Building2, Globe } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Payment Settings' },
]

const METHODS = [
    { key: 'cod',         label: 'Cash on Delivery', icon: '💵', color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
    { key: 'bkash',       label: 'bKash',            icon: '📱', color: 'text-pink-600',    border: 'border-pink-200',    bg: 'bg-pink-50/50 dark:bg-pink-950/20' },
    { key: 'nagad',       label: 'Nagad',            icon: '📲', color: 'text-orange-600',  border: 'border-orange-200',  bg: 'bg-orange-50/50 dark:bg-orange-950/20' },
    { key: 'sslcommerz',  label: 'SSL Commerz',      icon: '🔒', color: 'text-blue-600',    border: 'border-blue-200',    bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
    { key: 'rocket',      label: 'Rocket (DBBL)',    icon: '🚀', color: 'text-purple-600',  border: 'border-purple-200',  bg: 'bg-purple-50/50 dark:bg-purple-950/20' },
    { key: 'bankTransfer',label: 'Bank Transfer',    icon: '🏦', color: 'text-violet-600',  border: 'border-violet-200',  bg: 'bg-violet-50/50 dark:bg-violet-950/20' },
]

const FL = ({ label, children, half }) => (
    <div className={cn('space-y-1.5', half ? 'md:col-span-1' : 'md:col-span-2')}>
        <label className="text-xs font-semibold text-foreground">{label}</label>
        {children}
    </div>
)

const Toggle = ({ value, onChange }) => (
    <button type="button" onClick={() => onChange(!value)}
        className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0',
            value ? 'bg-emerald-500' : 'bg-muted-foreground/30')}>
        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5',
            value ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
)

export default function PaymentSettingsPage() {
    const [loading, setLoading]     = useState(true)
    const [saving, setSaving]       = useState(false)
    const [activeTab, setActiveTab] = useState('cod')
    const [settings, setSettings]   = useState({
        cod:         { enabled: true,  label: 'Cash on Delivery', minOrder: 0, maxOrder: 0, extraCharge: 0, note: '' },
        bkash:       { enabled: false, label: 'bKash',            number: '', apiKey: '', secretKey: '', mode: 'manual', note: '' },
        nagad:       { enabled: false, label: 'Nagad',            number: '', apiKey: '', secretKey: '', mode: 'manual', note: '' },
        sslcommerz:  { enabled: false, label: 'SSL Commerz',      storeId: '', storePass: '', sandbox: true, note: '' },
        rocket:      { enabled: false, label: 'Rocket (DBBL)',    number: '', apiKey: '', secretKey: '', mode: 'manual', note: '' },
        bankTransfer:{ enabled: false, label: 'Bank Transfer',    bankName: '', accountName: '', accountNumber: '', routingNumber: '', note: '' },
    })

    useEffect(() => {
        axios.get('/api/admin/payment-settings').then(({ data }) => {
            if (data.success) setSettings(s => ({ ...s, ...data.data }))
        }).finally(() => setLoading(false))
    }, [])

    const set = (method, field, value) => setSettings(s => ({ ...s, [method]: { ...s[method], [field]: value } }))

    const save = async () => {
        setSaving(true)
        try {
            const { data } = await axios.put('/api/admin/payment-settings', settings)
            if (!data.success) throw new Error(data.message)
            showToast('success', 'Settings saved.')
        } catch (err) { showToast('error', err.message) }
        finally { setSaving(false) }
    }

    if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-4">
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Payment Settings</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure payment methods for your store.</p>
                </div>
                <Button onClick={save} disabled={saving} size="sm" className="gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save All'}
                </Button>
            </div>

            {/* Method tabs */}
            <div className="flex flex-wrap gap-2">
                {METHODS.map(m => (
                    <button key={m.key} type="button" onClick={() => setActiveTab(m.key)}
                        className={cn('flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all',
                            activeTab === m.key
                                ? `${m.border} ${m.bg} ${m.color} shadow-sm`
                                : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                        )}>
                        <span>{m.icon}</span>
                        {m.label}
                        <span className={cn('w-1.5 h-1.5 rounded-full', settings[m.key]?.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                    </button>
                ))}
            </div>

            {/* COD */}
            {activeTab === 'cod' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">💵 Cash on Delivery</h4>
                        <Toggle value={settings.cod.enabled} onChange={v => set('cod', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Display Label" half><Input value={settings.cod.label} onChange={e => set('cod', 'label', e.target.value)} /></FL>
                            <FL label="Min Order Amount (0 = no limit)" half><Input type="number" min="0" value={settings.cod.minOrder} onChange={e => set('cod', 'minOrder', Number(e.target.value))} /></FL>
                            <FL label="Max Order Amount (0 = no limit)" half><Input type="number" min="0" value={settings.cod.maxOrder} onChange={e => set('cod', 'maxOrder', Number(e.target.value))} /></FL>
                            <FL label="Extra COD Charge (৳)" half><Input type="number" min="0" value={settings.cod.extraCharge} onChange={e => set('cod', 'extraCharge', Number(e.target.value))} /></FL>
                            <FL label="Customer Note"><Input value={settings.cod.note} onChange={e => set('cod', 'note', e.target.value)} placeholder="e.g. Pay on delivery" /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* bKash */}
            {activeTab === 'bkash' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">📱 bKash</h4>
                        <Toggle value={settings.bkash.enabled} onChange={v => set('bkash', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Display Label" half><Input value={settings.bkash.label} onChange={e => set('bkash', 'label', e.target.value)} /></FL>
                            <FL label="bKash Number" half><Input value={settings.bkash.number} onChange={e => set('bkash', 'number', e.target.value)} placeholder="01XXXXXXXXX" /></FL>
                            <FL label="Integration Mode" half>
                                <select value={settings.bkash.mode} onChange={e => set('bkash', 'mode', e.target.value)}
                                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background">
                                    <option value="manual">Manual (customer sends payment)</option>
                                    <option value="api">API Integration</option>
                                </select>
                            </FL>
                            {settings.bkash.mode === 'api' && <>
                                <FL label="API Key" half><Input value={settings.bkash.apiKey} onChange={e => set('bkash', 'apiKey', e.target.value)} placeholder="bKash API Key" /></FL>
                                <FL label="Secret Key" half><Input type="password" value={settings.bkash.secretKey} onChange={e => set('bkash', 'secretKey', e.target.value)} placeholder="bKash Secret Key" /></FL>
                            </>}
                            <FL label="Customer Note"><Input value={settings.bkash.note} onChange={e => set('bkash', 'note', e.target.value)} placeholder="e.g. Send to 01XXXXXXXXX" /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Nagad */}
            {activeTab === 'nagad' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">📲 Nagad</h4>
                        <Toggle value={settings.nagad.enabled} onChange={v => set('nagad', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Display Label" half><Input value={settings.nagad.label} onChange={e => set('nagad', 'label', e.target.value)} /></FL>
                            <FL label="Nagad Number" half><Input value={settings.nagad.number} onChange={e => set('nagad', 'number', e.target.value)} placeholder="01XXXXXXXXX" /></FL>
                            <FL label="Integration Mode" half>
                                <select value={settings.nagad.mode} onChange={e => set('nagad', 'mode', e.target.value)}
                                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background">
                                    <option value="manual">Manual</option>
                                    <option value="api">API Integration</option>
                                </select>
                            </FL>
                            {settings.nagad.mode === 'api' && <>
                                <FL label="API Key" half><Input value={settings.nagad.apiKey} onChange={e => set('nagad', 'apiKey', e.target.value)} /></FL>
                                <FL label="Secret Key" half><Input type="password" value={settings.nagad.secretKey} onChange={e => set('nagad', 'secretKey', e.target.value)} /></FL>
                            </>}
                            <FL label="Customer Note"><Input value={settings.nagad.note} onChange={e => set('nagad', 'note', e.target.value)} /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* SSL Commerz */}
            {activeTab === 'sslcommerz' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">🔒 SSL Commerz</h4>
                        <Toggle value={settings.sslcommerz.enabled} onChange={v => set('sslcommerz', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className={cn('mb-3 p-3 rounded-xl border text-xs font-medium',
                            settings.sslcommerz.sandbox ? 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20')}>
                            {settings.sslcommerz.sandbox ? '⚠️ Sandbox Mode — payments are not real' : '✅ Live Mode — real payments will be processed'}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Store ID" half><Input value={settings.sslcommerz.storeId} onChange={e => set('sslcommerz', 'storeId', e.target.value)} placeholder="Your SSL Commerz Store ID" /></FL>
                            <FL label="Store Password" half><Input type="password" value={settings.sslcommerz.storePass} onChange={e => set('sslcommerz', 'storePass', e.target.value)} placeholder="Store Password" /></FL>
                            <FL label="Mode" half>
                                <div className="flex items-center gap-3 h-9">
                                    <Toggle value={!settings.sslcommerz.sandbox} onChange={v => set('sslcommerz', 'sandbox', !v)} />
                                    <span className="text-sm">{settings.sslcommerz.sandbox ? 'Sandbox' : 'Live'}</span>
                                </div>
                            </FL>
                            <FL label="Customer Note"><Input value={settings.sslcommerz.note} onChange={e => set('sslcommerz', 'note', e.target.value)} /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rocket */}
            {activeTab === 'rocket' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">🚀 Rocket (DBBL Mobile Banking)</h4>
                        <Toggle value={settings.rocket.enabled} onChange={v => set('rocket', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Display Label" half><Input value={settings.rocket.label} onChange={e => set('rocket', 'label', e.target.value)} /></FL>
                            <FL label="Rocket Number" half><Input value={settings.rocket.number} onChange={e => set('rocket', 'number', e.target.value)} placeholder="01XXXXXXXXX" /></FL>
                            <FL label="Integration Mode" half>
                                <select value={settings.rocket.mode} onChange={e => set('rocket', 'mode', e.target.value)}
                                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background">
                                    <option value="manual">Manual (customer sends payment)</option>
                                    <option value="api">API Integration</option>
                                </select>
                            </FL>
                            {settings.rocket.mode === 'api' && <>
                                <FL label="API Key" half><Input value={settings.rocket.apiKey} onChange={e => set('rocket', 'apiKey', e.target.value)} placeholder="Rocket API Key" /></FL>
                                <FL label="Secret Key" half><Input type="password" value={settings.rocket.secretKey} onChange={e => set('rocket', 'secretKey', e.target.value)} placeholder="Rocket Secret Key" /></FL>
                            </>}
                            <FL label="Customer Note"><Input value={settings.rocket.note} onChange={e => set('rocket', 'note', e.target.value)} placeholder="e.g. Send to 01XXXXXXXXX" /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bank Transfer */}
            {activeTab === 'bankTransfer' && (
                <Card className="py-0 rounded-xl shadow-sm">
                    <CardHeader className="px-5 py-3.5 border-b bg-muted/30 flex-row items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">🏦 Bank Transfer</h4>
                        <Toggle value={settings.bankTransfer.enabled} onChange={v => set('bankTransfer', 'enabled', v)} />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FL label="Display Label" half><Input value={settings.bankTransfer.label} onChange={e => set('bankTransfer', 'label', e.target.value)} /></FL>
                            <FL label="Bank Name" half><Input value={settings.bankTransfer.bankName} onChange={e => set('bankTransfer', 'bankName', e.target.value)} placeholder="e.g. Dutch Bangla Bank" /></FL>
                            <FL label="Account Name" half><Input value={settings.bankTransfer.accountName} onChange={e => set('bankTransfer', 'accountName', e.target.value)} /></FL>
                            <FL label="Account Number" half><Input value={settings.bankTransfer.accountNumber} onChange={e => set('bankTransfer', 'accountNumber', e.target.value)} /></FL>
                            <FL label="Routing Number" half><Input value={settings.bankTransfer.routingNumber} onChange={e => set('bankTransfer', 'routingNumber', e.target.value)} /></FL>
                            <FL label="Customer Note"><Input value={settings.bankTransfer.note} onChange={e => set('bankTransfer', 'note', e.target.value)} placeholder="Transfer instructions" /></FL>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
