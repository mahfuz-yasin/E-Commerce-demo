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
import { Facebook, Plus, Edit, Trash2, Play, Pause, RefreshCw, DollarSign, TrendingUp, TrendingDown, Zap } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Budget Optimization' },
]

const BudgetOptimization = () => {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(null)
  const [rules, setRules] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleType: 'roas_based',
    adAccountId: '',
    campaignIds: [],
    roasTarget: 2.0,
    roasIncreasePercentage: 20,
    roasDecreasePercentage: 20,
    cpaTarget: 10,
    cpaIncreasePercentage: 20,
    cpaDecreasePercentage: 20,
    performanceMetric: 'conversions',
    performanceThreshold: 10,
    performanceAction: 'increase_budget',
    performancePercentage: 20,
    minimumBudget: 10,
    maximumBudget: 1000,
    checkInterval: 3,
    notifyOnExecution: true,
    status: 'active'
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/budget-rules')
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

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingRule ? { ...formData, _id: editingRule._id } : formData
      
      const { data } = await axios.post('/api/facebook/budget-rules', payload)
      
      if (data.success) {
        showToast('success', editingRule ? 'Rule updated successfully' : 'Rule created successfully')
        setIsDialogOpen(false)
        setEditingRule(null)
        setFormData({
          ruleName: '',
          ruleType: 'roas_based',
          adAccountId: '',
          campaignIds: [],
          roasTarget: 2.0,
          roasIncreasePercentage: 20,
          roasDecreasePercentage: 20,
          cpaTarget: 10,
          cpaIncreasePercentage: 20,
          cpaDecreasePercentage: 20,
          performanceMetric: 'conversions',
          performanceThreshold: 10,
          performanceAction: 'increase_budget',
          performancePercentage: 20,
          minimumBudget: 10,
          maximumBudget: 1000,
          checkInterval: 3,
          notifyOnExecution: true,
          status: 'active'
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
      const { data } = await axios.delete(`/api/facebook/budget-rules/${ruleId}`)
      
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

  const handleApplyRule = async (ruleId) => {
    try {
      setApplying(ruleId)
      const { data } = await axios.post('/api/facebook/budget-rules/apply', { ruleId })
      
      if (data.success) {
        showToast('success', `Rule applied successfully. ${data.data.summary.campaignsModified} campaigns modified.`)
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to apply rule')
    } finally {
      setApplying(null)
    }
  }

  const handleToggleStatus = async (rule) => {
    try {
      setLoading(true)
      const newStatus = rule.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/budget-rules/${rule._id}`, {
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
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget Increased</p>
                  <p className="text-2xl font-bold">${rules.reduce((sum, r) => sum + (r.totalBudgetIncreased || 0), 0).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget Decreased</p>
                  <p className="text-2xl font-bold">${rules.reduce((sum, r) => sum + (r.totalBudgetDecreased || 0), 0).toFixed(2)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold">{rules.reduce((sum, r) => sum + (r.executionCount || 0), 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
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
                <CardTitle>Budget Optimization Rules</CardTitle>
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
                        ruleType: 'roas_based',
                        adAccountId: '',
                        campaignIds: [],
                        roasTarget: 2.0,
                        roasIncreasePercentage: 20,
                        roasDecreasePercentage: 20,
                        cpaTarget: 10,
                        cpaIncreasePercentage: 20,
                        cpaDecreasePercentage: 20,
                        performanceMetric: 'conversions',
                        performanceThreshold: 10,
                        performanceAction: 'increase_budget',
                        performancePercentage: 20,
                        minimumBudget: 10,
                        maximumBudget: 1000,
                        checkInterval: 3,
                        notifyOnExecution: true,
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule ? 'Edit Budget Rule' : 'Create New Budget Rule'}
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
                            <SelectItem value="roas_based">ROAS Based</SelectItem>
                            <SelectItem value="cpa_based">CPA Based</SelectItem>
                            <SelectItem value="performance_based">Performance Based</SelectItem>
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
                      
                      {formData.ruleType === 'roas_based' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <Label>ROAS Target</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.roasTarget}
                              onChange={(e) => handleInputChange('roasTarget', parseFloat(e.target.value))}
                              placeholder="2.0"
                            />
                          </div>
                          <div>
                            <Label>Increase Percentage (%)</Label>
                            <Input
                              type="number"
                              value={formData.roasIncreasePercentage}
                              onChange={(e) => handleInputChange('roasIncreasePercentage', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                          <div>
                            <Label>Decrease Percentage (%)</Label>
                            <Input
                              type="number"
                              value={formData.roasDecreasePercentage}
                              onChange={(e) => handleInputChange('roasDecreasePercentage', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.ruleType === 'cpa_based' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <Label>CPA Target</Label>
                            <Input
                              type="number"
                              value={formData.cpaTarget}
                              onChange={(e) => handleInputChange('cpaTarget', parseFloat(e.target.value))}
                              placeholder="10"
                            />
                          </div>
                          <div>
                            <Label>Increase Percentage (%)</Label>
                            <Input
                              type="number"
                              value={formData.cpaIncreasePercentage}
                              onChange={(e) => handleInputChange('cpaIncreasePercentage', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                          <div>
                            <Label>Decrease Percentage (%)</Label>
                            <Input
                              type="number"
                              value={formData.cpaDecreasePercentage}
                              onChange={(e) => handleInputChange('cpaDecreasePercentage', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.ruleType === 'performance_based' && (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <Label>Performance Metric</Label>
                            <Select value={formData.performanceMetric} onValueChange={(value) => handleInputChange('performanceMetric', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="impressions">Impressions</SelectItem>
                                <SelectItem value="clicks">Clicks</SelectItem>
                                <SelectItem value="conversions">Conversions</SelectItem>
                                <SelectItem value="ctr">CTR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Performance Threshold</Label>
                            <Input
                              type="number"
                              value={formData.performanceThreshold}
                              onChange={(e) => handleInputChange('performanceThreshold', parseFloat(e.target.value))}
                              placeholder="10"
                            />
                          </div>
                          <div>
                            <Label>Action</Label>
                            <Select value={formData.performanceAction} onValueChange={(value) => handleInputChange('performanceAction', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="increase_budget">Increase Budget</SelectItem>
                                <SelectItem value="decrease_budget">Decrease Budget</SelectItem>
                                <SelectItem value="pause_campaign">Pause Campaign</SelectItem>
                                <SelectItem value="enable_campaign">Enable Campaign</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Percentage (%)</Label>
                            <Input
                              type="number"
                              value={formData.performancePercentage}
                              onChange={(e) => handleInputChange('performancePercentage', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label>Minimum Budget ($)</Label>
                          <Input
                            type="number"
                            value={formData.minimumBudget}
                            onChange={(e) => handleInputChange('minimumBudget', parseFloat(e.target.value))}
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <Label>Maximum Budget ($)</Label>
                          <Input
                            type="number"
                            value={formData.maximumBudget}
                            onChange={(e) => handleInputChange('maximumBudget', parseFloat(e.target.value))}
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <Label>Check Interval (hours)</Label>
                          <Input
                            type="number"
                            value={formData.checkInterval}
                            onChange={(e) => handleInputChange('checkInterval', parseInt(e.target.value))}
                            placeholder="3"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Notify on Execution</Label>
                          <Switch
                            checked={formData.notifyOnExecution}
                            onCheckedChange={(checked) => handleInputChange('notifyOnExecution', checked)}
                          />
                        </div>
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
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No budget rules found. Create your first rule to get started.</p>
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
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {rule.ruleType.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Executions</p>
                              <p className="font-semibold">{rule.executionCount || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Budget Increased</p>
                              <p className="font-semibold text-green-600">${(rule.totalBudgetIncreased || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Budget Decreased</p>
                              <p className="font-semibold text-red-600">${(rule.totalBudgetDecreased || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Check Interval</p>
                              <p className="font-semibold">{rule.checkInterval}h</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Last executed: {rule.lastExecutedAt ? new Date(rule.lastExecutedAt).toLocaleString() : 'Never'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyRule(rule._id)}
                            disabled={applying === rule._id || rule.status !== 'active'}
                          >
                            {applying === rule._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Apply
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

export default BudgetOptimization
