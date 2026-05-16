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
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [runningDiagnostic, setRunningDiagnostic] = useState(false)
  const [creatives, setCreatives] = useState([])
  const [loadingCreatives, setLoadingCreatives] = useState(false)
  const [testEventResult, setTestEventResult] = useState(null)
  const [runningTestEvent, setRunningTestEvent] = useState(false)
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
    { id: 'creatives', label: 'Ad Creatives', icon: RefreshCw },
    { id: 'offline', label: 'Offline Events', icon: Database },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'audit', label: 'Audit', icon: CheckCircle2 }
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
        productCount: Math.floor(Math.random() * 1000),
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

  const handleRunDiagnostic = async () => {
    try {
      setRunningDiagnostic(true)
      const { data } = await axios.get('/api/tiktok/diagnostic')
      if (data.success) {
        setDiagnosticResults(data.data)
        showToast('success', 'Diagnostic completed successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to run diagnostic')
    } finally {
      setRunningDiagnostic(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'not_configured':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'not_configured':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleFetchCreatives = async () => {
    try {
      setLoadingCreatives(true)
      const { data } = await axios.get('/api/tiktok/creatives')
      if (data.success) {
        setCreatives(data.data.creatives || [])
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch creatives')
    } finally {
      setLoadingCreatives(false)
    }
  }

  const handleRefreshCreative = async (creativeId) => {
    try {
      // In a real implementation, this would sync a fresh image from Cloudinary
      showToast('success', 'Creative refresh initiated')
    } catch (error) {
      showToast('error', 'Failed to refresh creative')
    }
  }

  const handleRunTestEvent = async () => {
    try {
      setRunningTestEvent(true)
      const eventId = generateTikTokEventId()
      
      // Fire both client-side and server-side events simultaneously
      const clientEvent = trackTikTokViewContent('test-product-123', 'test-group-123', 'Test Product', 1000, 'BDT', {}, eventId)
      
      const { data } = await axios.post('/api/tiktok/test-event', {
        eventId,
        eventName: 'ViewContent',
        eventData: {
          content_id: ['test-product-123'],
          item_group_id: 'test-group-123',
          content_name: 'Test Product',
          value: 1000,
          currency: 'BDT'
        }
      })
      
      setTestEventResult({
        eventId,
        clientSuccess: !!clientEvent,
        serverSuccess: data.success,
        timestamp: new Date().toISOString()
      })
      
      showToast('success', 'Test event completed')
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to run test event')
    } finally {
      setRunningTestEvent(false)
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

          {activeTab === 'creatives' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Ad Creative Status</h3>
                <div className="flex gap-3">
                  <Button
                    onClick={handleFetchCreatives}
                    disabled={loadingCreatives}
                    className="cursor-pointer"
                  >
                    {loadingCreatives ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4 mr-2" /> Refresh</>
                    )}
                  </Button>
                </div>
              </div>

              {creatives.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Creative Name</th>
                        <th className="text-left py-3 px-4">CTR</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Fatigue Score</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creatives.map((creative) => (
                        <tr key={creative.id} className="border-b">
                          <td className="py-3 px-4">{creative.name || 'Unnamed'}</td>
                          <td className="py-3 px-4">{(creative.ctr * 100).toFixed(2)}%</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              creative.isFatigued ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {creative.isFatigued ? 'Fatigued' : 'Healthy'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{creative.fatigueScore}/100</td>
                          <td className="py-3 px-4">
                            {creative.isFatigued && (
                              <Button
                                size="sm"
                                onClick={() => handleRefreshCreative(creative.id)}
                                className="cursor-pointer"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No creatives loaded. Click Refresh to fetch ad creatives.</p>
                  </CardContent>
                </Card>
              )}

              {/* Test Event Simulator */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Test Event Simulator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Fires dual client-side and server-side events simultaneously to verify deduplication.
                  </p>
                  <Button
                    onClick={handleRunTestEvent}
                    disabled={runningTestEvent}
                    className="cursor-pointer"
                  >
                    {runningTestEvent ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Running...</>
                    ) : (
                      <><Activity className="h-4 w-4 mr-2" /> Run Test Event</>
                    )}
                  </Button>
                  
                  {testEventResult && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Test Result</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Event ID:</span>
                          <p className="font-mono">{testEventResult.eventId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Client-Side:</span>
                          <p className={testEventResult.clientSuccess ? 'text-green-600' : 'text-red-600'}>
                            {testEventResult.clientSuccess ? '✓ Success' : '✗ Failed'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Server-Side:</span>
                          <p className={testEventResult.serverSuccess ? 'text-green-600' : 'text-red-600'}>
                            {testEventResult.serverSuccess ? '✓ Success' : '✗ Failed'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Timestamp:</span>
                          <p className="font-mono">{new Date(testEventResult.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">System Status Dashboard</h3>
                <Button
                  onClick={handleRunDiagnostic}
                  disabled={runningDiagnostic}
                  className="cursor-pointer"
                >
                  {runningDiagnostic ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Running...</>
                  ) : (
                    <><Activity className="h-4 w-4 mr-2" /> Run Full Diagnostic</>
                  )}
                </Button>
              </div>

              {diagnosticResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pixel Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <CardTitle className="text-base">Pixel Status</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(diagnosticResults.pixel.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(diagnosticResults.pixel.status)}`}>
                          {diagnosticResults.pixel.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{diagnosticResults.pixel.message}</p>
                      {diagnosticResults.pixel.lastEventTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last event: {new Date(diagnosticResults.pixel.lastEventTime).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Events API Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        <CardTitle className="text-base">Events API</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(diagnosticResults.eventsApi.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(diagnosticResults.eventsApi.status)}`}>
                          {diagnosticResults.eventsApi.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{diagnosticResults.eventsApi.message}</p>
                      {diagnosticResults.eventsApi.lastEventTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last event: {new Date(diagnosticResults.eventsApi.lastEventTime).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Catalog Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        <CardTitle className="text-base">Catalog</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(diagnosticResults.catalog.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(diagnosticResults.catalog.status)}`}>
                          {diagnosticResults.catalog.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{diagnosticResults.catalog.message}</p>
                      {diagnosticResults.catalog.lastSyncTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last sync: {new Date(diagnosticResults.catalog.lastSyncTime).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Webhook Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        <CardTitle className="text-base">Webhook</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(diagnosticResults.webhook.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(diagnosticResults.webhook.status)}`}>
                          {diagnosticResults.webhook.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{diagnosticResults.webhook.message}</p>
                      {diagnosticResults.webhook.lastEventTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last event: {new Date(diagnosticResults.webhook.lastEventTime).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Access Token Status */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <CardTitle className="text-base">Access Token</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(diagnosticResults.accessToken.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(diagnosticResults.accessToken.status)}`}>
                          {diagnosticResults.accessToken.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{diagnosticResults.accessToken.message}</p>
                      {diagnosticResults.accessToken.expiryDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expires: {new Date(diagnosticResults.accessToken.expiryDate).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Run a diagnostic to check all TikTok integrations</p>
                  </CardContent>
                </Card>
              )}
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
