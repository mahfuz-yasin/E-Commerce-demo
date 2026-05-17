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
import { Facebook, Plus, Edit, Trash2, RefreshCw, Users, Target, Clock, CheckCircle, XCircle } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Custom Audience Segments' },
]

const CustomAudienceSegments = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [segments, setSegments] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState(null)
  const [behavioralRules, setBehavioralRules] = useState([{ type: 'page_view', timeRange: 30 }])
  
  const [formData, setFormData] = useState({
    segmentName: '',
    segmentType: 'behavioral',
    adAccountId: '',
    excludeExistingCustomers: false,
    excludeRecentlyPurchased: false,
    recentPurchaseDays: 30,
    autoRefresh: true,
    refreshInterval: 24,
    status: 'active'
  })

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/segments')
      if (data.success) {
        setSegments(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch segments')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBehavioralRuleChange = (index, field, value) => {
    const newRules = [...behavioralRules]
    newRules[index][field] = value
    setBehavioralRules(newRules)
  }

  const addBehavioralRule = () => {
    setBehavioralRules([...behavioralRules, { type: 'page_view', timeRange: 30 }])
  }

  const removeBehavioralRule = (index) => {
    if (behavioralRules.length > 1) {
      setBehavioralRules(behavioralRules.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingSegment ? { ...formData, behavioralRules, _id: editingSegment._id } : { ...formData, behavioralRules }
      
      const { data } = await axios.post('/api/facebook/segments', payload)
      
      if (data.success) {
        showToast('success', editingSegment ? 'Segment updated successfully' : 'Segment created successfully')
        setIsDialogOpen(false)
        setEditingSegment(null)
        setFormData({
          segmentName: '',
          segmentType: 'behavioral',
          adAccountId: '',
          excludeExistingCustomers: false,
          excludeRecentlyPurchased: false,
          recentPurchaseDays: 30,
          autoRefresh: true,
          refreshInterval: 24,
          status: 'active'
        })
        setBehavioralRules([{ type: 'page_view', timeRange: 30 }])
        fetchSegments()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save segment')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (segment) => {
    setEditingSegment(segment)
    setFormData(segment)
    setBehavioralRules(segment.behavioralRules || [{ type: 'page_view', timeRange: 30 }])
    setIsDialogOpen(true)
  }

  const handleDelete = async (segmentId) => {
    if (!confirm('Are you sure you want to delete this segment?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/segments/${segmentId}`)
      
      if (data.success) {
        showToast('success', 'Segment deleted successfully')
        fetchSegments()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete segment')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (segmentId) => {
    try {
      setSyncing(segmentId)
      const { data } = await axios.post(`/api/facebook/segments/${segmentId}/sync`)
      
      if (data.success) {
        showToast('success', 'Segment synced successfully')
        fetchSegments()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync segment')
    } finally {
      setSyncing(null)
    }
  }

  const handleToggleStatus = async (segment) => {
    try {
      setLoading(true)
      const newStatus = segment.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/segments/${segment._id}`, {
        ...segment,
        status: newStatus
      })
      
      if (data.success) {
        showToast('success', `Segment ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
        fetchSegments()
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
                  <p className="text-sm text-gray-600">Active Segments</p>
                  <p className="text-2xl font-bold">{segments.filter(s => s.status === 'active').length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{segments.reduce((sum, s) => sum + (s.actualSize || 0), 0)}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Synced Segments</p>
                  <p className="text-2xl font-bold">{segments.filter(s => s.syncStatus === 'synced').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Sync</p>
                  <p className="text-2xl font-bold">{segments.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'failed').length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
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
                <CardTitle>Custom Audience Segments</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchSegments}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSegment(null)
                      setFormData({
                        segmentName: '',
                        segmentType: 'behavioral',
                        adAccountId: '',
                        excludeExistingCustomers: false,
                        excludeRecentlyPurchased: false,
                        recentPurchaseDays: 30,
                        autoRefresh: true,
                        refreshInterval: 24,
                        status: 'active'
                      })
                      setBehavioralRules([{ type: 'page_view', timeRange: 30 }])
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Segment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSegment ? 'Edit Segment' : 'Create New Segment'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Segment Name</Label>
                        <Input
                          value={formData.segmentName}
                          onChange={(e) => handleInputChange('segmentName', e.target.value)}
                          placeholder="Enter segment name"
                        />
                      </div>
                      <div>
                        <Label>Segment Type</Label>
                        <Select value={formData.segmentType} onValueChange={(value) => handleInputChange('segmentType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="demographic">Demographic</SelectItem>
                            <SelectItem value="purchase_history">Purchase History</SelectItem>
                            <SelectItem value="custom_rule">Custom Rule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ad Account ID</Label>
                        <Input
                          value={formData.adAccountId}
                          onChange={(e) => handleInputChange('adAccountId', e.target.value)}
                          placeholder="Enter Facebook Ad Account ID"
                        />
                      </div>
                      
                      {formData.segmentType === 'behavioral' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Behavioral Rules</h3>
                          {behavioralRules.map((rule, index) => (
                            <div key={index} className="space-y-2 p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <Label>Rule {index + 1}</Label>
                                {behavioralRules.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBehavioralRule(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div>
                                <Label>Behavior Type</Label>
                                <Select value={rule.type} onValueChange={(value) => handleBehavioralRuleChange(index, 'type', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="page_view">Page View</SelectItem>
                                    <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                                    <SelectItem value="purchase">Purchase</SelectItem>
                                    <SelectItem value="view_content">View Content</SelectItem>
                                    <SelectItem value="search">Search</SelectItem>
                                    <SelectItem value="time_on_site">Time on Site</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Time Range (days)</Label>
                                <Input
                                  type="number"
                                  value={rule.timeRange}
                                  onChange={(e) => handleBehavioralRuleChange(index, 'timeRange', parseInt(e.target.value))}
                                  placeholder="30"
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={addBehavioralRule}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Rule
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <Label>Exclude Existing Customers</Label>
                          <Switch
                            checked={formData.excludeExistingCustomers}
                            onCheckedChange={(checked) => handleInputChange('excludeExistingCustomers', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Exclude Recently Purchased</Label>
                          <Switch
                            checked={formData.excludeRecentlyPurchased}
                            onCheckedChange={(checked) => handleInputChange('excludeRecentlyPurchased', checked)}
                          />
                        </div>
                        {formData.excludeRecentlyPurchased && (
                          <div>
                            <Label>Recent Purchase Days</Label>
                            <Input
                              type="number"
                              value={formData.recentPurchaseDays}
                              onChange={(e) => handleInputChange('recentPurchaseDays', parseInt(e.target.value))}
                              placeholder="30"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Label>Auto Refresh</Label>
                          <Switch
                            checked={formData.autoRefresh}
                            onCheckedChange={(checked) => handleInputChange('autoRefresh', checked)}
                          />
                        </div>
                        {formData.autoRefresh && (
                          <div>
                            <Label>Refresh Interval (hours)</Label>
                            <Input
                              type="number"
                              value={formData.refreshInterval}
                              onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value))}
                              placeholder="24"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Segment" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {segments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No segments found. Create your first segment to get started.</p>
                </div>
              ) : (
                segments.map((segment) => (
                  <Card key={segment._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{segment.segmentName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              segment.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {segment.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {segment.segmentType.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              segment.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              segment.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              segment.syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {segment.syncStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Actual Size</p>
                              <p className="font-semibold">{segment.actualSize || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Estimated Size</p>
                              <p className="font-semibold">{segment.estimatedSize || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Last Sync</p>
                              <p className="font-semibold">{segment.syncAge || 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Auto Refresh</p>
                              <p className="font-semibold">{segment.autoRefresh ? `${segment.refreshInterval}h` : 'Off'}</p>
                            </div>
                          </div>
                          {segment.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{segment.syncError}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(segment._id)}
                            disabled={syncing === segment._id || segment.status !== 'active'}
                          >
                            {syncing === segment._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(segment)}
                            disabled={loading}
                          >
                            {segment.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(segment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(segment._id)}
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

export default CustomAudienceSegments
