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
import { Facebook, Plus, Edit, Trash2, RefreshCw, MessageSquare, CheckCircle, XCircle, Sync, Play, Pause, Clock, Target } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Automated Responses' },
]

const AutoResponses = () => {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(null)
  const [responses, setResponses] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState(null)
  
  const [formData, setFormData] = useState({
    responseName: '',
    triggerType: 'keyword',
    pageId: '',
    keywords: [],
    keywordMatchType: 'contains',
    regexPattern: '',
    eventType: 'message_received',
    schedule: 'immediate',
    delayMinutes: 0,
    scheduledTime: '',
    timezone: 'UTC',
    text: '',
    buttons: [],
    quickReplies: [],
    conditions: [],
    targetAudience: 'all',
    frequencyControl: { enabled: false, type: 'once_per_user', limit: 1, cooldownMinutes: 0 },
    fallbackResponse: '',
    noMatchResponse: '',
    status: 'active'
  })

  useEffect(() => {
    fetchResponses()
  }, [])

  const fetchResponses = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/auto-responses')
      if (data.success) {
        setResponses(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch responses')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k)
    setFormData(prev => ({ ...prev, keywords }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingResponse ? { ...formData, _id: editingResponse._id } : formData
      
      const { data } = await axios.post('/api/facebook/auto-responses', payload)
      
      if (data.success) {
        showToast('success', editingResponse ? 'Response updated successfully' : 'Response created successfully')
        setIsDialogOpen(false)
        setEditingResponse(null)
        setFormData({
          responseName: '',
          triggerType: 'keyword',
          pageId: '',
          keywords: [],
          keywordMatchType: 'contains',
          regexPattern: '',
          eventType: 'message_received',
          schedule: 'immediate',
          delayMinutes: 0,
          scheduledTime: '',
          timezone: 'UTC',
          text: '',
          buttons: [],
          quickReplies: [],
          conditions: [],
          targetAudience: 'all',
          frequencyControl: { enabled: false, type: 'once_per_user', limit: 1, cooldownMinutes: 0 },
          fallbackResponse: '',
          noMatchResponse: '',
          status: 'active'
        })
        fetchResponses()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save response')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (response) => {
    setEditingResponse(response)
    setFormData(response)
    setIsDialogOpen(true)
  }

  const handleDelete = async (responseId) => {
    if (!confirm('Are you sure you want to delete this response?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/auto-responses/${responseId}`)
      
      if (data.success) {
        showToast('success', 'Response deleted successfully')
        fetchResponses()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete response')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (responseId) => {
    try {
      setSyncing(responseId)
      const { data } = await axios.post(`/api/facebook/auto-responses/${responseId}/sync`)
      
      if (data.success) {
        showToast('success', 'Response synced successfully')
        fetchResponses()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to sync response')
    } finally {
      setSyncing(null)
    }
  }

  const handleToggleStatus = async (response) => {
    try {
      setLoading(true)
      const newStatus = response.status === 'active' ? 'paused' : 'active'
      const { data } = await axios.put(`/api/facebook/auto-responses/${response._id}`, {
        ...response,
        status: newStatus
      })
      
      if (data.success) {
        showToast('success', `Response ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
        fetchResponses()
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
                  <p className="text-sm text-gray-600">Active Responses</p>
                  <p className="text-2xl font-bold">{responses.filter(r => r.status === 'active').length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Triggers</p>
                  <p className="text-2xl font-bold">{responses.reduce((sum, r) => sum + (r.performance?.totalTriggers || 0), 0)}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">{responses.length > 0 ? (responses.reduce((sum, r) => sum + (r.calculatedResponseRate || 0), 0) / responses.length).toFixed(1) : '0.0'}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Synced Responses</p>
                  <p className="text-2xl font-bold">{responses.filter(r => r.syncStatus === 'synced').length}</p>
                </div>
                <Sync className="h-8 w-8 text-purple-600" />
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
                <CardTitle>Automated Responses</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchResponses}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingResponse(null)
                      setFormData({
                        responseName: '',
                        triggerType: 'keyword',
                        pageId: '',
                        keywords: [],
                        keywordMatchType: 'contains',
                        regexPattern: '',
                        eventType: 'message_received',
                        schedule: 'immediate',
                        delayMinutes: 0,
                        scheduledTime: '',
                        timezone: 'UTC',
                        text: '',
                        buttons: [],
                        quickReplies: [],
                        conditions: [],
                        targetAudience: 'all',
                        frequencyControl: { enabled: false, type: 'once_per_user', limit: 1, cooldownMinutes: 0 },
                        fallbackResponse: '',
                        noMatchResponse: '',
                        status: 'active'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Response
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingResponse ? 'Edit Automated Response' : 'Create New Automated Response'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Response Name</Label>
                        <Input
                          value={formData.responseName}
                          onChange={(e) => handleInputChange('responseName', e.target.value)}
                          placeholder="Enter response name"
                        />
                      </div>
                      <div>
                        <Label>Trigger Type</Label>
                        <Select value={formData.triggerType} onValueChange={(value) => handleInputChange('triggerType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keyword">Keyword</SelectItem>
                            <SelectItem value="keyword_any">Any Keyword</SelectItem>
                            <SelectItem value="keyword_all">All Keywords</SelectItem>
                            <SelectItem value="regex">Regex Pattern</SelectItem>
                            <SelectItem value="event">Event Based</SelectItem>
                            <SelectItem value="time">Time Based</SelectItem>
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
                      
                      {formData.triggerType === 'keyword' && (
                        <div>
                          <Label>Keywords (comma-separated)</Label>
                          <Input
                            value={formData.keywords.join(', ')}
                            onChange={(e) => handleKeywordsChange(e.target.value)}
                            placeholder="hello, hi, hey"
                          />
                        </div>
                      )}
                      
                      {formData.triggerType === 'keyword' && (
                        <div>
                          <Label>Keyword Match Type</Label>
                          <Select value={formData.keywordMatchType} onValueChange={(value) => handleInputChange('keywordMatchType', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exact">Exact Match</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="starts_with">Starts With</SelectItem>
                              <SelectItem value="ends_with">Ends With</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {formData.triggerType === 'regex' && (
                        <div>
                          <Label>Regex Pattern</Label>
                          <Input
                            value={formData.regexPattern}
                            onChange={(e) => handleInputChange('regexPattern', e.target.value)}
                            placeholder="^hello.*"
                          />
                        </div>
                      )}
                      
                      {formData.triggerType === 'event' && (
                        <div>
                          <Label>Event Type</Label>
                          <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="message_received">Message Received</SelectItem>
                              <SelectItem value="postback">Postback</SelectItem>
                              <SelectItem value="quick_reply">Quick Reply</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="opt_in">Opt In</SelectItem>
                              <SelectItem value="opt_out">Opt Out</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div>
                        <Label>Response Text</Label>
                        <Textarea
                          value={formData.text}
                          onChange={(e) => handleInputChange('text', e.target.value)}
                          placeholder="Enter response message"
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label>Target Audience</Label>
                        <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="new_users">New Users</SelectItem>
                            <SelectItem value="returning_users">Returning Users</SelectItem>
                            <SelectItem value="specific_segment">Specific Segment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Frequency Control</h3>
                          <Switch
                            checked={formData.frequencyControl.enabled}
                            onCheckedChange={(checked) => handleInputChange('frequencyControl', { ...formData.frequencyControl, enabled: checked })}
                          />
                        </div>
                        {formData.frequencyControl.enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Type</Label>
                              <Select value={formData.frequencyControl.type} onValueChange={(value) => handleInputChange('frequencyControl', { ...formData.frequencyControl, type: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="once_per_user">Once Per User</SelectItem>
                                  <SelectItem value="once_per_conversation">Once Per Conversation</SelectItem>
                                  <SelectItem value="daily_limit">Daily Limit</SelectItem>
                                  <SelectItem value="weekly_limit">Weekly Limit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Limit</Label>
                              <Input
                                type="number"
                                value={formData.frequencyControl.limit}
                                onChange={(e) => handleInputChange('frequencyControl', { ...formData.frequencyControl, limit: parseInt(e.target.value) })}
                                placeholder="1"
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
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Response" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No automated responses found. Create your first response to get started.</p>
                </div>
              ) : (
                responses.map((response) => (
                  <Card key={response._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{response.responseName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              response.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {response.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {response.triggerType}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              response.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                              response.syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {response.syncStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Triggers</p>
                              <p className="font-semibold">{response.performance?.totalTriggers || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Responses</p>
                              <p className="font-semibold">{response.performance?.totalResponses || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Response Rate</p>
                              <p className="font-semibold">{response.calculatedResponseRate?.toFixed(1) || 0}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Target</p>
                              <p className="font-semibold">{response.targetAudience?.replace('_', ' ')}</p>
                            </div>
                          </div>
                          {response.keywords && response.keywords.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">Keywords: {response.keywords.join(', ')}</p>
                            </div>
                          )}
                          {response.text && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 truncate">Response: {response.text}</p>
                            </div>
                          )}
                          {response.syncError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>{response.syncError}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(response._id)}
                            disabled={syncing === response._id || response.status !== 'active'}
                          >
                            {syncing === response._id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sync className="h-4 w-4 mr-2" />
                            )}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(response)}
                            disabled={loading}
                          >
                            {response.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(response)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(response._id)}
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

export default AutoResponses
