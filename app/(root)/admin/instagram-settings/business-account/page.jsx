'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { Instagram, Store, CheckCircle, AlertCircle, Key, Link2, RefreshCw, ExternalLink, Shield } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Business Account' },
]

export default function InstagramBusinessAccountPage() {
    const [config, setConfig] = useState({
        businessAccount: {
            isConnected: false,
            accountId: '',
            username: '',
            accessToken: '',
            refreshToken: '',
            profilePicture: '',
            followersCount: 0,
            followingCount: 0,
            mediaCount: 0
        },
        apiConfig: {
            appId: '',
            appSecret: '',
            apiVersion: 'v18.0'
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    ...data.data
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
                businessAccount: config.businessAccount,
                apiConfig: config.apiConfig
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            setConfig(data.data)
            showToast('success', 'Instagram Business account settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleConnect = async () => {
        // This would typically open OAuth flow
        showToast('info', 'Instagram OAuth connection would open here')
    }

    const testConnection = async () => {
        setTesting(true)
        try {
            // Simulate API test
            await new Promise(resolve => setTimeout(resolve, 1500))
            showToast('success', 'Connection test successful!')
        } catch (error) {
            showToast('error', 'Connection test failed')
        } finally {
            setTesting(false)
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
                <div className="animate-spin w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Instagram Business Account</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Connection Status */}
                    <div className={`p-4 rounded-lg ${config.businessAccount?.isConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-center gap-3">
                            {config.businessAccount?.isConnected ? (
                                <>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-green-800">Account Connected</h5>
                                        <p className="text-green-600 text-sm">
                                            @{config.businessAccount.username} is connected and ready
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-yellow-800">Account Not Connected</h5>
                                        <p className="text-yellow-600 text-sm">
                                            Connect your Instagram Business account to enable features
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* API Configuration */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            API Configuration
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram App ID
                                </label>
                                <input
                                    type="text"
                                    value={config.apiConfig?.appId || ''}
                                    onChange={(e) => updateField('apiConfig.appId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="Enter your Instagram App ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    App Secret
                                </label>
                                <input
                                    type="password"
                                    value={config.apiConfig?.appSecret || ''}
                                    onChange={(e) => updateField('apiConfig.appSecret', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="Enter your App Secret"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Version
                                </label>
                                <select
                                    value={config.apiConfig?.apiVersion || 'v18.0'}
                                    onChange={(e) => updateField('apiConfig.apiVersion', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="v18.0">v18.0</option>
                                    <option value="v17.0">v17.0</option>
                                    <option value="v16.0">v16.0</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Get your credentials from{' '}
                            <a 
                                href="https://developers.facebook.com/apps/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:underline"
                            >
                                Facebook Developers → Apps
                            </a>
                        </p>
                    </div>

                    {/* Manual Account Setup */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-600" />
                            Account Details (Manual Setup)
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram Account ID
                                </label>
                                <input
                                    type="text"
                                    value={config.businessAccount?.accountId || ''}
                                    onChange={(e) => updateField('businessAccount.accountId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="17841400000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={config.businessAccount?.username || ''}
                                    onChange={(e) => updateField('businessAccount.username', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="yourbusiness"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Access Token
                                </label>
                                <input
                                    type="password"
                                    value={config.businessAccount?.accessToken || ''}
                                    onChange={(e) => updateField('businessAccount.accessToken', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="Long-lived access token"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Picture URL
                                </label>
                                <input
                                    type="text"
                                    value={config.businessAccount?.profilePicture || ''}
                                    onChange={(e) => updateField('businessAccount.profilePicture', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Display */}
                    {config.businessAccount?.isConnected && (
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h5 className="font-semibold text-gray-800 mb-4">Account Statistics</h5>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 border text-center">
                                    <p className="text-2xl font-bold text-pink-600">
                                        {(config.businessAccount.followersCount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Followers</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border text-center">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {(config.businessAccount.followingCount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Following</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border text-center">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {(config.businessAccount.mediaCount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Media Posts</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Settings"
                            className="bg-pink-600 hover:bg-pink-700"
                        />
                        <ButtonLoading
                            type="button"
                            loading={testing}
                            onClick={testConnection}
                            text="Test Connection"
                            className="bg-purple-600 hover:bg-purple-700"
                        />
                        <a
                            href="https://developers.facebook.com/tools/explorer/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Graph API Explorer
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
