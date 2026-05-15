'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Play, Pause, RefreshCw, DollarSign, TrendingUp, Activity, AlertCircle } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Ad Campaign Manager' },
]

const FacebookCampaignManager = () => {
  const [loading, setLoading] = useState(false)
  const [fetchingCampaigns, setFetchingCampaigns] = useState(false)
  const [updatingCampaign, setUpdatingCampaign] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [filterStatus, setFilterStatus] = useState('ACTIVE')
  const [editBudgetId, setEditBudgetId] = useState(null)
  const [budgetValue, setBudgetValue] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [rules, setRules] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [ruleForm, setRuleForm] = useState({
    name: '',
    conditions: [{ type: 'spend', operator: '>', value: 0, timeRange: '24h' }],
    actions: [{ type: 'pause_campaign', budgetPercentage: 15 }],
    applyToAll: true
  })
  const [config, setConfig] = useState({
    adCampaignManagerEnabled: false,
    adAccountAccessToken: '',
    adRulesEnabled: false,
    adRulesCheckInterval: 3,
    advantageCreativeSync: false
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    if (config.adRulesEnabled && showRules) {
      fetchRules()
    }
  }, [config.adRulesEnabled, showRules])

  useEffect(() => {
    if (config.adCampaignManagerEnabled) {
      fetchCampaigns()
    }
  }, [config.adCampaignManagerEnabled, filterStatus])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/facebook-settings')
      if (data.success) {
        setConfig({
          adCampaignManagerEnabled: data.data.adCampaignManagerEnabled || false,
          adAccountAccessToken: data.data.adAccountAccessToken || '',
          adRulesEnabled: data.data.adRulesEnabled || false,
          adRulesCheckInterval: data.data.adRulesCheckInterval || 3,
          advantageCreativeSync: data.data.advantageCreativeSync || false
        })
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch config')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      setFetchingCampaigns(true)
      const { data } = await axios.get(`/api/facebook/campaigns?status=${filterStatus}`)
      if (data.success) {
        setCampaigns(data.data.data || [])
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch campaigns')
    } finally {
      setFetchingCampaigns(false)
    }
  }

  const handleToggleCampaign = async (campaignId, currentStatus) => {
    try {
      setUpdatingCampaign(campaignId)
      const action = currentStatus === 'ACTIVE' ? 'pause' : 'activate'
      const { data } = await axios.put('/api/facebook/campaigns', {
        campaignId,
        action
      })
      if (data.success) {
        showToast('success', `Campaign ${action}d successfully`)
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update campaign')
    } finally {
      setUpdatingCampaign(null)
    }
  }

  const handleUpdateBudget = async (campaignId) => {
    try {
      setUpdatingCampaign(campaignId)
      const { data } = await axios.put('/api/facebook/campaigns', {
        campaignId,
        budgetData: {
          daily_budget: parseFloat(budgetValue)
        }
      })
      if (data.success) {
        showToast('success', 'Budget updated successfully')
        setEditBudgetId(null)
        setBudgetValue('')
        fetchCampaigns()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update budget')
    } finally {
      setUpdatingCampaign(null)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/facebook-settings', config)
      if (data.success) {
        showToast('success', 'Configuration saved successfully')
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save config')
    } finally {
      setLoading(false)
    }
  }

  const fetchRules = async () => {
    try {
      const { data } = await axios.get('/api/facebook/automation-rules')
      if (data.success) {
        setRules(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch rules')
    }
  }

  const handleSaveRule = async () => {
    try {
      setLoading(true)
      const endpoint = editingRule ? `/api/facebook/automation-rules/${editingRule._id}` : '/api/facebook/automation-rules'
      const method = editingRule ? 'PUT' : 'POST'
      const { data } = await axios[method](endpoint, ruleForm)
      if (data.success) {
        showToast('success', `Rule ${editingRule ? 'updated' : 'created'} successfully`)
        setEditingRule(null)
        setRuleForm({
          name: '',
          conditions: [{ type: 'spend', operator: '>', value: 0, timeRange: '24h' }],
          actions: [{ type: 'pause_campaign', budgetPercentage: 15 }],
          applyToAll: true
        })
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRule = async (ruleId) => {
    try {
      const { data } = await axios.delete(`/api/facebook/automation-rules/${ruleId}`)
      if (data.success) {
        showToast('success', 'Rule deleted successfully')
        fetchRules()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete rule')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Ad Campaign Manager</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Ad Campaign Manager</Label>
                <p className="text-sm text-gray-600">Control Facebook Ads directly from this panel</p>
              </div>
              <Switch
                checked={config.adCampaignManagerEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, adCampaignManagerEnabled: checked }))}
              />
            </div>

            {config.adCampaignManagerEnabled && (
              <>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="adAccountAccessToken">Ad Account Access Token</Label>
                  <Input
                    id="adAccountAccessToken"
                    type="password"
                    placeholder="Enter Meta Marketing API access token"
                    value={config.adAccountAccessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, adAccountAccessToken: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Automated Rules Engine</Label>
                    <p className="text-sm text-gray-600">Auto-adjust campaigns based on performance</p>
                  </div>
                  <Switch
                    checked={config.adRulesEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, adRulesEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Advantage+ Creative Sync</Label>
                    <p className="text-sm text-gray-600">Auto-update ad creatives on product changes</p>
                  </div>
                  <Switch
                    checked={config.advantageCreativeSync}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, advantageCreativeSync: checked }))}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="adRulesCheckInterval">Rules Check Interval (hours)</Label>
                  <Input
                    id="adRulesCheckInterval"
                    type="number"
                    min="1"
                    max="24"
                    value={config.adRulesCheckInterval}
                    onChange={(e) => setConfig(prev => ({ ...prev, adRulesCheckInterval: parseInt(e.target.value) }))}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t">
              <ButtonLoading loading={loading} text="Save Configuration" className="cursor-pointer" onClick={handleSaveConfig} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Dashboard */}
      {config.adCampaignManagerEnabled && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campaigns</CardTitle>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <ButtonLoading
                    loading={fetchingCampaigns}
                    text="Refresh"
                    className="cursor-pointer"
                    onClick={fetchCampaigns}
                    icon={<RefreshCw className="h-4 w-4 mr-2" />}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No campaigns found for the selected status
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.effective_status)}`}>
                              {campaign.effective_status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Objective</p>
                              <p className="font-medium">{campaign.objective}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Daily Budget</p>
                              <p className="font-medium">{campaign.daily_budget ? formatCurrency(campaign.daily_budget) : 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Status</p>
                              <p className="font-medium">{campaign.status}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Created</p>
                              <p className="font-medium">{new Date(campaign.created_time).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant={campaign.effective_status === 'ACTIVE' ? 'destructive' : 'default'}
                            disabled={updatingCampaign === campaign.id}
                            onClick={() => handleToggleCampaign(campaign.id, campaign.effective_status)}
                            className="cursor-pointer"
                          >
                            {updatingCampaign === campaign.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : campaign.effective_status === 'ACTIVE' ? (
                              <><Pause className="h-4 w-4 mr-2" /> Pause</>
                            ) : (
                              <><Play className="h-4 w-4 mr-2" /> Activate</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditBudgetId(campaign.id)}
                            className="cursor-pointer"
                          >
                            <DollarSign className="h-4 w-4 mr-2" /> Budget
                          </Button>
                        </div>
                      </div>

                      {editBudgetId === campaign.id && (
                        <div className="mt-4 pt-4 border-t flex gap-3">
                          <Input
                            type="number"
                            placeholder="Enter new daily budget (BDT)"
                            value={budgetValue}
                            onChange={(e) => setBudgetValue(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleUpdateBudget(campaign.id)}
                            disabled={updatingCampaign === campaign.id || !budgetValue}
                            className="cursor-pointer"
                          >
                            {updatingCampaign === campaign.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              'Update'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditBudgetId(null)
                              setBudgetValue('')
                            }}
                            className="cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automation Rules */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Automated Rules Engine</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowRules(!showRules)}
                  className="cursor-pointer"
                >
                  {showRules ? 'Hide' : 'Show'} Rules
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showRules && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Automatically adjust campaigns based on performance metrics
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingRule(null)
                        setRuleForm({
                          name: '',
                          conditions: [{ type: 'spend', operator: '>', value: 0, timeRange: '24h' }],
                          actions: [{ type: 'pause_campaign', budgetPercentage: 15 }],
                          applyToAll: true
                        })
                      }}
                      className="cursor-pointer"
                    >
                      + Add Rule
                    </Button>
                  </div>

                  {rules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No automation rules configured
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.map((rule) => (
                        <div key={rule._id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{rule.name}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <div>Conditions: {rule.conditions.map(c => `${c.type} ${c.operator} ${c.value} (${c.timeRange})`).join(', ')}</div>
                                <div>Actions: {rule.actions.map(a => a.type).join(', ')}</div>
                                <div>Last executed: {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleString() : 'Never'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingRule(rule)
                                  setRuleForm(rule)
                                }}
                                className="cursor-pointer"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRule(rule._id)}
                                className="cursor-pointer"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rule Form */}
                  {(editingRule || !rules.length) && (
                    <div className="border rounded-lg p-4 mt-4 bg-gray-50">
                      <h4 className="font-semibold mb-4">{editingRule ? 'Edit Rule' : 'Create New Rule'}</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>Rule Name</Label>
                          <Input
                            value={ruleForm.name}
                            onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Pause high spend ads"
                          />
                        </div>

                        <div>
                          <Label>Conditions</Label>
                          {ruleForm.conditions.map((condition, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                              <select
                                value={condition.type}
                                onChange={(e) => {
                                  const newConditions = [...ruleForm.conditions]
                                  newConditions[idx].type = e.target.value
                                  setRuleForm(prev => ({ ...prev, conditions: newConditions }))
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="spend">Spend</option>
                                <option value="roas">ROAS</option>
                                <option value="purchases">Purchases</option>
                                <option value="clicks">Clicks</option>
                                <option value="impressions">Impressions</option>
                                <option value="ctr">CTR</option>
                                <option value="cpc">CPC</option>
                              </select>
                              <select
                                value={condition.operator}
                                onChange={(e) => {
                                  const newConditions = [...ruleForm.conditions]
                                  newConditions[idx].operator = e.target.value
                                  setRuleForm(prev => ({ ...prev, conditions: newConditions }))
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value=">">Greater than</option>
                                <option value="<">Less than</option>
                                <option value=">=">Greater or equal</option>
                                <option value="<=">Less or equal</option>
                                <option value="==">Equals</option>
                                <option value="!=">Not equals</option>
                              </select>
                              <Input
                                type="number"
                                value={condition.value}
                                onChange={(e) => {
                                  const newConditions = [...ruleForm.conditions]
                                  newConditions[idx].value = parseFloat(e.target.value)
                                  setRuleForm(prev => ({ ...prev, conditions: newConditions }))
                                }}
                                className="w-24"
                              />
                              <select
                                value={condition.timeRange}
                                onChange={(e) => {
                                  const newConditions = [...ruleForm.conditions]
                                  newConditions[idx].timeRange = e.target.value
                                  setRuleForm(prev => ({ ...prev, conditions: newConditions }))
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="1h">Last 1 hour</option>
                                <option value="3h">Last 3 hours</option>
                                <option value="6h">Last 6 hours</option>
                                <option value="12h">Last 12 hours</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="3d">Last 3 days</option>
                                <option value="7d">Last 7 days</option>
                              </select>
                              {ruleForm.conditions.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const newConditions = ruleForm.conditions.filter((_, i) => i !== idx)
                                    setRuleForm(prev => ({ ...prev, conditions: newConditions }))
                                  }}
                                  className="cursor-pointer"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRuleForm(prev => ({ ...prev, conditions: [...prev.conditions, { type: 'spend', operator: '>', value: 0, timeRange: '24h' }] }))}
                            className="cursor-pointer"
                          >
                            + Add Condition
                          </Button>
                        </div>

                        <div>
                          <Label>Actions</Label>
                          {ruleForm.actions.map((action, idx) => (
                            <div key={idx} className="flex gap-2 mt-2">
                              <select
                                value={action.type}
                                onChange={(e) => {
                                  const newActions = [...ruleForm.actions]
                                  newActions[idx].type = e.target.value
                                  setRuleForm(prev => ({ ...prev, actions: newActions }))
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="pause_campaign">Pause Campaign</option>
                                <option value="pause_adset">Pause Ad Set</option>
                                <option value="increase_budget">Increase Budget</option>
                                <option value="decrease_budget">Decrease Budget</option>
                                <option value="send_alert">Send Alert</option>
                              </select>
                              {(action.type === 'increase_budget' || action.type === 'decrease_budget') && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={action.budgetPercentage || 15}
                                    onChange={(e) => {
                                      const newActions = [...ruleForm.actions]
                                      newActions[idx].budgetPercentage = parseFloat(e.target.value)
                                      setRuleForm(prev => ({ ...prev, actions: newActions }))
                                    }}
                                    className="w-24"
                                    placeholder="%"
                                  />
                                  <span className="text-sm text-gray-600">%</span>
                                </div>
                              )}
                              {ruleForm.actions.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const newActions = ruleForm.actions.filter((_, i) => i !== idx)
                                    setRuleForm(prev => ({ ...prev, actions: newActions }))
                                  }}
                                  className="cursor-pointer"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRuleForm(prev => ({ ...prev, actions: [...prev.actions, { type: 'pause_campaign', budgetPercentage: 15 }] }))}
                            className="cursor-pointer"
                          >
                            + Add Action
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ruleForm.applyToAll}
                            onCheckedChange={(checked) => setRuleForm(prev => ({ ...prev, applyToAll: checked }))}
                          />
                          <Label>Apply to all campaigns</Label>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={handleSaveRule}
                            className="cursor-pointer"
                          >
                            {editingRule ? 'Update' : 'Create'} Rule
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingRule(null)
                              setRuleForm({
                                name: '',
                                conditions: [{ type: 'spend', operator: '>', value: 0, timeRange: '24h' }],
                                actions: [{ type: 'pause_campaign', budgetPercentage: 15 }],
                                applyToAll: true
                              })
                            }}
                            className="cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default FacebookCampaignManager
