'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { ShoppingBag, Store, CheckCircle, AlertCircle, ExternalLink, Package, Truck, CreditCard, Globe } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Shop Setup' },
]

const requirements = [
    { label: 'Business Account', description: 'Instagram Business or Creator account' },
    { label: 'Facebook Page', description: 'Connected Facebook Business Page' },
    { label: 'Product Catalog', description: 'Commerce Manager product catalog' },
    { label: 'Eligibility', description: 'Complies with commerce policies' },
    { label: 'Website', description: 'Domain verification required' }
]

export default function InstagramShopSetupPage() {
    const [config, setConfig] = useState({
        shop: {
            isEnabled: false,
            commerceAccountId: '',
            productCatalogId: '',
            checkoutEnabled: false,
            shippingCountries: ['BD'],
            currency: 'BDT'
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
                    shop: data.data.shop || prev.shop
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
                shop: config.shop
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Instagram Shop settings saved!')
            
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
                        <ShoppingBag className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Instagram Shop Setup</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg ${config.shop?.isEnabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-center gap-3">
                            {config.shop?.isEnabled ? (
                                <>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-green-800">Shop is Active</h5>
                                        <p className="text-green-600 text-sm">
                                            Your Instagram Shop is enabled and products can be tagged
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-yellow-800">Shop Not Enabled</h5>
                                        <p className="text-yellow-600 text-sm">
                                            Complete the setup to enable Instagram Shopping
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Shop Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h5 className="font-medium text-gray-800">Enable Instagram Shop</h5>
                            <p className="text-sm text-gray-500">Allow product tagging and shopping on Instagram</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.shop?.isEnabled || false}
                                onChange={(e) => updateField('shop.isEnabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Commerce Configuration */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-purple-600" />
                            Commerce Configuration
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commerce Account ID
                                </label>
                                <input
                                    type="text"
                                    value={config.shop?.commerceAccountId || ''}
                                    onChange={(e) => updateField('shop.commerceAccountId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter Commerce Account ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Catalog ID
                                </label>
                                <input
                                    type="text"
                                    value={config.shop?.productCatalogId || ''}
                                    onChange={(e) => updateField('shop.productCatalogId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter Product Catalog ID"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Find these IDs in{' '}
                            <a 
                                href="https://business.facebook.com/commerce" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline"
                            >
                                Meta Commerce Manager
                            </a>
                        </p>
                    </div>

                    {/* Checkout Settings */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Checkout Settings
                        </h5>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h6 className="font-medium text-gray-800">In-App Checkout</h6>
                                    <p className="text-sm text-gray-500">Allow customers to checkout directly on Instagram</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.shop?.checkoutEnabled || false}
                                        onChange={(e) => updateField('shop.checkoutEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={config.shop?.currency || 'BDT'}
                                        onChange={(e) => updateField('shop.currency', e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                                        <option value="USD">USD ($) - US Dollar</option>
                                        <option value="EUR">EUR (€) - Euro</option>
                                        <option value="GBP">GBP (£) - British Pound</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shipping Countries (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.shop?.shippingCountries?.join(', ') || ''}
                                        onChange={(e) => updateField('shop.shippingCountries', e.target.value.split(',').map(s => s.trim()))}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="BD, US, UK"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Requirements for Instagram Shopping
                        </h5>
                        <div className="grid md:grid-cols-2 gap-3">
                            {requirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-blue-700">{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-900">{req.label}</p>
                                        <p className="text-sm text-blue-700">{req.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Shop Settings"
                            className="bg-purple-600 hover:bg-purple-700"
                        />
                        <a
                            href="https://business.facebook.com/commerce"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <Store className="w-4 h-4" />
                            Commerce Manager
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                            href="https://www.facebook.com/business/help/235729363119583"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Shopping Help Center
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
