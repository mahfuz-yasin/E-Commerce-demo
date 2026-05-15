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
import { Check, X, Facebook } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Business Manager' },
]

const FacebookBusinessManager = () => {
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState({})
  
  const [formData, setFormData] = useState({
    businessManagerId: '',
    adAccountId: '',
    businessManagerStatus: 'inactive',
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
    if (field === 'businessManagerId' && value) {
      isValid = /^\d+$/.test(value)
    } else if (field === 'adAccountId' && value) {
      isValid = /^\d+$/.test(value)
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
            <CardTitle>Business Manager Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {renderField('Business Manager ID', 'businessManagerId', 'Enter Business Manager ID')}
            {renderField('Ad Account ID', 'adAccountId', 'Enter Ad Account ID')}
            
            <div className="space-y-4 pt-4 border-t">
              {renderSwitch('Enable Business Manager', 'businessManagerStatus')}
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
