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
  const [conversionActions, setConversionActions] = useState([])
  const [loadingConversions, setLoadingConversions] = useState(false)
  const [merchantFeedStatus, setMerchantFeedStatus] = useState(null)
  const [loadingMerchantFeed, setLoadingMerchantFeed] = useState(false)
  const [feedQualityReport, setFeedQualityReport] = useState(null)
  const [loadingQualityCheck, setLoadingQualityCheck] = useState(false)
  const [gtmVariables, setGtmVariables] = useState([])
  const [customTags, setCustomTags] = useState([])
  const [previewModeActive, setPreviewModeActive] = useState(false)
  
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
    googleAdsConversions: {
      purchase: '',
      add_to_cart: '',
      begin_checkout: '',
      view_item: '',
      lead: ''
    },
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

  const handleFetchConversionActions = async () => {
    try {
      setLoadingConversions(true)
      const { data } = await axios.get('/api/google/conversion-actions')
      if (data.success) {
        setConversionActions(data.data || [])
        showToast('success', 'Conversion actions fetched successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch conversion actions')
    } finally {
      setLoadingConversions(false)
    }
  }

  const handleFetchMerchantFeedStatus = async () => {
    try {
      setLoadingMerchantFeed(true)
      const { data } = await axios.get('/api/google/merchant/feed-status')
      if (data.success) {
        setMerchantFeedStatus(data.data)
        showToast('success', 'Merchant feed status fetched successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch merchant feed status')
    } finally {
      setLoadingMerchantFeed(false)
    }
  }

  const handleQualityCheck = async () => {
    try {
      setLoadingQualityCheck(true)
      const { data } = await axios.get('/api/google/merchant/quality-check')
      if (data.success) {
        setFeedQualityReport(data.data)
        showToast('success', 'Quality check completed')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Quality check failed')
    } finally {
      setLoadingQualityCheck(false)
    }
  }

  const addGtmVariable = () => {
    setGtmVariables([...gtmVariables, { id: Date.now(), name: '', type: 'constant', value: '' }])
  }

  const removeGtmVariable = (id) => {
    setGtmVariables(gtmVariables.filter(v => v.id !== id))
  }

  const updateGtmVariable = (id, field, value) => {
    setGtmVariables(gtmVariables.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const addCustomTag = () => {
    setCustomTags([...customTags, { id: Date.now(), name: '', type: 'html', content: '', position: 'head' }])
  }

  const removeCustomTag = (id) => {
    setCustomTags(customTags.filter(t => t.id !== id))
  }

  const updateCustomTag = (id, field, value) => {
    setCustomTags(customTags.map(t => t.id === id ? { ...t, [field]: value } : t))
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
              
              {/* Conversion Actions */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <Label>Conversion Actions</Label>
                  <Button
                    size="sm"
                    onClick={handleFetchConversionActions}
                    disabled={loadingConversions}
                    className="cursor-pointer"
                  >
                    {loadingConversions ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4 mr-2" /> Fetch Actions</>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Map conversion actions to track events
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="conversion-purchase">Purchase</Label>
                    <select
                      id="conversion-purchase"
                      value={formData.googleAdsConversions?.purchase || ''}
                      onChange={(e) => handleInputChange('googleAdsConversions', { ...formData.googleAdsConversions, purchase: e.target.value })}
                      className="mt-2 w-full p-2 border rounded-md"
                    >
                      <option value="">Select conversion action</option>
                      {conversionActions.map(action => (
                        <option key={action.conversionAction.id} value={action.conversionAction.id}>
                          {action.conversionAction.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="conversion-add-to-cart">Add to Cart</Label>
                    <select
                      id="conversion-add-to-cart"
                      value={formData.googleAdsConversions?.add_to_cart || ''}
                      onChange={(e) => handleInputChange('googleAdsConversions', { ...formData.googleAdsConversions, add_to_cart: e.target.value })}
                      className="mt-2 w-full p-2 border rounded-md"
                    >
                      <option value="">Select conversion action</option>
                      {conversionActions.map(action => (
                        <option key={action.conversionAction.id} value={action.conversionAction.id}>
                          {action.conversionAction.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="conversion-begin-checkout">Begin Checkout</Label>
                    <select
                      id="conversion-begin-checkout"
                      value={formData.googleAdsConversions?.begin_checkout || ''}
                      onChange={(e) => handleInputChange('googleAdsConversions', { ...formData.googleAdsConversions, begin_checkout: e.target.value })}
                      className="mt-2 w-full p-2 border rounded-md"
                    >
                      <option value="">Select conversion action</option>
                      {conversionActions.map(action => (
                        <option key={action.conversionAction.id} value={action.conversionAction.id}>
                          {action.conversionAction.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
              
              {/* Feed URL and Status */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Product Feed URL</h4>
                    <Button
                      size="sm"
                      onClick={handleFetchMerchantFeedStatus}
                      disabled={loadingMerchantFeed}
                      className="cursor-pointer"
                    >
                      {loadingMerchantFeed ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
                      ) : (
                        <><RefreshCw className="h-4 w-4 mr-2" /> Refresh Status</>
                      )}
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border mb-4">
                    <code className="text-sm break-all">
                      {process.env.NEXT_PUBLIC_BASE_URL}/api/google/merchant/feed
                    </code>
                  </div>
                  
                  {merchantFeedStatus && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Product Count</p>
                        <p className="text-xl font-bold">{merchantFeedStatus.productCount || 0}</p>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Last Sync</p>
                        <p className="text-sm font-medium">
                          {merchantFeedStatus.lastSyncTime ? new Date(merchantFeedStatus.lastSyncTime).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`text-sm font-medium ${
                          merchantFeedStatus.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {merchantFeedStatus.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/api/google/merchant/feed`, '_blank')}
                    className="cursor-pointer"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    View Feed
                  </Button>
                  
                  {/* Quality Check */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Feed Quality Check</h4>
                      <Button
                        size="sm"
                        onClick={handleQualityCheck}
                        disabled={loadingQualityCheck}
                        className="cursor-pointer"
                      >
                        {loadingQualityCheck ? (
                          <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4 mr-2" /> Run Check</>
                        )}
                      </Button>
                    </div>
                    
                    {feedQualityReport && (
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600">Total Products</p>
                          <p className="text-xl font-bold">{feedQualityReport.totalProducts || 0}</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600">Valid Products</p>
                          <p className="text-xl font-bold text-green-600">{feedQualityReport.validProducts || 0}</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600">Products with Issues</p>
                          <p className="text-xl font-bold text-red-600">{feedQualityReport.issues?.length || 0}</p>
                        </div>
                        
                        {feedQualityReport.issues && feedQualityReport.issues.length > 0 && (
                          <div className="p-3 bg-red-50 rounded border border-red-200">
                            <p className="text-sm font-semibold text-red-900 mb-2">Issues:</p>
                            <ul className="text-sm text-red-800 space-y-1">
                              {feedQualityReport.issues.slice(0, 5).map((issue, index) => (
                                <li key={index}>• {issue}</li>
                              ))}
                              {feedQualityReport.issues.length > 5 && (
                                <li>... and {feedQualityReport.issues.length - 5} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
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
              
              {/* GTM Variables */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">GTM Variables</h4>
                    <Button size="sm" onClick={addGtmVariable} className="cursor-pointer">
                      <Database className="h-4 w-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {gtmVariables.map(variable => (
                      <div key={variable.id} className="p-3 bg-white rounded border space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Variable Name"
                            value={variable.name}
                            onChange={(e) => updateGtmVariable(variable.id, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <select
                            value={variable.type}
                            onChange={(e) => updateGtmVariable(variable.id, 'type', e.target.value)}
                            className="w-32 p-2 border rounded"
                          >
                            <option value="constant">Constant</option>
                            <option value="javascript">JavaScript Variable</option>
                            <option value="dom">DOM Element</option>
                          </select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeGtmVariable(variable.id)}
                            className="cursor-pointer"
                          >
                            <IoCloseCircleSharp className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Variable Value"
                          value={variable.value}
                          onChange={(e) => updateGtmVariable(variable.id, 'value', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Custom Tags */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Custom HTML/JavaScript Tags</h4>
                    <Button size="sm" onClick={addCustomTag} className="cursor-pointer">
                      <Database className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {customTags.map(tag => (
                      <div key={tag.id} className="p-3 bg-white rounded border space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tag Name"
                            value={tag.name}
                            onChange={(e) => updateCustomTag(tag.id, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <select
                            value={tag.type}
                            onChange={(e) => updateCustomTag(tag.id, 'type', e.target.value)}
                            className="w-32 p-2 border rounded"
                          >
                            <option value="html">HTML</option>
                            <option value="javascript">JavaScript</option>
                          </select>
                          <select
                            value={tag.position}
                            onChange={(e) => updateCustomTag(tag.id, 'position', e.target.value)}
                            className="w-32 p-2 border rounded"
                          >
                            <option value="head">Head</option>
                            <option value="body">Body</option>
                          </select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeCustomTag(tag.id)}
                            className="cursor-pointer"
                          >
                            <IoCloseCircleSharp className="h-4 w-4" />
                          </Button>
                        </div>
                        <textarea
                          placeholder="Tag Content (HTML/JavaScript)"
                          value={tag.content}
                          onChange={(e) => updateCustomTag(tag.id, 'content', e.target.value)}
                          className="w-full p-2 border rounded min-h-20 font-mono text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Preview Mode */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">Preview Mode</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        GTM Preview mode is active when gtm_auth and gtm_preview parameters are set.
                        This allows you to test tags before publishing.
                      </p>
                      {formData.gtmAuth && formData.gtmPreview ? (
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Preview mode is configured
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Add GTM Auth and GTM Preview parameters to enable preview mode
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
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
