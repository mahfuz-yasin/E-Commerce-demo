'use client'
import { useState } from 'react'
import useFetch from '@/hooks/useFetch'
import { Landmark, Package2, TrendingDown, BarChart2, Sigma, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { showToast } from '@/lib/showToast'

const fmt = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`

export default function AssetLiabilities() {
    const { data, loading, refetch } = useFetch('/api/dashboard/admin/asset-liabilities')
    const record = data?.data
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)

    const startEdit = () => {
        setForm({ bankBalance: record?.bankBalance || 0, loans: record?.loans || 0, investments: record?.investments || 0 })
        setEditing(true)
    }
    const cancelEdit = () => setEditing(false)
    const saveEdit = async () => {
        setSaving(true)
        try {
            await axios.put('/api/dashboard/admin/asset-liabilities', form)
            showToast('success', 'সেভ হয়েছে।')
            refetch()
            setEditing(false)
        } catch { showToast('error', 'সেভ ব্যর্থ।') }
        finally { setSaving(false) }
    }

    const cards = [
        { label: 'Bank Balance',  value: record?.bankBalance, icon: <Landmark className="w-4 h-4" />,  color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30',     field: 'bankBalance' },
        { label: 'Stock Value',   value: record?.stockValue,  icon: <Package2 className="w-4 h-4" />,   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', field: null },
        { label: 'Loans',         value: record?.loans,       icon: <TrendingDown className="w-4 h-4" />,color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/30',       field: 'loans' },
        { label: 'Investments',   value: record?.investments, icon: <BarChart2 className="w-4 h-4" />,  color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-950/30', field: 'investments' },
        { label: 'Net Value',     value: record?.netValue,    icon: <Sigma className="w-4 h-4" />,      color: record?.netValue >= 0 ? 'text-emerald-600' : 'text-red-600', bg: record?.netValue >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30', field: null, bold: true },
    ]

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset & Liabilities</h4>
                {!editing
                    ? <button onClick={startEdit} className="flex items-center gap-1 text-xs text-primary hover:underline"><Pencil className="w-3 h-3" />Edit</button>
                    : <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"><Check className="w-3 h-3" />{saving ? 'Saving...' : 'Save'}</button>
                        <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"><X className="w-3 h-3" />Cancel</button>
                    </div>
                }
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {cards.map((c, i) => (
                    <motion.div key={c.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={cn('relative rounded-xl border border-border/60 shadow-sm p-3 space-y-2', c.bg)}
                    >
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-black/20 shadow-sm', c.color)}>
                            {c.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{c.label}</p>
                            {editing && c.field ? (
                                <input type="number" value={form[c.field] ?? 0}
                                    onChange={e => setForm(f => ({ ...f, [c.field]: Number(e.target.value) }))}
                                    className="w-full mt-1 h-7 px-2 text-xs rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                            ) : (
                                <p className={cn('text-base font-bold leading-tight mt-0.5', c.bold ? 'text-lg' : '', c.color)}>
                                    {loading ? '...' : fmt(c.value)}
                                </p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
