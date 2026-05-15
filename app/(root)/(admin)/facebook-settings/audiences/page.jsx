'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS, ADMIN_FACEBOOK_ADVANCED } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Plus, RefreshCw, Users, Target, Globe, Mail, Video } from 'lucide-react'
import ButtonLoading from '@/components/Application/ButtonLoading'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Audiences' },
]

const FacebookAudiences = () => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLookalikeDialogOpen, setIsLookalikeDialogOpen] = useState(false)
  const [audiences, setAudiences] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'website',
    subtype: 'WEBSITE',
    description: '',
    url: '',
    retentionDays: 30
  })

  const [lookalikeData, setLookalikeData] = useState({
    name: '',
    sourceAudienceId: '',
    country: 'BD',
    ratio: 1,
    description: ''
  })

  useEffect(() => {
    fetchAudiences()
  }, [])

  const fetchAudiences = async () => {
    try {
      setFetching(true)
      const { data } = await axios.get('/api/facebook/audiences')
      if (data.success) {
        setAudiences(data.data)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch audiences')
    } finally {
      setFetching(false)
    }
  }

  const handleCreateAudience = async () => {
    try {
      setCreating(true)
      
      let rules = []
      if (formData.type === 'website') {
        rules = [
          {
            operator: 'or',
            rules: [
              {
                field: 'url',
                operator: 'i_contains',
                value: formData.url || '/'
              }
            ]
          }
        ]
      } else if (formData.type === 'engagement') {
        rules = [
          {
            operator: 'or',
            rules: [
              {
                event: {
                  type: 'video',
                  retention_seconds: 2592000
                }
              }
            ]
          }
        ]
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        subtype: formData.subtype,
        description: formData.description,
        rules
      }

      const { data } = await axios.post('/api/facebook/audiences', payload)
      if (data.success) {
        showToast('success', data.message)
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          type: 'website',
          subtype: 'WEBSITE',
          description: '',
          url: '',
          retentionDays: 30
        })
        await fetchAudiences()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to create audience')
    } finally {
      setCreating(false)
    }
  }

  const handleCreateLookalikeAudience = async () => {
    try {
      setCreating(true)
      
      const payload = {
        name: lookalikeData.name,
        sourceAudienceId: lookalikeData.sourceAudienceId,
        country: lookalikeData.country,
        ratio: lookalikeData.ratio,
        description: lookalikeData.description
      }

      const { data } = await axios.post('/api/facebook/lookalike-audience', payload)
      if (data.success) {
        showToast('success', data.message)
        setIsLookalikeDialogOpen(false)
        setLookalikeData({
          name: '',
          sourceAudienceId: '',
          country: 'BD',
          ratio: 1,
          description: ''
        })
        await fetchAudiences()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to create lookalike audience')
    } finally {
      setCreating(false)
    }
  }

  const getAudienceIcon = (subtype) => {
    switch (subtype) {
      case 'WEBSITE':
        return <Globe className="h-4 w-4" />
      case 'CUSTOM':
        return <Mail className="h-4 w-4" />
      case 'ENGAGEMENT':
        return <Video className="h-4 w-4" />
      case 'LOOKALIKE':
        return <Target className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatCount = (lower, upper) => {
    if (!lower && !upper) return '0'
    const lowerCount = lower || 0
    const upperCount = upper || 0
    if (lowerCount === upperCount) {
      return lowerCount.toLocaleString()
    }
    return `${lowerCount.toLocaleString()} - ${upperCount.toLocaleString()}`
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <CardTitle>Custom Audiences</CardTitle>
            </div>
            <div className="flex gap-3">
              <ButtonLoading
                loading={fetching}
                text="Refresh"
                className="cursor-pointer"
                onClick={fetchAudiences}
                icon={<RefreshCw className="h-4 w-4 mr-2" />}
              />
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Audience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Custom Audience</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Audience Name</Label>
                      <Input
                        placeholder="Enter audience name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Audience Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value, subtype: value === 'website' ? 'WEBSITE' : 'ENGAGEMENT' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website Traffic</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.type === 'website' && (
                      <div className="space-y-2">
                        <Label>URL Contains</Label>
                        <Input
                          placeholder="/product/"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                        <p className="text-sm text-gray-600">Users who visited pages containing this URL</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="Audience description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <ButtonLoading
                      loading={creating}
                      text="Create Audience"
                      className="cursor-pointer"
                      onClick={handleCreateAudience}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isLookalikeDialogOpen} onOpenChange={setIsLookalikeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <Target className="h-4 w-4 mr-2" />
                    Create Lookalike
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Lookalike Audience</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Audience Name</Label>
                      <Input
                        placeholder="Enter lookalike audience name"
                        value={lookalikeData.name}
                        onChange={(e) => setLookalikeData({ ...lookalikeData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Source Audience ID</Label>
                      <Input
                        placeholder="Select from existing audiences or enter ID"
                        value={lookalikeData.sourceAudienceId}
                        onChange={(e) => setLookalikeData({ ...lookalikeData, sourceAudienceId: e.target.value })}
                      />
                      <Select onValueChange={(value) => setLookalikeData({ ...lookalikeData, sourceAudienceId: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select source audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences.filter(a => a.subtype !== 'LOOKALIKE').map(audience => (
                            <SelectItem key={audience.id} value={audience.id}>
                              {audience.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select
                        value={lookalikeData.country}
                        onValueChange={(value) => setLookalikeData({ ...lookalikeData, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BD">Bangladesh</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AE">United Arab Emirates</SelectItem>
                          <SelectItem value="SA">Saudi Arabia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Audience Size</Label>
                      <Select
                        value={lookalikeData.ratio.toString()}
                        onValueChange={(value) => setLookalikeData({ ...lookalikeData, ratio: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Smallest (1% of country)</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="10">10 - Largest (10% of country)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="Lookalike audience description"
                        value={lookalikeData.description}
                        onChange={(e) => setLookalikeData({ ...lookalikeData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLookalikeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <ButtonLoading
                      loading={creating}
                      text="Create Lookalike Audience"
                      className="cursor-pointer"
                      onClick={handleCreateLookalikeAudience}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {audiences.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audiences found. Create your first custom audience.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audiences.map((audience) => (
                <div key={audience.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getAudienceIcon(audience.subtype)}
                    </div>
                    <div>
                      <p className="font-medium">{audience.name}</p>
                      <p className="text-sm text-gray-600">
                        {audience.subtype} • {formatCount(audience.approximate_count_lower_bound, audience.approximate_count_upper_bound)} users
                      </p>
                      {audience.description && (
                        <p className="text-xs text-gray-500 mt-1">{audience.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Created: {audience.time_created ? new Date(audience.time_created * 1000).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FacebookAudiences
