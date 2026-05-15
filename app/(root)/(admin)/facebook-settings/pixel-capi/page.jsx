'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_PIXEL } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Check, X, Eye, EyeOff, RefreshCw, Facebook } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Pixel & CAPI' },
]

const FacebookPixelCAPI = () => {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(null)
  const [showPassword, setShowPassword] = useState({})
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
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Pixel & CAPI Settings</CardTitle>
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
