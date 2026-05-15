'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Check, X, Facebook, BookOpen, Copy, ExternalLink } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Pixel & CAPI' },
]

const FacebookPixelCAPI = () => {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [validation, setValidation] = useState({})
  
  const [formData, setFormData] = useState({
    pixelId: '',
    capiAccessToken: '',
    testEventCode: '',
    pixelStatus: 'inactive',
    capiStatus: 'inactive',
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
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field, value) => {
    let isValid = true
    if (field === 'pixelId' && value) {
      isValid = /^\d+$/.test(value)
    } else if (field === 'capiAccessToken' && value) {
      isValid = value.length >= 50
    }
    setValidation(prev => ({ ...prev, [field]: isValid }))
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

  const testConnection = async (type) => {
    try {
      setTesting(type)
      const { data } = await axios.post('/api/admin/facebook-settings/test-connection', { type })
      if (data.success) {
        showToast('success', data.message)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || `${type} connection test failed`)
    } finally {
      setTesting(null)
    }
  }

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const renderField = (label, field, type = 'text', placeholder = '', isPassword = false, canTest = false) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id={field}
            type={isPassword && !showPassword[field] ? 'password' : 'text'}
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
          {isPassword && (
            <button
              type="button"
              onClick={() => togglePassword(field)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {canTest && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => testConnection(label)}
            disabled={testing === label}
          >
            <RefreshCw className={`h-4 w-4 ${testing === label ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  )

  const renderSwitch = (label, field) => (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor={field}>{label}</Label>
      <Switch
        id={field}
        checked={formData[field] === 'active'}
        onCheckedChange={(checked) => handleInputChange(field, checked ? 'active' : 'inactive')}
      />
    </div>
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <CardTitle>Pixel & CAPI Settings</CardTitle>
            </div>
            <div className="flex gap-3">
              <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Setup Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Facebook Integration Setup Guide</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Step 1: Create Facebook App</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a></li>
                        <li>Click "Create App" and select "Business" type</li>
                        <li>Enter app name (e.g., "Al Hilal Panjabi Website")</li>
                        <li>Enter contact email and click "Create App"</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Step 2: Get App ID and App Secret</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>In your app dashboard, go to "Settings" {"&gt;"} "Basic"</li>
                        <li>Copy the <strong>App ID</strong> and paste it in the settings below</li>
                        <li>Click "Show" next to App Secret to reveal it</li>
                        <li>Copy the <strong>App Secret</strong> and paste it in the settings below</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Step 3: Create Facebook Pixel</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Go to <a href="https://business.facebook.com/pixel" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Events Manager</a></li>
                        <li>Click "Connect Data Sources" {"&gt;"} "Web"</li>
                        <li>Enter pixel name (e.g., "Al Hilal Panjabi Website")</li>
                        <li>Copy the <strong>Pixel ID</strong> and paste it in the settings below</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Step 4: Get Access Token for CAPI</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Go to <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a></li>
                        <li>Select your app from the dropdown</li>
                        <li>Generate Access Token with permissions: <code>ads_management, read_insights</code></li>
                        <li>Copy the <strong>Access Token</strong> and paste it in the settings below</li>
                        <li>For long-lived token, use the refresh button in Business Manager settings</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Step 5: Verify Domain</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>In your app dashboard, go to "Settings" {"&gt;"} "Basic"</li>
                        <li>Click "Add Platform" {"&gt;"} "Website"</li>
                        <li>Enter your domain: <code>alhilalpanjabi.com</code></li>
                        <li>Facebook will provide a verification code</li>
                        <li>Add the verification code to your domain's DNS or meta tags</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Your Domain Information</h4>
                      <p className="text-sm text-gray-600">Domain: <code>alhilalpanjabi.com</code></p>
                      <p className="text-sm text-gray-600">Webhook URL: <code>https://alhilalpanjabi.com/api/webhooks/facebook/leadgen</code></p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGuideOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <ButtonLoading
                loading={loading}
                text="Save Changes"
                className="cursor-pointer"
                onClick={handleSave}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {renderField('Pixel ID', 'pixelId', 'text', 'Enter Facebook Pixel ID', false, true)}
            {renderField('CAPI Access Token', 'capiAccessToken', 'text', 'Enter CAPI Access Token', true, true)}
            {renderField('Test Event Code', 'testEventCode', 'text', 'For testing purposes')}
            
            <div className="space-y-4 pt-4 border-t">
              {renderSwitch('Enable Pixel Tracking', 'pixelStatus')}
              {renderSwitch('Enable CAPI', 'capiStatus')}
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

export default FacebookPixelCAPI
