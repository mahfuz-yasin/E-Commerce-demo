'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_BUSINESS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Check, X, Facebook, RefreshCw } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Business Manager' },
]

const FacebookBusinessManager = () => {
  const [loading, setLoading] = useState(false)
  const [fetchingAccounts, setFetchingAccounts] = useState(false)
  const [validation, setValidation] = useState({})
  const [adAccounts, setAdAccounts] = useState([])
  const [tokenExpiry, setTokenExpiry] = useState(null)
  const [tokenWarning, setTokenWarning] = useState(null)
  
  const [formData, setFormData] = useState({
    businessManagerId: '',
    adAccountId: '',
    businessManagerStatus: 'inactive',
    capiMethod: 'DIRECT_GRAPH_API',
    capiGatewayUrl: '',
    enableLDU: false,
    offlineSyncEnabled: true,
    variantTracking: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/facebook-settings')
      if (data.success) {
        setFormData(data.data)
        
        // Check token expiration if capiAccessToken exists
        if (data.data.capiAccessToken) {
          const tokenData = parseJWT(data.data.capiAccessToken)
          if (tokenData && tokenData.exp) {
            const expiryDate = new Date(tokenData.exp * 1000)
            const now = new Date()
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
            
            setTokenExpiry(expiryDate)
            
            if (daysUntilExpiry <= 7) {
              setTokenWarning({
                days: daysUntilExpiry,
                expiryDate: expiryDate
              })
            } else {
              setTokenWarning(null)
            }
          }
        }
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      return null
    }
  }

  const fetchAdAccounts = async () => {
    try {
      setFetchingAccounts(true)
      const { data } = await axios.get('/api/facebook/business-manager/ads-accounts')
      if (data.success) {
        setAdAccounts(data.data)
        showToast('success', `Found ${data.data.length} ad accounts`)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch ad accounts')
    } finally {
      setFetchingAccounts(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field, value) => {
    let isValid = true
    if (field === 'businessManagerId' && value) {
      isValid = /^\d+$/.test(value)
    } else if (field === 'adAccountId' && value) {
      isValid = /^act_\d+$/.test(value) || /^\d+$/.test(value)
    }
    setValidation(prev => ({ ...prev, [field]: isValid }))
  }

  const handleRefreshToken = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/facebook/refresh-token')
      if (data.success) {
        showToast('success', data.message)
        await fetchSettings()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to refresh token')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/facebook-settings', formData)
      if (data.success) {
        showToast('success', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (label, field, placeholder = '') => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="flex-1 relative">
        <Input
          id={field}
          type="text"
          placeholder={placeholder}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={validation[field] === false ? 'border-red-500' : validation[field] === true ? 'border-green-500' : ''}
        />
        {validation[field] !== undefined && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            {validation[field] ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
          </div>
        )}
      </div>
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
        onCheckedChange={(checked) => handleInputChange(field, checked)}
      />
    </div>
  )

  const renderSelect = (label, field, options) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <select
        id={field}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Business Manager Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {tokenWarning && (
        <Card className="mb-6 border-2 border-orange-500 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <RefreshCw className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">Token Expiration Warning</h3>
                <p className="text-sm text-orange-800 mb-2">
                  Your Facebook CAPI access token will expire in {tokenWarning.days} day{tokenWarning.days !== 1 ? 's' : ''} ({tokenWarning.expiryDate.toLocaleDateString()}).
                </p>
                <p className="text-sm text-orange-700">
                  Please refresh your token to ensure uninterrupted tracking. Go to Facebook Business Manager to generate a new long-lived token.
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

      {/* Ad Accounts Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ad Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <ButtonLoading
                loading={fetchingAccounts}
                text="Fetch Ad Accounts"
                className="cursor-pointer"
                onClick={fetchAdAccounts}
                icon={<RefreshCw className="h-4 w-4 mr-2" />}
              />
            </div>

            {adAccounts.length > 0 && (
              <div className="space-y-2">
                <Label>Select Ad Account</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {adAccounts.map(account => (
                    <div
                      key={account.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.adAccountId === account.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('adAccountId', account.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-600">{account.id}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">{account.currency}</p>
                          <p className={`text-xs ${account.account_status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                            {account.account_status === 1 ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {renderField('Business Manager ID', 'businessManagerId', 'Enter Business Manager ID')}
            {renderField('Ad Account ID', 'adAccountId', 'Enter Ad Account ID (e.g., act_123456789)')}
            
            <div className="space-y-4 pt-4 border-t">
              {renderSwitch('Enable Business Manager', 'businessManagerStatus')}
            </div>

            {/* 2026 Enterprise Settings */}
            <div className="space-y-6 pt-6 border-t border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">2026 Enterprise Settings</h3>
              
              {renderSelect('CAPI Method', 'capiMethod', [
                { value: 'DIRECT_GRAPH_API', label: 'Direct Graph API (Default)' },
                { value: 'CAPI_GATEWAY', label: 'CAPI Gateway (AWS/Stape.io)' }
              ])}
              
              {formData.capiMethod === 'CAPI_GATEWAY' && renderField('CAPI Gateway URL', 'capiGatewayUrl', 'Enter CAPI Gateway URL')}
              
              {renderSwitch('Enable Limited Data Use (LDU)', 'enableLDU', 'Automatically restrict data for privacy-compliant regions')}
              {renderSwitch('Offline Event Sync', 'offlineSyncEnabled', 'Sync order status changes to Facebook for real ROAS')}
              {renderSwitch('Variant Tracking', 'variantTracking', 'Track specific product variants (SKU, size, color)')}
            </div>
          </div>

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

export default FacebookBusinessManager
