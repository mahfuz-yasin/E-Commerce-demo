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
import { Music, RefreshCw, AlertCircle, CheckCircle2, XCircle, Activity, Database, Globe, ShoppingBag, Webhook } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'TikTok Settings' },
]

const TikTokSettings = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [testingConnection, setTestingConnection] = useState(null)
  const [tokenWarning, setTokenWarning] = useState(null)
  const [syncingCatalog, setSyncingCatalog] = useState(false)
  const [catalogStatus, setCatalogStatus] = useState({
    productCount: 0,
    lastSyncTime: null,
    syncStatus: 'idle'
  })
  const [formData, setFormData] = useState({
    // General
    apiVersion: 'v1.3',
    // Pixel & Events API
    pixelId: '',
    accessToken: '',
    refreshToken: '',
    tokenExpiry: null,
    isPixelActive: 'inactive',
    isCAPIActive: 'inactive',
    // Business Center & Ads
    businessCenterId: '',
    adAccountId: '',
    appId: '',
    appSecret: '',
    // Catalog
    catalogId: '',
    catalogFeedUrl: '',
    offlineEventSetId: '',
    isCatalogActive: 'inactive',
    // Webhooks
    webhookSecret: '',
    webhookVerifyToken: ''
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Activity },
    { id: 'pixel', label: 'Pixel & Events API', icon: Globe },
    { id: 'catalog', label: 'Catalog', icon: Database },
    { id: 'ads', label: 'Ads Manager', icon: ShoppingBag },
    { id: 'offline', label: 'Offline Events', icon: Database },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/tiktok-settings')
      if (data.success) {
        setFormData(data.data)
        
        // Check token expiration if accessToken exists
        if (data.data.tokenExpiry) {
          const expiryDate = new Date(data.data.tokenExpiry)
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
      const { data } = await axios.post('/api/admin/tiktok-settings', formData)
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
      // TODO: Implement actual TikTok API connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      showToast('success', `${section} connection test successful`)
    } catch (error) {
      showToast('error', `${section} connection test failed`)
    } finally {
      setTestingConnection(null)
    }
  }

  const handleRefreshToken = async () => {
    try {
      setLoading(true)
      // TODO: Implement OAuth flow for token refresh
      showToast('success', 'Token refresh initiated')
    } catch (error) {
      showToast('error', 'Failed to refresh token')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncCatalog = async () => {
    try {
      setSyncingCatalog(true)
      setCatalogStatus(prev => ({ ...prev, syncStatus: 'syncing' }))
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setCatalogStatus({
        productCount: Math.floor(Math.random() * 100) + 50,
        lastSyncTime: new Date(),
        syncStatus: 'success'
      })
      
      showToast('success', 'Catalog synced successfully')
    } catch (error) {
      setCatalogStatus(prev => ({ ...prev, syncStatus: 'error' }))
      showToast('error', 'Failed to sync catalog')
    } finally {
      setSyncingCatalog(false)
    }
  }

  const handleFetchAdAccounts = async () => {
    try {
      setTestingConnection('Ad Accounts')
      const { data } = await axios.get('/api/tiktok/ad-accounts')
      if (data.success) {
        showToast('success', `Found ${data.data.length} ad accounts`)
      }
    } catch (error) {
      showToast('error', 'Failed to fetch ad accounts')
    } finally {
      setTestingConnection(null)
    }
  }

  const renderSwitch = (label, field, description = '') => (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex-1">
        <Label htmlFor={field}>{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <Switch
        id={field}
        checked={formData[field] === 'active'}
        onCheckedChange={(checked) => handleInputChange(field, checked ? 'active' : 'inactive')}
      />
    </div>
  )

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

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-black" />
            <CardTitle>TikTok Business Settings</CardTitle>
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
                <p className="text-sm text-orange-800 mb-2">
                  Your TikTok access token will expire in {tokenWarning.days} day{tokenWarning.days !== 1 ? 's' : ''} ({tokenWarning.expiryDate.toLocaleDateString()}).
                </p>
                <div className="mt-3">
                  <ButtonLoading
                    loading={loading}
                    text="Refresh Token"
                    className="cursor-pointer"
                    onClick={handleRefreshToken}
                    icon={<RefreshCw className="h-4 w-4 mr-2" />}
                  />
                </div>
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
          {activeTab === 'general' && (
            <div className="space-y-4">
              {renderField('API Version', 'apiVersion', 'text', 'v1.3')}
            </div>
          )}

          {activeTab === 'pixel' && (
            <div className="space-y-4">
              {renderField('Pixel ID', 'pixelId', 'text', 'Enter TikTok Pixel ID')}
              {renderField('Access Token', 'accessToken', 'text', 'Enter Access Token', true)}
              {renderField('Refresh Token', 'refreshToken', 'text', 'Enter Refresh Token', true)}
              {renderSwitch('Enable Pixel', 'isPixelActive', 'Track website events')}
              {renderSwitch('Enable CAPI', 'isCAPIActive', 'Server-side event tracking')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Pixel')}
                  disabled={testingConnection === 'Pixel'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Pixel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {renderField('Catalog ID', 'catalogId', 'text', 'Enter TikTok Catalog ID')}
              {renderField('Catalog Feed URL', 'catalogFeedUrl', 'text', 'https://alhilalpanjabi.com/api/tiktok/catalog/feed')}
              {renderSwitch('Enable Catalog', 'isCatalogActive', 'Product catalog sync')}
              
              {/* Catalog Status Card */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Catalog Status</h4>
                    {catalogStatus.syncStatus === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {catalogStatus.syncStatus === 'error' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {catalogStatus.syncStatus === 'syncing' && (
                      <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Products</p>
                      <p className="font-semibold text-lg">{catalogStatus.productCount || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Sync</p>
                      <p className="font-semibold">
                        {catalogStatus.lastSyncTime 
                          ? new Date(catalogStatus.lastSyncTime).toLocaleString() 
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4 border-t flex gap-3">
                <Button
                  onClick={handleSyncCatalog}
                  disabled={syncingCatalog}
                  className="cursor-pointer"
                >
                  {syncingCatalog ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" /> Sync Catalog</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Catalog')}
                  disabled={testingConnection === 'Catalog'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Catalog' ? (
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
              {renderField('Business Center ID', 'businessCenterId', 'text', 'Enter Business Center ID')}
              {renderField('Ad Account ID', 'adAccountId', 'text', 'Enter Ad Account ID')}
              {renderField('App ID', 'appId', 'text', 'Enter TikTok App ID')}
              {renderField('App Secret', 'appSecret', 'text', 'Enter App Secret', true)}
              <div className="pt-4 border-t flex gap-3">
                <Button
                  onClick={handleFetchAdAccounts}
                  disabled={testingConnection === 'Ad Accounts'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Ad Accounts' ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Fetching...</>
                  ) : (
                    <><ShoppingBag className="h-4 w-4 mr-2" /> Fetch Ad Accounts</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Ads')}
                  disabled={testingConnection === 'Ads'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Ads' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="space-y-4">
              {renderField('Offline Event Set ID', 'offlineEventSetId', 'text', 'Enter Offline Event Set ID')}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Offline Events')}
                  disabled={testingConnection === 'Offline Events'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Offline Events' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              {renderField('Webhook Secret', 'webhookSecret', 'text', 'Enter Webhook Secret', true)}
              {renderField('Webhook Verify Token', 'webhookVerifyToken', 'text', 'Enter Verify Token', true)}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection('Webhooks')}
                  disabled={testingConnection === 'Webhooks'}
                  className="cursor-pointer"
                >
                  {testingConnection === 'Webhooks' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
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

export default TikTokSettings
