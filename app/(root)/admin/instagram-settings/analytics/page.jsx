'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { BarChart3, TrendingUp, Eye, Heart, Share, Save, MessageCircle, Users, Calendar, Mail, CheckCircle, X } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Analytics & Insights' },
]

const metricsOptions = [
    { value: 'impressions', label: 'Impressions', icon: Eye, color: 'bg-blue-500' },
    { value: 'reach', label: 'Reach', icon: Users, color: 'bg-green-500' },
    { value: 'engagement', label: 'Engagement', icon: Heart, color: 'bg-pink-500' },
    { value: 'saves', label: 'Saves', icon: Save, color: 'bg-purple-500' },
    { value: 'shares', label: 'Shares', icon: Share, color: 'bg-orange-500' },
    { value: 'profile_visits', label: 'Profile Visits', icon: Users, color: 'bg-cyan-500' },
    { value: 'website_clicks', label: 'Website Clicks', icon: TrendingUp, color: 'bg-indigo-500' }
]

export default function InstagramAnalyticsPage() {
    const [config, setConfig] = useState({
        analytics: {
            trackingEnabled: true,
            metricsToTrack: ['impressions', 'reach', 'engagement'],
            reportSchedule: {
                enabled: false,
                frequency: 'weekly',
                emailRecipients: []
            }
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newEmail, setNewEmail] = useState('')

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    analytics: data.data.analytics || prev.analytics
                }))
            }
        } catch (error) {
            console.log('No existing config found')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await axios.post('/api/admin/instagram/config', {
                analytics: config.analytics
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Analytics settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const toggleMetric = (metric) => {
        setConfig(prev => ({
            ...prev,
            analytics: {
                ...prev.analytics,
                metricsToTrack: prev.analytics.metricsToTrack.includes(metric)
                    ? prev.analytics.metricsToTrack.filter(m => m !== metric)
                    : [...prev.analytics.metricsToTrack, metric]
            }
        }))
    }

    const addEmail = () => {
        if (newEmail && !config.analytics.reportSchedule.emailRecipients.includes(newEmail)) {
            setConfig(prev => ({
                ...prev,
                analytics: {
                    ...prev.analytics,
                    reportSchedule: {
                        ...prev.analytics.reportSchedule,
                        emailRecipients: [...prev.analytics.reportSchedule.emailRecipients, newEmail]
                    }
                }
            }))
            setNewEmail('')
        }
    }

    const removeEmail = (index) => {
        setConfig(prev => ({
            ...prev,
            analytics: {
                ...prev.analytics,
                reportSchedule: {
                    ...prev.analytics.reportSchedule,
                    emailRecipients: prev.analytics.reportSchedule.emailRecipients.filter((_, i) => i !== index)
                }
            }
        }))
    }

    const updateField = (path, value) => {
        setConfig(prev => {
            const newConfig = { ...prev }
            const keys = path.split('.')
            let current = newConfig
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
            return newConfig
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Analytics & Insights</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Tracking Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h5 className="font-medium text-gray-800">Enable Analytics Tracking</h5>
                            <p className="text-sm text-gray-500">Track Instagram performance metrics automatically</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.analytics?.trackingEnabled || false}
                                onChange={(e) => updateField('analytics.trackingEnabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Metrics to Track */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Metrics to Track
                        </h5>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {metricsOptions.map((metric) => {
                                const Icon = metric.icon
                                const isActive = config.analytics?.metricsToTrack?.includes(metric.value)
                                
                                return (
                                    <button
                                        key={metric.value}
                                        onClick={() => toggleMetric(metric.value)}
                                        className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                                            isActive
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${metric.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800">{metric.label}</p>
                                            <p className="text-xs text-gray-500">
                                                {isActive ? 'Tracking' : 'Not tracking'}
                                            </p>
                                        </div>
                                        {isActive && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Report Schedule */}
                    <div className="border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                Report Schedule
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.analytics?.reportSchedule?.enabled || false}
                                    onChange={(e) => updateField('analytics.reportSchedule.enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Frequency
                                </label>
                                <select
                                    value={config.analytics?.reportSchedule?.frequency || 'weekly'}
                                    onChange={(e) => updateField('analytics.reportSchedule.frequency', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Recipients
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                                        className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Add email address"
                                    />
                                    <button
                                        onClick={addEmail}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {config.analytics?.reportSchedule?.emailRecipients?.map((email, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {email}
                                            <button
                                                onClick={() => removeEmail(index)}
                                                className="hover:text-purple-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                        <h5 className="font-semibold text-purple-800 mb-4">Performance Overview</h5>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">12.5K</p>
                                <p className="text-sm text-gray-500">Impressions</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">3.2K</p>
                                <p className="text-sm text-gray-500">Engagement</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <Save className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">856</p>
                                <p className="text-sm text-gray-500">Saves</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">+24%</p>
                                <p className="text-sm text-gray-500">Growth</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Analytics Settings"
                            className="bg-purple-600 hover:bg-purple-700"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
