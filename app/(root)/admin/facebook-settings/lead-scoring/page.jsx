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
import { Facebook, Plus, Edit, Trash2, RefreshCw, Target, CheckCircle, XCircle, Play, Pause, Star, Flame, Thermometer, Snowflake } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Lead Scoring' },
]

const LeadScoring = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [scoring, setScoring] = useState(null)
  const [rules, setRules] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [scoringResult, setScoringResult] = useState(null)
  
  const [formData, setFormData] = useState({
    ruleName: '',
    ruleType: 'demographic',
    pageId: '',
    scoringCriteria: [],
    scoreThresholds: [
      { thresholdName: 'hot', minScore: 70, maxScore: 100, action: '', assignTo: '', autoResponse: '' },
      { thresholdName: 'warm', minScore: 40, maxScore: 69, action: '', assignTo: '', autoResponse: '' },
      { thresholdName: 'cold', minScore: 0, maxScore: 39, action: '', assignTo: '', autoResponse: '' }
    ],
    demographicCriteria: { ageRange: { min: 0, max: 100 }, gender: [], location: [], language: [] },
    behavioralCriteria: { pageViews: { min: 0, max: 0 }, timeOnSite: { min: 0, max: 0 }, sessions: { min: 0, max: 0 }, lastActivityDays: 30 },
    engagementCriteria: { messageCount: { min: 0, max: 0 }, responseRate: { min: 0, max: 0 }, clicks: { min: 0, max: 0 }, shares: { min: 0, max: 0 } },
    autoScore: true,
    scoringInterval: 24,
    status: 'active'
  })

  const [criterionFormData, setCriterionFormData] = useState({
    criterionId: '',
    criterionName: '',
    criterionType: 'behavioral',
    field: '',
    operator: 'equals',
    value: '',
    value2: '',
    points: 10,
    weight: 1,
    required: false,
    order: 0
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/lead-scoring')
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

  const handleCriterionInputChange = (field, value) => {
    setCriterionFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCriterion = () => {
    if (!criterionFormData.criterionId || !criterionFormData.criterionName || !criterionFormData.field) {
      showToast('error', 'Criterion ID, Name, and Field are required')
      return
    }
    
    const newCriterion = { ...criterionFormData, order: formData.scoringCriteria.length }
    setFormData(prev => ({
      ...prev,
      scoringCriteria: [...prev.scoringCriteria, newCriterion]
    }))
    
    setCriterionFormData({
      criterionId: '',
      criterionName: '',
      criterionType: 'behavioral',
      field: '',
      operator: 'equals',
      value: '',
      value2: '',
      points: 10,
      weight: 1,
      required: false,
      order: 0
    })
  }

  const removeCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      scoringCriteria: prev.scoringCriteria.filter((_, i) => i !== index)
    }))
  }

  const handleThresholdChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      scoreThresholds: prev.scoreThresholds.map((threshold, i) => 
        i === index ? { ...threshold, [field]: value } : threshold
      )
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingRule ? { ...formData, _id: editingRule._id } : formData
      
      if (payload.scoringCriteria.length === 0) {
        showToast('error', 'At least one scoring criterion is required')
        return
      }
      
      const { data } = await axios.post('/api/facebook/lead-scoring', payload)
      
      if (data.success) {
        showToast('success', editingRule ? 'Rule updated successfully' : 'Rule created successfully')
        setIsDialogOpen(false)
        setEditingRule(null)
        setFormData({
          ruleName: '',
          ruleType: 'demographic',
          pageId: '',
          scoringCriteria: [],
          scoreThresholds: [
            { thresholdName: 'hot', minScore: 70, maxScore: 100, action: '', assignTo: '', autoResponse: '' },
            { thresholdName: 'warm', minScore: 40, maxScore: 69, action: '', assignTo: '', autoResponse: '' },
            { thresholdName: 'cold', minScore: 0, maxScore: 39, action: '', assignTo: '', autoResponse: '' }
          ],
          demographicCriteria: { ageRange: { min: 0, max: 100 }, gender: [], location: [], language: [] },
          behavioralCriteria: { pageViews: { min: 0, max: 0 }, timeOnSite: { min: 0, max: 0 }, sessions: { min: 0, max: 0 }, lastActivityDays: 30 },
          engagementCriteria: { messageCount: { min: 0, max: 0 }, responseRate: { min: 0, max: 0 }, clicks: { min: 0, max: 0 }, shares: { min: 0, max: 0 } },
          autoScore: true,
          scoringInterval: 24,
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
      const { data } = await axios.delete(`/api/facebook/lead-scoring/${ruleId}`)
      
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
      const { data } = await axios.post(`/api/facebook/lead-scoring/${ruleId}/sync`)
      
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

  const handleScore = async (ruleId) => {
    try {
      setScoring(ruleId)
      const { data } = await axios.post('/api/facebook/lead-scoring/score', { ruleId })
      
      if (data.success) {
        setScoringResult(data.data)
        showToast('success', 'Leads scored successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to score leads')
    } finally {
      setScoring(null)
    }
  }

  const handleToggleStatus = async (rule) => {
    try {
      setLoading(true)
      const newStatus = rule.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/lead-scoring/${rule._id}`, {
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hot': return <Flame className="h-4 w-4 text-red-600" />
      case 'warm': return <Thermometer className="h-4 w-4 text-yellow-600" />
      case 'cold': return <Snowflake className="h-4 w-4 text-blue-600" />
      default: return <Star className="h-4 w-4" />
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
                  <p className="text-sm text-gray-600">Leads Scored</p>
                  <p className="text-2xl font-bold">{rules.reduce((sum, r) => sum + (r.performance?.totalLeadsScored || 0), 0)}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hot Leads</p>
                  <p className="text-2xl font-bold">{rules.reduce((sum, r) => sum + (r.performance?.hotLeads || 0), 0)}</p>
                </div>
                <Flame className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold">{rules.length > 0 ? (rules.reduce((sum, r) => sum + (r.performance?.avgScore || 0), 0) / rules.length).toFixed(1) : '0.0'}</p>
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
                <CardTitle>Lead Scoring</CardTitle>
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
                        ruleType: 'demographic',
                        pageId: '',
                        scoringCriteria: [],
                        scoreThresholds: [
                          { thresholdName: 'hot', minScore: 70, maxScore: 100, action: '', assignTo: '', autoResponse: '' },
                          { thresholdName: 'warm', minScore: 40, maxScore: 69, action: '', assignTo: '', autoResponse: '' },
                          { thresholdName: 'cold', minScore: 0, maxScore: 39, action: '', assignTo: '', autoResponse: '' }
                        ],
                        demographicCriteria: { ageRange: { min: 0, max: 100 }, gender: [], location: [], language: [] },
                        behavioralCriteria: { pageViews: { min: 0, max: 0 }, timeOnSite: { min: 0, max: 0 }, sessions: { min: 0, max: 0 }, lastActivityDays: 30 },
                        engagementCriteria: { messageCount: { min: 0, max: 0 }, responseRate: { min: 0, max: 0 }, clicks: { min: 0, max: 0 }, shares: { min: 0, max: 0 } },
                        autoScore: true,
                        scoringInterval: 24,
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule ? 'Edit Lead Scoring Rule' : 'Create New Lead Scoring Rule'}
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Rule Type</Label>
                          <Select value={formData.ruleType} onValueChange={(value) => handleInputChange('ruleType', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="demographic">Demographic</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="engagement">Engagement</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Page ID</Label>
                          <Input
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            placeholder="Enter Facebook Page ID"
                          />
                        </div>
                      </div>
                      
                      {/* Scoring Criteria */}
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3">Scoring Criteria ({formData.scoringCriteria.length})</h3>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Criterion ID</Label>
                              <Input
                                value={criterionFormData.criterionId}
                                onChange={(e) => handleCriterionInputChange('criterionId', e.target.value)}
                                placeholder="crit_1"
                              />
                            </div>
                            <div>
                              <Label>Criterion Name</Label>
                              <Input
                                value={criterionFormData.criterionName}
                                onChange={(e) => handleCriterionInputChange('criterionName', e.target.value)}
                                placeholder="Page Views"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label>Field</Label>
                              <Input
                                value={criterionFormData.field}
                                onChange={(e) => handleCriterionInputChange('field', e.target.value)}
                                placeholder="pageViews"
                              />
                            </div>
                            <div>
                              <Label>Operator</Label>
                              <Select value={criterionFormData.operator} onValueChange={(value) => handleCriterionInputChange('operator', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                  <SelectItem value="between">Between</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Points</Label>
                              <Input
                                type="number"
                                value={criterionFormData.points}
                                onChange={(e) => handleCriterionInputChange('points', parseInt(e.target.value))}
                                placeholder="10"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              value={criterionFormData.value}
                              onChange={(e) => handleCriterionInputChange('value', e.target.value)}
                              placeholder="5"
                            />
                          </div>
                          {criterionFormData.operator === 'between' && (
                            <div>
                              <Label>Value 2</Label>
                              <Input
                                value={criterionFormData.value2}
                                onChange={(e) => handleCriterionInputChange('value2', e.target.value)}
                                placeholder="10"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={criterionFormData.required}
                              onCheckedChange={(checked) => handleCriterionInputChange('required', checked)}
                            />
                            <Label>Required</Label>
                          </div>
                          <Button onClick={addCriterion} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Criterion
                          </Button>
                        </div>
                        
                        {formData.scoringCriteria.length > 0 && (
                          <div className="space-y-2">
                            {formData.scoringCriteria.map((criterion, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                <div>
                                  <p className="font-semibold">{criterion.criterionName}</p>
                                  <p className="text-sm text-gray-600">{criterion.field} {criterion.operator} {criterion.value} - {criterion.points} points</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCriterion(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Score Thresholds */}
                      <div className="pt-4 border-t space-y-3">
                        <h3 className="font-semibold">Score Thresholds</h3>
                        {formData.scoreThresholds.map((threshold, index) => (
                          <div key={index} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <Label>Category</Label>
                              <Select value={threshold.thresholdName} onValueChange={(value) => handleThresholdChange(index, 'thresholdName', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hot">Hot</SelectItem>
                                  <SelectItem value="warm">Warm</SelectItem>
                                  <SelectItem value="cold">Cold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Min Score</Label>
                              <Input
                                type="number"
                                value={threshold.minScore}
                                onChange={(e) => handleThresholdChange(index, 'minScore', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Max Score</Label>
                              <Input
                                type="number"
                                value={threshold.maxScore}
                                onChange={(e) => handleThresholdChange(index, 'maxScore', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Action</Label>
                              <Input
                                value={threshold.action}
                                onChange={(e) => handleThresholdChange(index, 'action', e.target.value)}
                                placeholder="Assign to Sales"
                              />
                            </div>
                          </div>
                        ))}
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
                  <p className="text-gray-600">No lead scoring rules found. Create your first rule to get started.</p>
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
                              {rule.ruleType}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              rule.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.syncStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Leads Scored</p>
                              <p className="font-semibold">{rule.performance?.totalLeadsScored || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Hot Leads</p>
                              <p className="font-semibold text-red-600">{rule.performance?.hotLeads || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Warm Leads</p>
                              <p className="font-semibold text-yellow-600">{rule.performance?.warmLeads || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg Score</p>
                              <p className="font-semibold">{rule.performance?.avgScore?.toFixed(1) || '0.0'}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <p>Criteria: {rule.scoringCriteria?.length || 0}</p>
                            <p>Max Score: {rule.maxScore || 0}</p>
                          </div>
                          {rule.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{rule.syncError}</span>
                            </div>
                          )}
                          {scoringResult && scoringResult.rule.id === rule._id && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold mb-2">Scoring Results</h4>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Total Scored</p>
                                  <p className="font-semibold">{scoringResult.summary.totalScored}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Hot</p>
                                  <p className="font-semibold text-red-600">{scoringResult.summary.hot}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Warm</p>
                                  <p className="font-semibold text-yellow-600">{scoringResult.summary.warm}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScore(rule._id)}
                            disabled={scoring === rule._id || rule.status !== 'active'}
                          >
                            {scoring === rule._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4 mr-2" />
                            )}
                            Score
                          </Button>
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

export default LeadScoring
