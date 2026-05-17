'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Plus, Edit, Trash2, Play, Pause, RefreshCw, TrendingUp, ShoppingCart, Package } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Dynamic Product Ads' },
]

const DynamicProductAds = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  
  const [formData, setFormData] = useState({
    campaignName: '',
    adAccountId: '',
    catalogId: '',
    adFormat: 'carousel',
    crossSellEnabled: false,
    upSellEnabled: false,
    priceDropEnabled: false,
    backInStockEnabled: false,
    priceDropThreshold: 10,
    optimizationGoal: 'conversions',
    bidStrategy: 'lowest_cost',
    status: 'active'
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/dpa')
      if (data.success) {
        setCampaigns(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingCampaign ? { ...formData, _id: editingCampaign._id } : formData
      
      const { data } = await axios.post('/api/facebook/dpa', payload)
      
      if (data.success) {
        showToast('success', editingCampaign ? 'Campaign updated successfully' : 'Campaign created successfully')
        setIsDialogOpen(false)
        setEditingCampaign(null)
        setFormData({
          campaignName: '',
          adAccountId: '',
          catalogId: '',
          adFormat: 'carousel',
          crossSellEnabled: false,
          upSellEnabled: false,
          priceDropEnabled: false,
          backInStockEnabled: false,
          priceDropThreshold: 10,
          optimizationGoal: 'conversions',
          bidStrategy: 'lowest_cost',
          status: 'active'
        })
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign)
    setFormData(campaign)
    setIsDialogOpen(true)
  }

  const handleDelete = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/dpa/${campaignId}`)
      
      if (data.success) {
        showToast('success', 'Campaign deleted successfully')
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (campaign) => {
    try {
      setLoading(true)
      const newStatus = campaign.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.post('/api/facebook/dpa', {
        ...campaign,
        status: newStatus,
        _id: campaign._id
      })
      
      if (data.success) {
        showToast('success', `Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProducts = async () => {
    try {
      setSyncing(true)
      const { data } = await axios.post('/api/facebook/dpa/products', {
        catalogId: formData.catalogId
      })
      
      if (data.success) {
        showToast('success', `${data.data.synced} products synced successfully`)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync products')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold">${campaigns.reduce((sum, c) => sum + (c.performance?.spend || 0), 0).toFixed(2)}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + (c.performance?.conversions || 0), 0)}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average ROAS</p>
                  <p className="text-2xl font-bold">{campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.performance?.roas || 0), 0) / campaigns.length).toFixed(2) : '0.00'}</p>
                </div>
                <Facebook className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Facebook className="h-6 w-6 text-blue-600" />
                <CardTitle>Dynamic Product Ads</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchCampaigns}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingCampaign(null)
                      setFormData({
                        campaignName: '',
                        adAccountId: '',
                        catalogId: '',
                        adFormat: 'carousel',
                        crossSellEnabled: false,
                        upSellEnabled: false,
                        priceDropEnabled: false,
                        backInStockEnabled: false,
                        priceDropThreshold: 10,
                        optimizationGoal: 'conversions',
                        bidStrategy: 'lowest_cost',
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Campaign Name</Label>
                        <Input
                          value={formData.campaignName}
                          onChange={(e) => handleInputChange('campaignName', e.target.value)}
                          placeholder="Enter campaign name"
                        />
                      </div>
                      <div>
                        <Label>Ad Account ID</Label>
                        <Input
                          value={formData.adAccountId}
                          onChange={(e) => handleInputChange('adAccountId', e.target.value)}
                          placeholder="Enter Facebook Ad Account ID"
                        />
                      </div>
                      <div>
                        <Label>Catalog ID</Label>
                        <Input
                          value={formData.catalogId}
                          onChange={(e) => handleInputChange('catalogId', e.target.value)}
                          placeholder="Enter Facebook Catalog ID"
                        />
                      </div>
                      <div>
                        <Label>Ad Format</Label>
                        <Select value={formData.adFormat} onValueChange={(value) => handleInputChange('adFormat', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carousel">Carousel</SelectItem>
                            <SelectItem value="single_image">Single Image</SelectItem>
                            <SelectItem value="collection">Collection</SelectItem>
                            <SelectItem value="slideshow">Slideshow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Optimization Goal</Label>
                        <Select value={formData.optimizationGoal} onValueChange={(value) => handleInputChange('optimizationGoal', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conversions">Conversions</SelectItem>
                            <SelectItem value="traffic">Traffic</SelectItem>
                            <SelectItem value="impressions">Impressions</SelectItem>
                            <SelectItem value="reach">Reach</SelectItem>
                            <SelectItem value="landing_page_views">Landing Page Views</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Bid Strategy</Label>
                        <Select value={formData.bidStrategy} onValueChange={(value) => handleInputChange('bidStrategy', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                            <SelectItem value="bid_cap">Bid Cap</SelectItem>
                            <SelectItem value="target_cost">Target Cost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <Label>Enable Cross-Sell</Label>
                          <Switch
                            checked={formData.crossSellEnabled}
                            onCheckedChange={(checked) => handleInputChange('crossSellEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Enable Up-Sell</Label>
                          <Switch
                            checked={formData.upSellEnabled}
                            onCheckedChange={(checked) => handleInputChange('upSellEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Enable Price Drop Notifications</Label>
                          <Switch
                            checked={formData.priceDropEnabled}
                            onCheckedChange={(checked) => handleInputChange('priceDropEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Enable Back in Stock Alerts</Label>
                          <Switch
                            checked={formData.backInStockEnabled}
                            onCheckedChange={(checked) => handleInputChange('backInStockEnabled', checked)}
                          />
                        </div>
                      </div>
                      {formData.priceDropEnabled && (
                        <div>
                          <Label>Price Drop Threshold (%)</Label>
                          <Input
                            type="number"
                            value={formData.priceDropThreshold}
                            onChange={(e) => handleInputChange('priceDropThreshold', parseInt(e.target.value))}
                            placeholder="10"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Campaign" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No campaigns found. Create your first campaign to get started.</p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <Card key={campaign._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{campaign.campaignName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Spend</p>
                              <p className="font-semibold">${(campaign.performance?.spend || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Conversions</p>
                              <p className="font-semibold">{campaign.performance?.conversions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">ROAS</p>
                              <p className="font-semibold">{(campaign.performance?.roas || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">CTR</p>
                              <p className="font-semibold">{(campaign.performance?.ctr || 0).toFixed(2)}%</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {campaign.crossSellEnabled && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Cross-Sell</span>
                            )}
                            {campaign.upSellEnabled && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Up-Sell</span>
                            )}
                            {campaign.priceDropEnabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Price Drop</span>
                            )}
                            {campaign.backInStockEnabled && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Back in Stock</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(campaign)}
                            disabled={loading}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(campaign._id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DynamicProductAds
