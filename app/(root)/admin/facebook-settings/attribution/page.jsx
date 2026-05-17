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
import { Facebook, Plus, Edit, Trash2, RefreshCw, TrendingUp, PieChart, Target, CheckCircle, Play } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Multi-Touch Attribution' },
]

const MultiTouchAttribution = () => {
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(null)
  const [models, setModels] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [calculationResult, setCalculationResult] = useState(null)
  
  const [formData, setFormData] = useState({
    modelName: '',
    modelType: 'linear',
    adAccountId: '',
    isDefault: false,
    firstClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
    lastClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
    linearConfig: { lookbackWindow: 30, equalDistribution: true, minTouchpoints: 1 },
    timeDecayConfig: { lookbackWindow: 30, decayRate: 0.5, halfLife: 7 },
    positionBasedConfig: { lookbackWindow: 30, firstTouchCredit: 40, lastTouchCredit: 40, middleTouchCredit: 20 },
    customConfig: { lookbackWindow: 30, touchpointRules: [] },
    status: 'active'
  })

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/attribution/models')
      if (data.success) {
        setModels(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch models')
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
      const payload = editingModel ? { ...formData, _id: editingModel._id } : formData
      
      const { data } = await axios.post('/api/facebook/attribution/models', payload)
      
      if (data.success) {
        showToast('success', editingModel ? 'Model updated successfully' : 'Model created successfully')
        setIsDialogOpen(false)
        setEditingModel(null)
        setFormData({
          modelName: '',
          modelType: 'linear',
          adAccountId: '',
          isDefault: false,
          firstClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
          lastClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
          linearConfig: { lookbackWindow: 30, equalDistribution: true, minTouchpoints: 1 },
          timeDecayConfig: { lookbackWindow: 30, decayRate: 0.5, halfLife: 7 },
          positionBasedConfig: { lookbackWindow: 30, firstTouchCredit: 40, lastTouchCredit: 40, middleTouchCredit: 20 },
          customConfig: { lookbackWindow: 30, touchpointRules: [] },
          status: 'active'
        })
        fetchModels()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save model')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (model) => {
    setEditingModel(model)
    setFormData(model)
    setIsDialogOpen(true)
  }

  const handleDelete = async (modelId) => {
    if (!confirm('Are you sure you want to delete this model?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/attribution/models/${modelId}`)
      
      if (data.success) {
        showToast('success', 'Model deleted successfully')
        fetchModels()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete model')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async (modelId) => {
    try {
      setCalculating(modelId)
      const { data } = await axios.post('/api/facebook/attribution/calculate', { modelId })
      
      if (data.success) {
        setCalculationResult(data.data)
        showToast('success', 'Attribution calculated successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to calculate attribution')
    } finally {
      setCalculating(null)
    }
  }

  const handleSetDefault = async (model) => {
    if (model.isDefault) return
    
    try {
      setLoading(true)
      const { data } = await axios.put(`/api/facebook/attribution/models/${model._id}`, {
        ...model,
        isDefault: true
      })
      
      if (data.success) {
        showToast('success', 'Default model set successfully')
        fetchModels()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to set default model')
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
                  <p className="text-sm text-gray-600">Active Models</p>
                  <p className="text-2xl font-bold">{models.filter(m => m.status === 'active').length}</p>
                </div>
                <PieChart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Conversions</p>
                  <p className="text-2xl font-bold">{models.reduce((sum, m) => sum + (m.performance?.totalConversions || 0), 0)}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attributed Revenue</p>
                  <p className="text-2xl font-bold">${models.reduce((sum, m) => sum + (m.performance?.attributedRevenue || 0), 0).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Attribution Rate</p>
                  <p className="text-2xl font-bold">{models.length > 0 ? (models.reduce((sum, m) => sum + (m.performance?.avgAttributionRate || 0), 0) / models.length).toFixed(1) : '0.0'}%</p>
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
                <CardTitle>Multi-Touch Attribution Models</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchModels}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingModel(null)
                      setFormData({
                        modelName: '',
                        modelType: 'linear',
                        adAccountId: '',
                        isDefault: false,
                        firstClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
                        lastClickConfig: { lookbackWindow: 30, creditPercentage: 100 },
                        linearConfig: { lookbackWindow: 30, equalDistribution: true, minTouchpoints: 1 },
                        timeDecayConfig: { lookbackWindow: 30, decayRate: 0.5, halfLife: 7 },
                        positionBasedConfig: { lookbackWindow: 30, firstTouchCredit: 40, lastTouchCredit: 40, middleTouchCredit: 20 },
                        customConfig: { lookbackWindow: 30, touchpointRules: [] },
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingModel ? 'Edit Attribution Model' : 'Create New Attribution Model'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Model Name</Label>
                        <Input
                          value={formData.modelName}
                          onChange={(e) => handleInputChange('modelName', e.target.value)}
                          placeholder="Enter model name"
                        />
                      </div>
                      <div>
                        <Label>Model Type</Label>
                        <Select value={formData.modelType} onValueChange={(value) => handleInputChange('modelType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first_click">First Click</SelectItem>
                            <SelectItem value="last_click">Last Click</SelectItem>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="time_decay">Time Decay</SelectItem>
                            <SelectItem value="position_based">Position Based</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
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
                      <div className="flex items-center justify-between">
                        <Label>Set as Default</Label>
                        <Switch
                          checked={formData.isDefault}
                          onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                        />
                      </div>
                      
                      {formData.modelType === 'linear' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Linear Configuration</h3>
                          <div>
                            <Label>Lookback Window (days)</Label>
                            <Input
                              type="number"
                              value={formData.linearConfig.lookbackWindow}
                              onChange={(e) => handleNestedChange('linearConfig', 'lookbackWindow', parseInt(e.target.value))}
                              placeholder="30"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Equal Distribution</Label>
                            <Switch
                              checked={formData.linearConfig.equalDistribution}
                              onCheckedChange={(checked) => handleNestedChange('linearConfig', 'equalDistribution', checked)}
                            />
                          </div>
                          <div>
                            <Label>Minimum Touchpoints</Label>
                            <Input
                              type="number"
                              value={formData.linearConfig.minTouchpoints}
                              onChange={(e) => handleNestedChange('linearConfig', 'minTouchpoints', parseInt(e.target.value))}
                              placeholder="1"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.modelType === 'time_decay' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Time Decay Configuration</h3>
                          <div>
                            <Label>Lookback Window (days)</Label>
                            <Input
                              type="number"
                              value={formData.timeDecayConfig.lookbackWindow}
                              onChange={(e) => handleNestedChange('timeDecayConfig', 'lookbackWindow', parseInt(e.target.value))}
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <Label>Decay Rate</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.timeDecayConfig.decayRate}
                              onChange={(e) => handleNestedChange('timeDecayConfig', 'decayRate', parseFloat(e.target.value))}
                              placeholder="0.5"
                            />
                          </div>
                          <div>
                            <Label>Half Life (days)</Label>
                            <Input
                              type="number"
                              value={formData.timeDecayConfig.halfLife}
                              onChange={(e) => handleNestedChange('timeDecayConfig', 'halfLife', parseInt(e.target.value))}
                              placeholder="7"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.modelType === 'position_based' && (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-semibold">Position Based Configuration</h3>
                          <div>
                            <Label>Lookback Window (days)</Label>
                            <Input
                              type="number"
                              value={formData.positionBasedConfig.lookbackWindow}
                              onChange={(e) => handleNestedChange('positionBasedConfig', 'lookbackWindow', parseInt(e.target.value))}
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <Label>First Touch Credit (%)</Label>
                            <Input
                              type="number"
                              value={formData.positionBasedConfig.firstTouchCredit}
                              onChange={(e) => handleNestedChange('positionBasedConfig', 'firstTouchCredit', parseInt(e.target.value))}
                              placeholder="40"
                            />
                          </div>
                          <div>
                            <Label>Last Touch Credit (%)</Label>
                            <Input
                              type="number"
                              value={formData.positionBasedConfig.lastTouchCredit}
                              onChange={(e) => handleNestedChange('positionBasedConfig', 'lastTouchCredit', parseInt(e.target.value))}
                              placeholder="40"
                            />
                          </div>
                          <div>
                            <Label>Middle Touch Credit (%)</Label>
                            <Input
                              type="number"
                              value={formData.positionBasedConfig.middleTouchCredit}
                              onChange={(e) => handleNestedChange('positionBasedConfig', 'middleTouchCredit', parseInt(e.target.value))}
                              placeholder="20"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Model" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attribution models found. Create your first model to get started.</p>
                </div>
              ) : (
                models.map((model) => (
                  <Card key={model._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{model.modelName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              model.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {model.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {model.modelType.replace('_', ' ')}
                            </span>
                            {model.isDefault && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Conversions</p>
                              <p className="font-semibold">{model.performance?.totalConversions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Attributed Conversions</p>
                              <p className="font-semibold">{model.performance?.attributedConversions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Attributed Revenue</p>
                              <p className="font-semibold">${(model.performance?.attributedRevenue || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Attribution Rate</p>
                              <p className="font-semibold">{model.attributionRate?.toFixed(1) || 0}%</p>
                            </div>
                          </div>
                          {calculationResult && calculationResult.model.id === model._id && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold mb-2">Touchpoint Attribution</h4>
                              {calculationResult.attribution.touchpoints.map((tp, idx) => (
                                <div key={idx} className="flex justify-between text-sm mb-1">
                                  <span>{tp.source}</span>
                                  <span>{(tp.attributedRevenue || 0).toFixed(2)} ({tp.attributedConversions.toFixed(1)} conv)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCalculate(model._id)}
                            disabled={calculating === model._id || model.status !== 'active'}
                          >
                            {calculating === model._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            Calculate
                          </Button>
                          {!model.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(model)}
                              disabled={loading}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(model)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(model._id)}
                            disabled={loading || model.isDefault}
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

export default MultiTouchAttribution
