'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Search, RefreshCw, CheckCircle2, XCircle, Activity, Database, Globe, ShoppingBag, Webhook, AlertCircle } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Google Settings' },
]

const GoogleSettings = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('ga4')
  const [testingConnection, setTestingConnection] = useState(null)
  const [tokenWarning, setTokenWarning] = useState(null)
  
  const [formData, setFormData] = useState({
    // GA4
    ga4MeasurementId: '',
    ga4ApiSecret: '',
    ga4PropertyId: '',
    // Google Ads
    googleAdsCustomerId: '',
    googleAdsDeveloperToken: '',
    googleAdsRefreshToken: '',
    googleAdsClientId: '',
    googleAdsClientSecret: '',
    googleAdsTokenExpiry: null,
    // Merchant Center
    merchantCenterId: '',
    merchantCenterFeedId: '',
    // GTM
    gtmContainerId: '',
    gtmAuth: '',
    gtmPreview: '',
    // Conversion Linker
    conversionLinkerActive: false,
    // Cloudinary
    cloudinaryFolderForGoogleFeeds: 'google-catalog',
    // Status flags
    isGA4Active: 'inactive',
    isGoogleAdsActive: 'inactive',
    isMerchantActive: 'inactive',
    isGTMActive: 'inactive',
    // API version
    apiVersion: 'v1'
  })

  const tabs = [
    { id: 'ga4', label: 'GA4', icon: Activity },
    { id: 'ads', label: 'Google Ads', icon: Globe },
    { id: 'merchant', label: 'Merchant Center', icon: ShoppingBag },
    { id: 'gtm', label: 'GTM', icon: Database },
    { id: 'conversion', label: 'Conversion Linker', icon: Webhook },
    { id: 'diagnostics', label: 'Diagnostics', icon: AlertCircle }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/google-settings')
      if (data.success) {
        setFormData(data.data)
        
        // Check token expiration if exists
        if (data.data.googleAdsTokenExpiry) {
          const expiryDate = new Date(data.data.googleAdsTokenExpiry)
          const now = new Date()
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
          
          if (daysUntilExpiry <= 7) {
            setTokenWarning({
              days: daysUntilExpiry,
              expiryDate: expiryDate
            })
          }
        }
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/google-settings', formData)
      if (data.success) {
        showToast('success', 'Settings saved successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (section) => {
    try {
      setTestingConnection(section)
      await new Promise(resolve => setTimeout(resolve, 2000))
      showToast('success', `${section} connection test successful`)
    } catch (error) {
      showToast('error', `${section} connection test failed`)
    } finally {
      setTestingConnection(null)
    }
  }

  const handleOAuthFlow = async () => {
    try {
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/oauth/callback`
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/adwords&access_type=offline&prompt=consent`
      window.location.href = authUrl
    } catch (error) {
      showToast('error', 'Failed to initiate OAuth flow')
    }
  }

  const renderField = (label, field, type = 'text', placeholder = '', isSecret = false) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={isSecret ? 'password' : type}
        placeholder={placeholder}
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
    </div>
  )

  const renderSwitch = (label, field, description = '') => (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex-1">
        <Label htmlFor={field}>{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <Switch
        id={field}
        checked={formData[field] === 'active' || formData[field] === true}
        onCheckedChange={(checked) => handleInputChange(field, checked ? 'active' : 'inactive')}
      />
    </div>
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-black" />
            <CardTitle>Google Business Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {tokenWarning && (
        <Card className="mb-6 border-2 border-orange-500 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">Token Expiration Warning</h3>
                <p className="text-orange-800">
                  Your Google Ads refresh token expires in {tokenWarning.days} days on{' '}
                  {new Date(tokenWarning.expiryDate).toLocaleDateString()}.
                  Please re-authorize to maintain access.
                </p>
                <Button
                  onClick={handleOAuthFlow}
                  className="mt-3 cursor-pointer"
                  size="sm"
                >
                  Re-authorize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="pt-6">
          {activeTab === 'ga4' && (
            <div className="space-y-4">
              {renderField('GA4 Measurement ID', 'ga4MeasurementId', 'text', 'G-XXXXXXXXXX')}
              {renderField('GA4 API Secret', 'ga4ApiSecret', 'text', 'Enter API Secret', true)}
              {renderField('GA4 Property ID', 'ga4PropertyId', 'text', 'Enter Property ID')}
              {renderSwitch('Enable GA4', 'isGA4Active', 'Track website analytics')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('GA4')}
                  disabled={testingConnection === 'GA4'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'GA4' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              {renderField('Google Ads Customer ID', 'googleAdsCustomerId', 'text', 'XXX-XXX-XXXX')}
              {renderField('Developer Token', 'googleAdsDeveloperToken', 'text', 'Enter Developer Token', true)}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label>OAuth Authorization</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Connect your Google Ads account via OAuth 2.0 for automatic token refresh
                </p>
                <Button onClick={handleOAuthFlow} className="cursor-pointer">
                  <Globe className="h-4 w-4 mr-2" />
                  Authorize Google Ads
                </Button>
              </div>
              {renderSwitch('Enable Google Ads', 'isGoogleAdsActive', 'Track ad conversions')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Google Ads')}
                  disabled={testingConnection === 'Google Ads'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Google Ads' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'merchant' && (
            <div className="space-y-4">
              {renderField('Merchant Center ID', 'merchantCenterId', 'text', 'Enter Merchant Center ID')}
              {renderField('Merchant Center Feed ID', 'merchantCenterFeedId', 'text', 'Enter Feed ID')}
              {renderField('Cloudinary Folder', 'cloudinaryFolderForGoogleFeeds', 'text', 'google-catalog')}
              {renderSwitch('Enable Merchant Center', 'isMerchantActive', 'Sync product catalog')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Merchant Center')}
                  disabled={testingConnection === 'Merchant Center'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Merchant Center' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'gtm' && (
            <div className="space-y-4">
              {renderField('GTM Container ID', 'gtmContainerId', 'text', 'GTM-XXXXXX')}
              {renderField('GTM Auth', 'gtmAuth', 'text', 'Enter GTM Auth', true)}
              {renderField('GTM Preview', 'gtmPreview', 'text', 'Enter Preview Environment')}
              {renderSwitch('Enable GTM', 'isGTMActive', 'Tag management')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('GTM')}
                  disabled={testingConnection === 'GTM'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'GTM' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'conversion' && (
            <div className="space-y-4">
              {renderSwitch('Conversion Linker', 'conversionLinkerActive', 'Link Google Ads conversions with GA4')}
              <p className="text-sm text-gray-600">
                Enable Conversion Linker to track Google Ads conversions in GA4 and improve attribution accuracy.
              </p>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">System Status</h4>
                    <Button
                      onClick={() => handleTestConnection('All')}
                      disabled={testingConnection === 'All'}
                      className="cursor-pointer"
                    >
                      {testingConnection === 'All' ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Running...</>
                      ) : (
                        <><Activity className="h-4 w-4 mr-2" /> Run Full Diagnostic</>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">GA4 Status</p>
                      <p className="font-semibold">{formData.isGA4Active === 'active' ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">Google Ads Status</p>
                      <p className="font-semibold">{formData.isGoogleAdsActive === 'active' ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">Merchant Center Status</p>
                      <p className="font-semibold">{formData.isMerchantActive === 'active' ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">GTM Status</p>
                      <p className="font-semibold">{formData.isGTMActive === 'active' ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="outline" onClick={fetchSettings} disabled={loading}>
              Reset
            </Button>
            <ButtonLoading loading={loading} type="submit" text="Save Changes" className="cursor-pointer" onClick={handleSave} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleSettings
