'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Copy, ExternalLink, RefreshCw, Check, X, Send } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Lead Ads' },
]

const FacebookLeadAds = () => {
  const [loading, setLoading] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [validation, setValidation] = useState({})
  const [webhookUrl, setWebhookUrl] = useState('')
  
  const [formData, setFormData] = useState({
    leadAdsStatus: 'inactive',
    autoReplyStatus: 'inactive',
    autoReplyMessage: '',
  })

  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alhilalpanjabi.com'
    setWebhookUrl(`${baseUrl}/api/webhooks/facebook/leadgen`)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/facebook-settings')
      if (data.success) {
        setFormData({
          leadAdsStatus: data.data.leadAdsStatus || 'inactive',
          autoReplyStatus: data.data.autoReplyStatus || 'inactive',
          autoReplyMessage: data.data.autoReplyMessage || '',
        })
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
    if (field === 'autoReplyMessage' && value && value.length < 10) {
      isValid = false
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

  const handleSubscribeWebhook = async () => {
    try {
      setSubscribing(true)
      const { data } = await axios.post('/api/facebook/webhook/subscribe')
      if (data.success) {
        showToast('success', data.message)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to subscribe webhook')
    } finally {
      setSubscribing(false)
    }
  }

  const handleTestWebhook = async () => {
    try {
      setTesting(true)
      const { data } = await axios.post('/api/facebook/webhook/test')
      if (data.success) {
        showToast('success', data.message)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to test webhook')
    } finally {
      setTesting(false)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    showToast('success', 'Webhook URL copied to clipboard')
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Lead Ads Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Webhook Setup Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Webhook Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <p className="flex-1 text-sm font-mono text-gray-700 truncate">{webhookUrl}</p>
              <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={webhookUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </a>
              </Button>
            </div>

            <div className="flex gap-3">
              <ButtonLoading
                loading={subscribing}
                text="Subscribe Webhook"
                className="cursor-pointer"
                onClick={handleSubscribeWebhook}
                icon={<Facebook className="h-4 w-4 mr-2" />}
              />
              <ButtonLoading
                loading={testing}
                text="Test with Sample Lead"
                variant="outline"
                className="cursor-pointer"
                onClick={handleTestWebhook}
                icon={<RefreshCw className="h-4 w-4 mr-2" />}
              />
            </div>

            <p className="text-sm text-gray-600">
              Copy this webhook URL and add it to your Facebook Lead Ads form settings in Facebook Business Manager.
              Then click "Subscribe Webhook" to enable lead data collection.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="leadAdsStatus">Enable Lead Ads Integration</Label>
                <Switch
                  id="leadAdsStatus"
                  checked={formData.leadAdsStatus === 'active'}
                  onCheckedChange={(checked) => handleInputChange('leadAdsStatus', checked ? 'active' : 'inactive')}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoReplyStatus">Auto-Reply to Leads</Label>
                <Switch
                  id="autoReplyStatus"
                  checked={formData.autoReplyStatus === 'active'}
                  onCheckedChange={(checked) => handleInputChange('autoReplyStatus', checked ? 'active' : 'inactive')}
                />
              </div>

              {formData.autoReplyStatus === 'active' && (
                <div className="space-y-2">
                  <Label>Auto-Reply Message</Label>
                  <div className="flex-1 relative">
                    <textarea
                      id="autoReplyMessage"
                      placeholder="Enter auto-reply message for new leads..."
                      value={formData.autoReplyMessage}
                      onChange={(e) => handleInputChange('autoReplyMessage', e.target.value)}
                      className={`w-full min-h-32 px-3 py-2 border rounded-md ${
                        validation.autoReplyMessage === false ? 'border-red-500' : 
                        validation.autoReplyMessage === true ? 'border-green-500' : ''
                      }`}
                    />
                    {validation.autoReplyMessage !== undefined && (
                      <div className="absolute right-8 top-2">
                        {validation.autoReplyMessage ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">This message will be sent automatically to leads who provide their email address.</p>
                </div>
              )}
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

export default FacebookLeadAds
