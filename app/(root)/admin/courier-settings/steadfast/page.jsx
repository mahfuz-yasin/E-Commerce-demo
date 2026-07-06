'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_COURIER_SETTINGS } from '@/routes/AdminPanelRoute'
import { Truck, Save, CheckCircle, AlertCircle, Wifi, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_COURIER_SETTINGS, label: 'Courier Settings' },
    { href: '', label: 'Steadfast Courier' },
]

const defaultConfig = {
    courierName: 'steadfast',
    displayName: 'Steadfast Courier',
    isActive: false,
    apiConfig: {
        baseUrl: 'https://portal.steadfast.com.bd/api/v1',
        apiKey: '',
        secretKey: '',
        additionalConfig: {}
    },
    settings: {
        autoAssign: false,
        defaultCodAmount: 'full',
        customCodAmount: 0,
        webhookUrl: ''
    }
}

export default function SteadfastSettingsPage() {
    const [config, setConfig] = useState(defaultConfig)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [showApiKey, setShowApiKey] = useState(false)
    const [showSecretKey, setShowSecretKey] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/courier/config/steadfast')
            if (data.success && data.data) {
                setConfig(data.data)
            }
        } catch (error) {
            // No existing config, use defaults
            console.log('No existing config found')
        } finally {
            setLoading(false)
        }
    }

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const { data } = await axios.post('/api/admin/courier/test', {
                courierName: 'steadfast',
                apiKey: config.apiConfig.apiKey,
                secretKey: config.apiConfig.secretKey,
                baseUrl: config.apiConfig.baseUrl,
            })
            setTestResult({ success: data.success, message: data.message })
            showToast(data.success ? 'success' : 'error', data.message)
        } catch (error) {
            const msg = error?.response?.data?.message || 'Connection test failed.'
            setTestResult({ success: false, message: msg })
            showToast('error', msg)
        } finally {
            setTesting(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await axios.post('/api/admin/courier/config', config)
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Steadfast courier settings saved successfully!')
            
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
                <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    const credentialsMissing = !config.apiConfig?.apiKey || !config.apiConfig?.secretKey

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {credentialsMissing && (
                <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Steadfast API credentials not configured</p>
                        <p className="mt-0.5 text-amber-700">Enter your <strong>API Key</strong> and <strong>Secret Key</strong> below and click <strong>Save Settings</strong>. You can get these from{' '}
                            <a href="https://portal.steadfast.com.bd/settings/api" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                                portal.steadfast.com.bd → Settings → API
                            </a>.
                        </p>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-bold text-primary">Steadfast Courier Settings</h4>
                    </div>
                    {config.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4" /> Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                            <AlertCircle className="w-4 h-4" /> Inactive
                        </span>
                    )}
                </div>

                <div className="p-5 space-y-6">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h5 className="font-medium text-gray-800">Enable Steadfast Courier</h5>
                            <p className="text-sm text-gray-500">Activate this courier for order processing</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* API Configuration */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-blue-500 rounded"></span>
                            API Configuration
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Base URL
                                </label>
                                <input
                                    type="text"
                                    value={config.apiConfig.baseUrl}
                                    onChange={(e) => updateField('apiConfig.baseUrl', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://portal.steadfast.com.bd/api/v1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={config.displayName}
                                    onChange={(e) => updateField('displayName', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Steadfast Courier"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={config.apiConfig.apiKey}
                                        onChange={(e) => updateField('apiConfig.apiKey', e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your Steadfast API key"
                                    />
                                    <button type="button" onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Secret Key <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showSecretKey ? 'text' : 'password'}
                                        value={config.apiConfig.secretKey}
                                        onChange={(e) => updateField('apiConfig.secretKey', e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your Steadfast secret key"
                                    />
                                    <button type="button" onClick={() => setShowSecretKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                Get your credentials from{' '}
                                <a href="https://portal.steadfast.com.bd/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                                    Steadfast Portal <ExternalLink className="w-3 h-3" />
                                </a>
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTest}
                                disabled={testing || !config.apiConfig.apiKey || !config.apiConfig.secretKey}
                                className="flex items-center gap-1.5"
                            >
                                <Wifi className="w-4 h-4" />
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </div>
                        {testResult && (
                            <div className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                                testResult.success
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {testResult.success
                                    ? <CheckCircle className="w-4 h-4 shrink-0" />
                                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>

                    {/* Delivery Settings */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-green-500 rounded"></span>
                            Delivery Settings
                        </h5>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h6 className="font-medium text-gray-800">Auto Assign Courier</h6>
                                    <p className="text-sm text-gray-500">Automatically assign this courier when order is confirmed</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.settings.autoAssign}
                                        onChange={(e) => updateField('settings.autoAssign', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default COD Amount
                                </label>
                                <select
                                    value={config.settings.defaultCodAmount}
                                    onChange={(e) => updateField('settings.defaultCodAmount', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="full">Full Order Amount</option>
                                    <option value="custom">Custom Amount</option>
                                </select>
                            </div>

                            {config.settings.defaultCodAmount === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom COD Amount (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.settings.customCodAmount}
                                        onChange={(e) => updateField('settings.customCodAmount', parseFloat(e.target.value) || 0)}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Settings"
                            className="bg-blue-600 hover:bg-blue-700 px-8"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
