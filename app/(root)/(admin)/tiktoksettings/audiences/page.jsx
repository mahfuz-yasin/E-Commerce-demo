'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_TIKTOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Music, Users, Plus, RefreshCw, Share2, Upload, Target, FileText, Copy, Trash2, Edit } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_TIKTOK_SETTINGS, label: 'TikTok Settings' },
  { href: '', label: 'Audiences' },
]

const TikTokAudiences = () => {
  const [loading, setLoading] = useState(false)
  const [audiences, setAudiences] = useState([])
  const [savedAudiences, setSavedAudiences] = useState([])
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM',
    method: 'rule',
    rules: {
      url: '',
      visitFrequency: '',
      timeOnSite: '',
      pageViews: ''
    },
    csvData: '',
    sourceAudienceId: '',
    countryCode: 'BD',
    audienceSize: 5
  })

  useEffect(() => {
    fetchAudiences()
    fetchSavedAudiences()
  }, [])

  const fetchAudiences = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/tiktok/audiences/lookalike')
      if (data.success) {
        setAudiences(data.data.list || [])
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch audiences')
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedAudiences = async () => {
    try {
      const { data } = await axios.get('/api/tiktok/audiences/saved')
      if (data.success) {
        setSavedAudiences(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching saved audiences:', error)
    }
  }

  const handleCreateAudience = async () => {
    try {
      setLoading(true)
      
      if (wizardData.type === 'LOOKALIKE') {
        const { data } = await axios.post('/api/tiktok/audiences/lookalike', {
          sourceAudienceId: wizardData.sourceAudienceId,
          countryCode: wizardData.countryCode,
          audienceSize: wizardData.audienceSize,
          name: wizardData.name,
          description: wizardData.description
        })
        if (data.success) {
          showToast('success', 'Lookalike audience created successfully')
          setShowWizard(false)
          fetchAudiences()
        }
      } else {
        const { data } = await axios.post('/api/tiktok/audiences/custom', {
          name: wizardData.name,
          description: wizardData.description,
          type: wizardData.type,
          method: wizardData.method,
          rules: wizardData.rules,
          csvData: wizardData.csvData
        })
        if (data.success) {
          showToast('success', 'Custom audience created successfully')
          setShowWizard(false)
          fetchAudiences()
        }
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to create audience')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAudience = async (audienceId) => {
    try {
      const { data } = await axios.post('/api/tiktok/audiences/refresh', { audienceId })
      if (data.success) {
        showToast('success', 'Audience refreshed successfully')
        fetchAudiences()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to refresh audience')
    }
  }

  const handleSaveAudience = async () => {
    try {
      const { data } = await axios.post('/api/tiktok/audiences/saved', {
        name: wizardData.name,
        description: wizardData.description,
        targetingCriteria: wizardData.rules,
        type: 'SAVED'
      })
      if (data.success) {
        showToast('success', 'Audience saved successfully')
        setShowWizard(false)
        fetchSavedAudiences()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save audience')
    }
  }

  const handleShareAudience = async (audienceId) => {
    try {
      const { data } = await axios.put('/api/tiktok/audiences/saved', {
        audienceId,
        sharedWith: ['AD_ACCOUNT_ID_1', 'AD_ACCOUNT_ID_2']
      })
      if (data.success) {
        showToast('success', 'Audience shared successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to share audience')
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-black" />
              <CardTitle>TikTok Audience Management</CardTitle>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Audience
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Audience Wizard Modal */}
      {showWizard && (
        <Card className="mb-6 border-2 border-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Audience</CardTitle>
              <Button variant="outline" onClick={() => setShowWizard(false)}>Cancel</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Audience Type */}
              <div>
                <Label>Audience Type</Label>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => setWizardData({ ...wizardData, type: 'CUSTOM' })}
                    className={`px-4 py-2 rounded-lg ${wizardData.type === 'CUSTOM' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Custom Audience
                  </button>
                  <button
                    onClick={() => setWizardData({ ...wizardData, type: 'LOOKALIKE' })}
                    className={`px-4 py-2 rounded-lg ${wizardData.type === 'LOOKALIKE' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  >
                    <Target className="h-4 w-4 inline mr-2" />
                    Lookalike Audience
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={wizardData.name}
                  onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                  placeholder="Enter audience name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={wizardData.description}
                  onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                  placeholder="Enter audience description"
                />
              </div>

              {wizardData.type === 'CUSTOM' && (
                <>
                  <div>
                    <Label>Creation Method</Label>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => setWizardData({ ...wizardData, method: 'rule' })}
                        className={`px-4 py-2 rounded-lg ${wizardData.method === 'rule' ? 'bg-black text-white' : 'bg-gray-100'}`}
                      >
                        <Target className="h-4 w-4 inline mr-2" />
                        Rule-based
                      </button>
                      <button
                        onClick={() => setWizardData({ ...wizardData, method: 'file' })}
                        className={`px-4 py-2 rounded-lg ${wizardData.method === 'file' ? 'bg-black text-white' : 'bg-gray-100'}`}
                      >
                        <Upload className="h-4 w-4 inline mr-2" />
                        File Upload
                      </button>
                    </div>
                  </div>

                  {wizardData.method === 'rule' && (
                    <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>URL Contains</Label>
                        <Input
                          value={wizardData.rules.url}
                          onChange={(e) => setWizardData({ ...wizardData, rules: { ...wizardData.rules, url: e.target.value } })}
                          placeholder="/product, /checkout, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Visit Frequency</Label>
                        <Input
                          value={wizardData.rules.visitFrequency}
                          onChange={(e) => setWizardData({ ...wizardData, rules: { ...wizardData.rules, visitFrequency: e.target.value } })}
                          placeholder="e.g., 3 visits in 30 days"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time on Site</Label>
                        <Input
                          value={wizardData.rules.timeOnSite}
                          onChange={(e) => setWizardData({ ...wizardData, rules: { ...wizardData.rules, timeOnSite: e.target.value } })}
                          placeholder="e.g., > 60 seconds"
                        />
                      </div>
                    </div>
                  )}

                  {wizardData.method === 'file' && (
                    <div className="space-y-2 mt-4">
                      <Label>CSV Data (email, phone columns)</Label>
                      <textarea
                        value={wizardData.csvData}
                        onChange={(e) => setWizardData({ ...wizardData, csvData: e.target.value })}
                        placeholder="email,phone&#10;user@example.com,+8801700000000&#10;..."
                        className="w-full h-32 p-2 border rounded"
                      />
                      <p className="text-sm text-gray-600">Emails and phone numbers will be hashed with SHA256 automatically</p>
                    </div>
                  )}
                </>
              )}

              {wizardData.type === 'LOOKALIKE' && (
                <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Source Audience ID</Label>
                    <Input
                      value={wizardData.sourceAudienceId}
                      onChange={(e) => setWizardData({ ...wizardData, sourceAudienceId: e.target.value })}
                      placeholder="Enter source audience ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country Code</Label>
                    <select
                      value={wizardData.countryCode}
                      onChange={(e) => setWizardData({ ...wizardData, countryCode: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="BD">Bangladesh (BD)</option>
                      <option value="IN">India (IN)</option>
                      <option value="US">United States (US)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Audience Size (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={wizardData.audienceSize}
                  onChange={(e) => setWizardData({ ...wizardData, audienceSize: parseInt(e.target.value) })}
                      placeholder="5"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateAudience}
                  disabled={loading || !wizardData.name}
                  className="cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create Audience'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveAudience}
                  disabled={!wizardData.name}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TikTok Audiences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>TikTok Audiences</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
              <p className="mt-2">Loading audiences...</p>
            </div>
          ) : audiences.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No audiences found. Create your first audience to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Size</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audiences.map((audience) => (
                    <tr key={audience.audience_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{audience.audience_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {audience.audience_type}
                        </span>
                      </td>
                      <td className="p-3">{audience.size || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          audience.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {audience.status}
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshAudience(audience.audience_id)}
                            className="cursor-pointer"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareAudience(audience.audience_id)}
                            className="cursor-pointer"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Audiences */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Audiences</CardTitle>
        </CardHeader>
        <CardContent>
          {savedAudiences.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No saved audiences yet. Save targeting criteria for reuse.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedAudiences.map((audience) => (
                    <tr key={audience._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{audience.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {audience.type}
                        </span>
                      </td>
                      <td className="p-3">{new Date(audience.createdAt).toLocaleDateString()}</td>
                      <td className="text-right p-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="cursor-pointer">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="cursor-pointer">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="cursor-pointer text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TikTokAudiences
