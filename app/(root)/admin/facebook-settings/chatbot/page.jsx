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
import { Facebook, Plus, Edit, Trash2, RefreshCw, Bot, MessageSquare, CheckCircle, XCircle, Play, Pause } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Chatbot Automation' },
]

const ChatbotAutomation = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [flows, setFlows] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  
  const [formData, setFormData] = useState({
    flowName: '',
    flowType: 'customer_support',
    pageId: '',
    welcomeMessage: '',
    welcomeButtons: [],
    steps: [],
    aiEnabled: false,
    aiModel: 'gpt-3.5-turbo',
    aiSystemPrompt: '',
    aiTemperature: 0.7,
    aiMaxTokens: 500,
    nlpEnabled: false,
    intents: [],
    entities: [],
    handoffEnabled: false,
    handoffConditions: [],
    handoffMessage: '',
    fallbackMessage: "I'm sorry, I didn't understand. Can you please rephrase?",
    maxRetries: 3,
    status: 'active'
  })

  const [stepFormData, setStepFormData] = useState({
    stepId: '',
    stepName: '',
    stepType: 'message',
    content: '',
    buttons: [],
    nextStepId: '',
    condition: 'equals',
    conditionValue: '',
    trueStepId: '',
    falseStepId: '',
    actionType: '',
    actionData: {},
    required: false,
    validation: { type: 'text', errorMessage: '' },
    order: 0
  })

  useEffect(() => {
    fetchFlows()
  }, [])

  const fetchFlows = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/chatbot/flows')
      if (data.success) {
        setFlows(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch flows')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepInputChange = (field, value) => {
    setStepFormData(prev => ({ ...prev, [field]: value }))
  }

  const addStep = () => {
    if (!stepFormData.stepId || !stepFormData.stepName) {
      showToast('error', 'Step ID and Step Name are required')
      return
    }
    
    const newStep = { ...stepFormData, order: formData.steps.length }
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
    
    setStepFormData({
      stepId: '',
      stepName: '',
      stepType: 'message',
      content: '',
      buttons: [],
      nextStepId: '',
      condition: 'equals',
      conditionValue: '',
      trueStepId: '',
      falseStepId: '',
      actionType: '',
      actionData: {},
      required: false,
      validation: { type: 'text', errorMessage: '' },
      order: 0
    })
    
    setCurrentStep(formData.steps.length)
  }

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingFlow ? { ...formData, _id: editingFlow._id } : formData
      
      if (payload.steps.length === 0) {
        showToast('error', 'At least one step is required')
        return
      }
      
      const { data } = await axios.post('/api/facebook/chatbot/flows', payload)
      
      if (data.success) {
        showToast('success', editingFlow ? 'Flow updated successfully' : 'Flow created successfully')
        setIsDialogOpen(false)
        setEditingFlow(null)
        setFormData({
          flowName: '',
          flowType: 'customer_support',
          pageId: '',
          welcomeMessage: '',
          welcomeButtons: [],
          steps: [],
          aiEnabled: false,
          aiModel: 'gpt-3.5-turbo',
          aiSystemPrompt: '',
          aiTemperature: 0.7,
          aiMaxTokens: 500,
          nlpEnabled: false,
          intents: [],
          entities: [],
          handoffEnabled: false,
          handoffConditions: [],
          handoffMessage: '',
          fallbackMessage: "I'm sorry, I didn't understand. Can you please rephrase?",
          maxRetries: 3,
          status: 'active'
        })
        fetchFlows()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save flow')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (flow) => {
    setEditingFlow(flow)
    setFormData(flow)
    setCurrentStep(0)
    setIsDialogOpen(true)
  }

  const handleDelete = async (flowId) => {
    if (!confirm('Are you sure you want to delete this flow?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/chatbot/flows/${flowId}`)
      
      if (data.success) {
        showToast('success', 'Flow deleted successfully')
        fetchFlows()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete flow')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (flowId) => {
    try {
      setSyncing(flowId)
      const { data } = await axios.post(`/api/facebook/chatbot/flows/${flowId}/sync`)
      
      if (data.success) {
        showToast('success', 'Flow synced successfully')
        fetchFlows()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync flow')
    } finally {
      setSyncing(null)
    }
  }

  const handleToggleStatus = async (flow) => {
    try {
      setLoading(true)
      const newStatus = flow.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/chatbot/flows/${flow._id}`, {
        ...flow,
        status: newStatus
      })
      
      if (data.success) {
        showToast('success', `Flow ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
        fetchFlows()
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
                  <p className="text-sm text-gray-600">Active Flows</p>
                  <p className="text-2xl font-bold">{flows.filter(f => f.status === 'active').length}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold">{flows.reduce((sum, f) => sum + (f.performance?.totalConversations || 0), 0)}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">{flows.length > 0 ? (flows.reduce((sum, f) => sum + (f.completionRate || 0), 0) / flows.length).toFixed(1) : '0.0'}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Synced Flows</p>
                  <p className="text-2xl font-bold">{flows.filter(f => f.syncStatus === 'synced').length}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-600" />
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
                <CardTitle>Chatbot Automation</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchFlows}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingFlow(null)
                      setFormData({
                        flowName: '',
                        flowType: 'customer_support',
                        pageId: '',
                        welcomeMessage: '',
                        welcomeButtons: [],
                        steps: [],
                        aiEnabled: false,
                        aiModel: 'gpt-3.5-turbo',
                        aiSystemPrompt: '',
                        aiTemperature: 0.7,
                        aiMaxTokens: 500,
                        nlpEnabled: false,
                        intents: [],
                        entities: [],
                        handoffEnabled: false,
                        handoffConditions: [],
                        handoffMessage: '',
                        fallbackMessage: "I'm sorry, I didn't understand. Can you please rephrase?",
                        maxRetries: 3,
                        status: 'active'
                      })
                      setCurrentStep(0)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Flow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingFlow ? 'Edit Chatbot Flow' : 'Create New Chatbot Flow'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Flow Name</Label>
                        <Input
                          value={formData.flowName}
                          onChange={(e) => handleInputChange('flowName', e.target.value)}
                          placeholder="Enter flow name"
                        />
                      </div>
                      <div>
                        <Label>Flow Type</Label>
                        <Select value={formData.flowType} onValueChange={(value) => handleInputChange('flowType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer_support">Customer Support</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="lead_generation">Lead Generation</SelectItem>
                            <SelectItem value="order_tracking">Order Tracking</SelectItem>
                            <SelectItem value="product_recommendation">Product Recommendation</SelectItem>
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
                      <div>
                        <Label>Welcome Message</Label>
                        <Textarea
                          value={formData.welcomeMessage}
                          onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                          placeholder="Enter welcome message"
                          rows={3}
                        />
                      </div>
                      
                      {/* Steps Section */}
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3">Conversation Steps ({formData.steps.length})</h3>
                        
                        {/* Add Step Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Step ID</Label>
                              <Input
                                value={stepFormData.stepId}
                                onChange={(e) => handleStepInputChange('stepId', e.target.value)}
                                placeholder="step_1"
                              />
                            </div>
                            <div>
                              <Label>Step Name</Label>
                              <Input
                                value={stepFormData.stepName}
                                onChange={(e) => handleStepInputChange('stepName', e.target.value)}
                                placeholder="Greeting"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Step Type</Label>
                              <Select value={stepFormData.stepType} onValueChange={(value) => handleStepInputChange('stepType', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="message">Message</SelectItem>
                                  <SelectItem value="question">Question</SelectItem>
                                  <SelectItem value="menu">Menu</SelectItem>
                                  <SelectItem value="input">Input</SelectItem>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="condition">Condition</SelectItem>
                                  <SelectItem value="handoff">Handoff</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Next Step ID</Label>
                              <Input
                                value={stepFormData.nextStepId}
                                onChange={(e) => handleStepInputChange('nextStepId', e.target.value)}
                                placeholder="step_2"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Content</Label>
                            <Textarea
                              value={stepFormData.content}
                              onChange={(e) => handleStepInputChange('content', e.target.value)}
                              placeholder="Enter step content"
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={stepFormData.required}
                              onCheckedChange={(checked) => handleStepInputChange('required', checked)}
                            />
                            <Label>Required</Label>
                          </div>
                          <Button onClick={addStep} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Step
                          </Button>
                        </div>
                        
                        {/* Steps List */}
                        {formData.steps.length > 0 && (
                          <div className="space-y-2">
                            {formData.steps.map((step, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                <div>
                                  <p className="font-semibold">{step.stepName}</p>
                                  <p className="text-sm text-gray-600">{step.stepType} - {step.content?.substring(0, 50)}...</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeStep(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* AI Configuration */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">AI Configuration</h3>
                          <Switch
                            checked={formData.aiEnabled}
                            onCheckedChange={(checked) => handleInputChange('aiEnabled', checked)}
                          />
                        </div>
                        {formData.aiEnabled && (
                          <>
                            <div>
                              <Label>AI Model</Label>
                              <Select value={formData.aiModel} onValueChange={(value) => handleInputChange('aiModel', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="claude">Claude</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>System Prompt</Label>
                              <Textarea
                                value={formData.aiSystemPrompt}
                                onChange={(e) => handleInputChange('aiSystemPrompt', e.target.value)}
                                placeholder="Enter system prompt"
                                rows={2}
                              />
                            </div>
                          </>
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
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Flow" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flows.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No chatbot flows found. Create your first flow to get started.</p>
                </div>
              ) : (
                flows.map((flow) => (
                  <Card key={flow._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{flow.flowName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              flow.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {flow.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {flow.flowType.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              flow.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              flow.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {flow.syncStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Steps</p>
                              <p className="font-semibold">{flow.steps?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Conversations</p>
                              <p className="font-semibold">{flow.performance?.totalConversations || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Completion Rate</p>
                              <p className="font-semibold">{flow.completionRate?.toFixed(1) || 0}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">AI Enabled</p>
                              <p className="font-semibold">{flow.aiEnabled ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                          {flow.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{flow.syncError}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(flow._id)}
                            disabled={syncing === flow._id || flow.status !== 'active'}
                          >
                            {syncing === flow._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(flow)}
                            disabled={loading}
                          >
                            {flow.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(flow)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(flow._id)}
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

export default ChatbotAutomation
