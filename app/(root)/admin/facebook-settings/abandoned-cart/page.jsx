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
import { Textarea } from '@/components/ui/textarea'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Plus, Edit, Trash2, RefreshCw, ShoppingCart, CheckCircle, XCircle, Play, Pause, Clock, Gift, Percent, DollarSign } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Abandoned Cart Recovery' },
]

const AbandonedCartRecovery = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  
  const [formData, setFormData] = useState({
    campaignName: '',
    pageId: '',
    adAccountId: '',
    triggerType: 'time_based',
    triggerDelayMinutes: 60,
    minCartValue: 0,
    maxCartValue: 0,
    minItems: 1,
    messageSequence: [],
    offerEnabled: false,
    offerType: 'percentage',
    offerValue: 10,
    offerCode: '',
    offerExpirationHours: 24,
    minPurchaseAmount: 0,
    targetAudience: 'all',
    excludePurchasedUsers: true,
    purchaseExclusionDays: 30,
    frequencyControl: { enabled: false, maxMessagesPerUser: 3, cooldownDays: 7 },
    status: 'active'
  })

  const [messageFormData, setMessageFormData] = useState({
    sequenceId: '',
    delayMinutes: 0,
    messageType: 'text',
    text: '',
    buttons: [],
    quickReplies: [],
    order: 0
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/abandoned-cart')
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

  const handleMessageInputChange = (field, value) => {
    setMessageFormData(prev => ({ ...prev, [field]: value }))
  }

  const addMessage = () => {
    if (!messageFormData.sequenceId || !messageFormData.text) {
      showToast('error', 'Sequence ID and Text are required')
      return
    }
    
    const newMessage = { ...messageFormData, order: formData.messageSequence.length }
    setFormData(prev => ({
      ...prev,
      messageSequence: [...prev.messageSequence, newMessage]
    }))
    
    setMessageFormData({
      sequenceId: '',
      delayMinutes: 0,
      messageType: 'text',
      text: '',
      buttons: [],
      quickReplies: [],
      order: 0
    })
  }

  const removeMessage = (index) => {
    setFormData(prev => ({
      ...prev,
      messageSequence: prev.messageSequence.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingCampaign ? { ...formData, _id: editingCampaign._id } : formData
      
      if (payload.messageSequence.length === 0) {
        showToast('error', 'At least one message is required')
        return
      }
      
      const { data } = await axios.post('/api/facebook/abandoned-cart', payload)
      
      if (data.success) {
        showToast('success', editingCampaign ? 'Campaign updated successfully' : 'Campaign created successfully')
        setIsDialogOpen(false)
        setEditingCampaign(null)
        setFormData({
          campaignName: '',
          pageId: '',
          adAccountId: '',
          triggerType: 'time_based',
          triggerDelayMinutes: 60,
          minCartValue: 0,
          maxCartValue: 0,
          minItems: 1,
          messageSequence: [],
          offerEnabled: false,
          offerType: 'percentage',
          offerValue: 10,
          offerCode: '',
          offerExpirationHours: 24,
          minPurchaseAmount: 0,
          targetAudience: 'all',
          excludePurchasedUsers: true,
          purchaseExclusionDays: 30,
          frequencyControl: { enabled: false, maxMessagesPerUser: 3, cooldownDays: 7 },
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
      const { data } = await axios.delete(`/api/facebook/abandoned-cart/${campaignId}`)
      
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

  const handleSync = async (campaignId) => {
    try {
      setSyncing(campaignId)
      const { data } = await axios.post(`/api/facebook/abandoned-cart/${campaignId}/sync`)
      
      if (data.success) {
        showToast('success', 'Campaign synced successfully')
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync campaign')
    } finally {
      setSyncing(null)
    }
  }

  const handleToggleStatus = async (campaign) => {
    try {
      setLoading(true)
      const newStatus = campaign.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/abandoned-cart/${campaign._id}`, {
        ...campaign,
        status: newStatus
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
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Abandoned Carts</p>
                  <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + (c.performance?.totalAbandonedCarts || 0), 0)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recovered Revenue</p>
                  <p className="text-2xl font-bold">${campaigns.reduce((sum, c) => sum + (c.performance?.totalRecoveredRevenue || 0), 0).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recovery Rate</p>
                  <p className="text-2xl font-bold">{campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.calculatedRecoveryRate || 0), 0) / campaigns.length).toFixed(1) : '0.0'}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                <CardTitle>Abandoned Cart Recovery</CardTitle>
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
                        pageId: '',
                        adAccountId: '',
                        triggerType: 'time_based',
                        triggerDelayMinutes: 60,
                        minCartValue: 0,
                        maxCartValue: 0,
                        minItems: 1,
                        messageSequence: [],
                        offerEnabled: false,
                        offerType: 'percentage',
                        offerValue: 10,
                        offerCode: '',
                        offerExpirationHours: 24,
                        minPurchaseAmount: 0,
                        targetAudience: 'all',
                        excludePurchasedUsers: true,
                        purchaseExclusionDays: 30,
                        frequencyControl: { enabled: false, maxMessagesPerUser: 3, cooldownDays: 7 },
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCampaign ? 'Edit Abandoned Cart Recovery Campaign' : 'Create New Campaign'}
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
                        <Label>Page ID</Label>
                        <Input
                          value={formData.pageId}
                          onChange={(e) => handleInputChange('pageId', e.target.value)}
                          placeholder="Enter Facebook Page ID"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Trigger Type</Label>
                          <Select value={formData.triggerType} onValueChange={(value) => handleInputChange('triggerType', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="time_based">Time Based</SelectItem>
                              <SelectItem value="behavior_based">Behavior Based</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Trigger Delay (minutes)</Label>
                          <Input
                            type="number"
                            value={formData.triggerDelayMinutes}
                            onChange={(e) => handleInputChange('triggerDelayMinutes', parseInt(e.target.value))}
                            placeholder="60"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Min Cart Value</Label>
                          <Input
                            type="number"
                            value={formData.minCartValue}
                            onChange={(e) => handleInputChange('minCartValue', parseFloat(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Max Cart Value</Label>
                          <Input
                            type="number"
                            value={formData.maxCartValue}
                            onChange={(e) => handleInputChange('maxCartValue', parseFloat(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Min Items</Label>
                          <Input
                            type="number"
                            value={formData.minItems}
                            onChange={(e) => handleInputChange('minItems', parseInt(e.target.value))}
                            placeholder="1"
                          />
                        </div>
                      </div>
                      
                      {/* Message Sequence */}
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3">Message Sequence ({formData.messageSequence.length})</h3>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Sequence ID</Label>
                              <Input
                                value={messageFormData.sequenceId}
                                onChange={(e) => handleMessageInputChange('sequenceId', e.target.value)}
                                placeholder="msg_1"
                              />
                            </div>
                            <div>
                              <Label>Delay (minutes)</Label>
                              <Input
                                type="number"
                                value={messageFormData.delayMinutes}
                                onChange={(e) => handleMessageInputChange('delayMinutes', parseInt(e.target.value))}
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Message Text</Label>
                            <Textarea
                              value={messageFormData.text}
                              onChange={(e) => handleMessageInputChange('text', e.target.value)}
                              placeholder="Enter message text"
                              rows={3}
                            />
                          </div>
                          <Button onClick={addMessage} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Message
                          </Button>
                        </div>
                        
                        {formData.messageSequence.length > 0 && (
                          <div className="space-y-2">
                            {formData.messageSequence.map((msg, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                <div>
                                  <p className="font-semibold">{msg.sequenceId}</p>
                                  <p className="text-sm text-gray-600">{msg.text?.substring(0, 50)}...</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeMessage(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Offer Configuration */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Offer Configuration</h3>
                          <Switch
                            checked={formData.offerEnabled}
                            onCheckedChange={(checked) => handleInputChange('offerEnabled', checked)}
                          />
                        </div>
                        {formData.offerEnabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Offer Type</Label>
                              <Select value={formData.offerType} onValueChange={(value) => handleInputChange('offerType', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                  <SelectItem value="free_gift">Free Gift</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Offer Value</Label>
                              <Input
                                type="number"
                                value={formData.offerValue}
                                onChange={(e) => handleInputChange('offerValue', parseFloat(e.target.value))}
                                placeholder="10"
                              />
                            </div>
                            <div>
                              <Label>Offer Code</Label>
                              <Input
                                value={formData.offerCode}
                                onChange={(e) => handleInputChange('offerCode', e.target.value)}
                                placeholder="SAVE10"
                              />
                            </div>
                            <div>
                              <Label>Expiration (hours)</Label>
                              <Input
                                type="number"
                                value={formData.offerExpirationHours}
                                onChange={(e) => handleInputChange('offerExpirationHours', parseInt(e.target.value))}
                                placeholder="24"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No abandoned cart recovery campaigns found. Create your first campaign to get started.</p>
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
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              campaign.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              campaign.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.syncStatus}
                            </span>
                            {campaign.offerEnabled && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                <Gift className="h-3 w-3 inline mr-1" />
                                Offer Active
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Abandoned Carts</p>
                              <p className="font-semibold">{campaign.performance?.totalAbandonedCarts || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Recovered Carts</p>
                              <p className="font-semibold">{campaign.performance?.totalRecoveredCarts || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Recovered Revenue</p>
                              <p className="font-semibold">${(campaign.performance?.totalRecoveredRevenue || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Recovery Rate</p>
                              <p className="font-semibold">{campaign.calculatedRecoveryRate?.toFixed(1) || 0}%</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <p>Trigger Delay: {campaign.triggerDelayMinutes} minutes</p>
                            <p>Messages: {campaign.messageSequence?.length || 0}</p>
                          </div>
                          {campaign.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{campaign.syncError}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(campaign._id)}
                            disabled={syncing === campaign._id || campaign.status !== 'active'}
                          >
                            {syncing === campaign._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Sync
                          </Button>
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

export default AbandonedCartRecovery
