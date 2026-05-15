'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_ADVANCED } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Check, X, Eye, EyeOff, Facebook } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Advanced' },
]

const FacebookAdvanced = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({})
  
  const [formData, setFormData] = useState({
    appId: '',
    appSecret: '',
    apiVersion: 'v19.0',
    instagramBusinessId: '',
    instagramStatus: 'inactive',
    whatsappBusinessId: '',
    whatsappStatus: 'inactive',
    domainVerificationCode: '',
    clientToken: '',
    systemUserId: '',
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

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const renderField = (label, field, type = 'text', placeholder = '', isPassword = false) => (
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
          />
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
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Advanced Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">General Settings</h3>
            {renderField('App ID', 'appId', 'text', 'Enter Facebook App ID')}
            {renderField('App Secret', 'appSecret', 'text', 'Enter Facebook App Secret', true)}
            {renderField('API Version', 'apiVersion', 'text', 'e.g., v19.0')}
            
            <div className="space-y-4 pt-4 border-t">
              {renderField('Instagram Business ID', 'instagramBusinessId', 'text', 'Enter Instagram Business ID')}
              {renderSwitch('Enable Instagram', 'instagramStatus')}
            </div>

            <div className="space-y-4 pt-4 border-t">
              {renderField('WhatsApp Business ID', 'whatsappBusinessId', 'text', 'Enter WhatsApp Business ID')}
              {renderSwitch('Enable WhatsApp', 'whatsappStatus')}
            </div>

            <div className="space-y-4 pt-4 border-t">
              {renderField('Domain Verification Code', 'domainVerificationCode', 'text', 'For domain verification')}
              {renderField('Client Token', 'clientToken', 'text', 'Enter Client Token', true)}
              {renderField('System User ID', 'systemUserId', 'text', 'Enter System User ID', true)}
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

export default FacebookAdvanced
