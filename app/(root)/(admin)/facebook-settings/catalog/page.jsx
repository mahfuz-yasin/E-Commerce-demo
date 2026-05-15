'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_CATALOG } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Check, X, Facebook, RefreshCw, Copy, ExternalLink } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Catalog' },
]

const FacebookCatalog = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [validation, setValidation] = useState({})
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    productCount: 0
  })
  
  const [formData, setFormData] = useState({
    catalogId: '',
    catalogStatus: 'inactive',
  })

  useEffect(() => {
    fetchSettings()
    fetchSyncStatus()
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

  const fetchSyncStatus = async () => {
    try {
      const { data } = await axios.get('/api/facebook/catalog/sync-status')
      if (data.success) {
        setSyncStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field, value) => {
    let isValid = true
    if (field === 'catalogId' && value) {
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

  const handleSync = async () => {
    try {
      setSyncing(true)
      const { data } = await axios.post('/api/facebook/catalog/sync')
      if (data.success) {
        showToast('success', data.message)
        await fetchSyncStatus()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync catalog')
    } finally {
      setSyncing(false)
    }
  }

  const copyFeedUrl = () => {
    const feedUrl = `${window.location.origin}/api/facebook/catalog/feed?format=json`
    navigator.clipboard.writeText(feedUrl)
    showToast('success', 'Feed URL copied to clipboard')
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

  const feedUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://alhilalpanjabi.com'}/api/facebook/catalog/feed?format=json`

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Catalog Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Sync Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Catalog Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Product Count</p>
              <p className="text-lg font-semibold">{syncStatus.productCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${formData.catalogStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {formData.catalogStatus === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <p className="flex-1 text-sm font-mono text-gray-700 truncate">{feedUrl}</p>
              <Button variant="outline" size="sm" onClick={copyFeedUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={feedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </a>
              </Button>
            </div>

            <ButtonLoading
              loading={syncing}
              text="Sync Catalog Now"
              className="cursor-pointer"
              onClick={handleSync}
              icon={<RefreshCw className="h-4 w-4 mr-2" />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {renderField('Catalog ID', 'catalogId', 'Enter Facebook Catalog ID')}
            
            <div className="space-y-4 pt-4 border-t">
              {renderSwitch('Enable Catalog Sync', 'catalogStatus')}
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

export default FacebookCatalog
