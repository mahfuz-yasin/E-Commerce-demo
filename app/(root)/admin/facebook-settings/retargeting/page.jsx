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
import { Facebook, Plus, Edit, Trash2, RefreshCw, Target, Clock, CheckCircle, XCircle, ShoppingCart, Eye, ShoppingBag, UserCheck } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Retargeting Automation' },
]

const RetargetingAutomation = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [rules, setRules] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleType: 'viewed_products',
    adAccountId: '',
    frequencyCap: 3,
    frequencyPeriod: 'week',
    autoRefresh: true,
    refreshInterval: 24,
    status: 'active',
    viewedProductsRules: { timeRange: 30, minViews: 1, excludePurchased: true, purchaseExclusionDays: 30 },
    addedToCartRules: { timeRange: 7, excludePurchased: true, purchaseExclusionDays: 30 },
    purchasedRules: { timeRange: 90, includeRepeatPurchasers: true },
    browseAbandonmentRules: { timeOnSiteThreshold: 30, pageViewsThreshold: 2, timeRange: 7 },
    cartAbandonmentRules: { timeRange: 7, excludePurchased: true }
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/retargeting')
      if (data.success) {
        setRules(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch rules')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: { ...prev[parentField], [field]: value }
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingRule ? { ...formData, _id: editingRule._id } : formData
      
      const { data } = await axios.post('/api/facebook/retargeting', payload)
      
      if (data.success) {
        showToast('success', editingRule ? 'Rule updated successfully' : 'Rule created successfully')
        setIsDialogOpen(false)
        setEditingRule(null)
        setFormData({
          ruleName: '',
          ruleType: 'viewed_products',
          adAccountId: '',
          frequencyCap: 3,
          frequencyPeriod: 'week',
          autoRefresh: true,
          refreshInterval: 24,
          status: 'active',
          viewedProductsRules: { timeRange: 30, minViews: 1, excludePurchased: true, purchaseExclusionDays: 30 },
          addedToCartRules: { timeRange: 7, excludePurchased: true, purchaseExclusionDays: 30 },
          purchasedRules: { timeRange: 90, includeRepeatPurchasers: true },
          browseAbandonmentRules: { timeOnSiteThreshold: 30, pageViewsThreshold: 2, timeRange: 7 },
          cartAbandonmentRules: { timeRange: 7, excludePurchased: true }
        })
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save rule')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData(rule)
    setIsDialogOpen(true)
  }

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/retargeting/${ruleId}`)
      
      if (data.success) {
        showToast('success', 'Rule deleted successfully')
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete rule')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (ruleId) => {
    try {
      setSyncing(ruleId)
      const { data } = await axios.post(`/api/facebook/retargeting/${ruleId}/sync`)
      
      if (data.success) {
        showToast('success', 'Rule synced successfully')
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync rule')
    } finally {
      setSyncing(null)
    }
  }

  const handleToggleStatus = async (rule) => {
    try {
      setLoading(true)
      const newStatus = rule.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/retargeting/${rule._id}`, {
        ...rule,
        status: newStatus
      })
      
      if (data.success) {
        showToast('success', `Rule ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const getRuleIcon = (ruleType) => {
    switch (ruleType) {
      case 'viewed_products': return <Eye className="h-4 w-4" />
      case 'added_to_cart': return <ShoppingCart className="h-4 w-4" />
      case 'purchased': return <ShoppingBag className="h-4 w-4" />
      case 'browse_abandonment': return <UserCheck className="h-4 w-4" />
      case 'cart_abandonment': return <ShoppingCart className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
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
                  <p className="text-sm text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold">{rules.filter(r => r.status === 'active').length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{rules.reduce((sum, r) => sum + (r.actualSize || 0), 0)}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Synced Rules</p>
                  <p className="text-2xl font-bold">{rules.filter(r => r.syncStatus === 'synced').length}</p>
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
                  <p className="text-2xl font-bold">{rules.filter(r => r.syncStatus === 'pending' || r.syncStatus === 'failed').length}</p>
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
                <CardTitle>Retargeting Automation</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchRules}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingRule(null)
                      setFormData({
                        ruleName: '',
                        ruleType: 'viewed_products',
                        adAccountId: '',
                        frequencyCap: 3,
                        frequencyPeriod: 'week',
                        autoRefresh: true,
                        refreshInterval: 24,
                        status: 'active',
                        viewedProductsRules: { timeRange: 30, minViews: 1, excludePurchased: true, purchaseExclusionDays: 30 },
                        addedToCartRules: { timeRange: 7, excludePurchased: true, purchaseExclusionDays: 30 },
                        purchasedRules: { timeRange: 90, includeRepeatPurchasers: true },
                        browseAbandonmentRules: { timeOnSiteThreshold: 30, pageViewsThreshold: 2, timeRange: 7 },
                        cartAbandonmentRules: { timeRange: 7, excludePurchased: true }
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule ? 'Edit Retargeting Rule' : 'Create New Retargeting Rule'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Rule Name</Label>
                        <Input
                          value={formData.ruleName}
                          onChange={(e) => handleInputChange('ruleName', e.target.value)}
                          placeholder="Enter rule name"
                        />
                      </div>
                      <div>
                        <Label>Rule Type</Label>
                        <Select value={formData.ruleType} onValueChange={(value) => handleInputChange('ruleType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewed_products">Viewed Products</SelectItem>
                            <SelectItem value="added_to_cart">Added to Cart</SelectItem>
                            <SelectItem value="purchased">Purchased</SelectItem>
                            <SelectItem value="browse_abandonment">Browse Abandonment</SelectItem>
                            <SelectItem value="cart_abandonment">Cart Abandonment</SelectItem>
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
                      
                      {formData.ruleType === 'viewed_products' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Viewed Products Rules</h3>
                          <div>
                            <Label>Time Range (days)</Label>
                            <Input
                              type="number"
                              value={formData.viewedProductsRules.timeRange}
                              onChange={(e) => handleNestedChange('viewedProductsRules', 'timeRange', parseInt(e.target.value))}
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <Label>Minimum Views</Label>
                            <Input
                              type="number"
                              value={formData.viewedProductsRules.minViews}
                              onChange={(e) => handleNestedChange('viewedProductsRules', 'minViews', parseInt(e.target.value))}
                              placeholder="1"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Exclude Purchased</Label>
                            <Switch
                              checked={formData.viewedProductsRules.excludePurchased}
                              onCheckedChange={(checked) => handleNestedChange('viewedProductsRules', 'excludePurchased', checked)}
                            />
                          </div>
                          {formData.viewedProductsRules.excludePurchased && (
                            <div>
                              <Label>Purchase Exclusion Days</Label>
                              <Input
                                type="number"
                                value={formData.viewedProductsRules.purchaseExclusionDays}
                                onChange={(e) => handleNestedChange('viewedProductsRules', 'purchaseExclusionDays', parseInt(e.target.value))}
                                placeholder="30"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {formData.ruleType === 'added_to_cart' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Added to Cart Rules</h3>
                          <div>
                            <Label>Time Range (days)</Label>
                            <Input
                              type="number"
                              value={formData.addedToCartRules.timeRange}
                              onChange={(e) => handleNestedChange('addedToCartRules', 'timeRange', parseInt(e.target.value))}
                              placeholder="7"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Exclude Purchased</Label>
                            <Switch
                              checked={formData.addedToCartRules.excludePurchased}
                              onCheckedChange={(checked) => handleNestedChange('addedToCartRules', 'excludePurchased', checked)}
                            />
                          </div>
                          {formData.addedToCartRules.excludePurchased && (
                            <div>
                              <Label>Purchase Exclusion Days</Label>
                              <Input
                                type="number"
                                value={formData.addedToCartRules.purchaseExclusionDays}
                                onChange={(e) => handleNestedChange('addedToCartRules', 'purchaseExclusionDays', parseInt(e.target.value))}
                                placeholder="30"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {formData.ruleType === 'cart_abandonment' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Cart Abandonment Rules</h3>
                          <div>
                            <Label>Time Range (days)</Label>
                            <Input
                              type="number"
                              value={formData.cartAbandonmentRules.timeRange}
                              onChange={(e) => handleNestedChange('cartAbandonmentRules', 'timeRange', parseInt(e.target.value))}
                              placeholder="7"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Exclude Purchased</Label>
                            <Switch
                              checked={formData.cartAbandonmentRules.excludePurchased}
                              onCheckedChange={(checked) => handleNestedChange('cartAbandonmentRules', 'excludePurchased', checked)}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <Label>Frequency Cap</Label>
                          <Input
                            type="number"
                            value={formData.frequencyCap}
                            onChange={(e) => handleInputChange('frequencyCap', parseInt(e.target.value))}
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <Label>Frequency Period</Label>
                          <Select value={formData.frequencyPeriod} onValueChange={(value) => handleInputChange('frequencyPeriod', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Rule" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No retargeting rules found. Create your first rule to get started.</p>
                </div>
              ) : (
                rules.map((rule) => (
                  <Card key={rule._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{rule.ruleName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                              {getRuleIcon(rule.ruleType)}
                              {rule.ruleType.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              rule.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              rule.syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.syncStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Actual Size</p>
                              <p className="font-semibold">{rule.actualSize || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Estimated Size</p>
                              <p className="font-semibold">{rule.estimatedSize || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Last Sync</p>
                              <p className="font-semibold">{rule.syncAge || 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Frequency Cap</p>
                              <p className="font-semibold">{rule.frequencyCap}/{rule.frequencyPeriod}</p>
                            </div>
                          </div>
                          {rule.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{rule.syncError}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(rule._id)}
                            disabled={syncing === rule._id || rule.status !== 'active'}
                          >
                            {syncing === rule._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(rule)}
                            disabled={loading}
                          >
                            {rule.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(rule._id)}
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

export default RetargetingAutomation
