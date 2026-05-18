'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { Target, DollarSign, CheckCircle, ExternalLink, Zap, Users, TrendingUp, BarChart3, Settings } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Ads Manager' },
]

export default function InstagramAdsPage() {
    const [config, setConfig] = useState({
        ads: {
            adAccountId: '',
            pixelId: '',
            defaultCampaignBudget: 1000,
            automatedAds: {
                enabled: false,
                productPromotion: false,
                retargeting: false
            }
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    ads: data.data.ads || prev.ads
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
                ads: config.ads
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Ads settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
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
                <div className="animate-spin w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-orange-600 to-red-500 text-white">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Ads Manager</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Ad Account Configuration */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-orange-600" />
                            Ad Account Configuration
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ad Account ID
                                </label>
                                <input
                                    type="text"
                                    value={config.ads?.adAccountId || ''}
                                    onChange={(e) => updateField('ads.adAccountId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="act_xxxxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pixel ID
                                </label>
                                <input
                                    type="text"
                                    value={config.ads?.pixelId || ''}
                                    onChange={(e) => updateField('ads.pixelId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="1234567890"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Campaign Budget (৳)
                                </label>
                                <input
                                    type="number"
                                    value={config.ads?.defaultCampaignBudget || 1000}
                                    onChange={(e) => updateField('ads.defaultCampaignBudget', parseInt(e.target.value) || 1000)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="1000"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Find your Ad Account ID in{' '}
                            <a 
                                href="https://business.facebook.com/ads/manager/account_settings" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:underline"
                            >
                                Meta Ads Manager → Account Settings
                            </a>
                        </p>
                    </div>

                    {/* Automated Ads */}
                    <div className="border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-600" />
                                Automated Ads
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.ads?.automatedAds?.enabled || false}
                                    onChange={(e) => updateField('ads.automatedAds.enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h6 className="font-medium text-gray-800">Product Promotion</h6>
                                        <p className="text-sm text-gray-500">Auto-create ads for new products</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.ads?.automatedAds?.productPromotion || false}
                                        onChange={(e) => updateField('ads.automatedAds.productPromotion', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h6 className="font-medium text-gray-800">Retargeting</h6>
                                        <p className="text-sm text-gray-500">Show ads to website visitors</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.ads?.automatedAds?.retargeting || false}
                                        onChange={(e) => updateField('ads.automatedAds.retargeting', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Overview */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-5 border border-orange-200">
                        <h5 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Campaign Overview
                        </h5>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">৳15,420</p>
                                <p className="text-sm text-gray-500">Total Spent</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">3.2K</p>
                                <p className="text-sm text-gray-500">Conversions</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">45.2K</p>
                                <p className="text-sm text-gray-500">Reach</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border text-center">
                                <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-800">2.8%</p>
                                <p className="text-sm text-gray-500">CTR</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Ads Settings"
                            className="bg-orange-600 hover:bg-orange-700"
                        />
                        <a
                            href="https://business.facebook.com/ads/manager"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Meta Ads Manager
                        </a>
                        <a
                            href="https://business.facebook.com/adsmanager/audiences"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            Audiences
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
