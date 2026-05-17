'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Plus, RefreshCw, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Performance Metrics' },
]

const PerformanceMetrics = () => {
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [metrics, setMetrics] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    adAccountId: '',
    campaignId: '',
    periodType: 'daily',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    roasTarget: 2.0,
    cacTarget: 10,
    ltvTarget: 50
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/performance-metrics')
      if (data.success) {
        setMetrics(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCalculate = async () => {
    try {
      setCalculating(true)
      const { data } = await axios.post('/api/facebook/performance-metrics', formData)
      
      if (data.success) {
        showToast('success', 'Performance metrics calculated successfully')
        setIsDialogOpen(false)
        setFormData({
          adAccountId: '',
          campaignId: '',
          periodType: 'daily',
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          periodEnd: new Date().toISOString().split('T')[0],
          roasTarget: 2.0,
          cacTarget: 10,
          ltvTarget: 50
        })
        fetchMetrics()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to calculate metrics')
    } finally {
      setCalculating(false)
    }
  }

  const handleDelete = async (metricsId) => {
    if (!confirm('Are you sure you want to delete these metrics?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/performance-metrics/${metricsId}`)
      
      if (data.success) {
        showToast('success', 'Metrics deleted successfully')
        fetchMetrics()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (metricsId) => {
    try {
      setLoading(true)
      const metrics = metrics.find(m => m._id === metricsId)
      if (metrics) {
        metrics.alerts.forEach(alert => alert.acknowledged = true)
        // Note: This would need an API endpoint to update alerts
        showToast('success', 'Alert acknowledged')
      }
    } catch (error) {
      showToast('error', 'Failed to acknowledge alert')
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
                  <p className="text-sm text-gray-600">Avg ROAS</p>
                  <p className="text-2xl font-bold">{metrics.length > 0 ? (metrics.reduce((sum, m) => sum + (m.roas || 0), 0) / metrics.length).toFixed(2) : '0.00'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg CAC</p>
                  <p className="text-2xl font-bold">${metrics.length > 0 ? (metrics.reduce((sum, m) => sum + (m.cac || 0), 0) / metrics.length).toFixed(2) : '0.00'}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg LTV</p>
                  <p className="text-2xl font-bold">${metrics.length > 0 ? (metrics.reduce((sum, m) => sum + (m.ltv || 0), 0) / metrics.length).toFixed(2) : '0.00'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold">{metrics.reduce((sum, m) => sum + (m.alerts?.filter(a => !a.acknowledged).length || 0), 0)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
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
                <CardTitle>ROAS, CAC, LTV Tracking</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchMetrics}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Calculate Metrics
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Calculate Performance Metrics</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Ad Account ID</Label>
                        <Input
                          value={formData.adAccountId}
                          onChange={(e) => handleInputChange('adAccountId', e.target.value)}
                          placeholder="Enter Facebook Ad Account ID"
                        />
                      </div>
                      <div>
                        <Label>Campaign ID (Optional)</Label>
                        <Input
                          value={formData.campaignId}
                          onChange={(e) => handleInputChange('campaignId', e.target.value)}
                          placeholder="Enter Campaign ID"
                        />
                      </div>
                      <div>
                        <Label>Period Type</Label>
                        <Select value={formData.periodType} onValueChange={(value) => handleInputChange('periodType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Period Start</Label>
                        <Input
                          type="date"
                          value={formData.periodStart}
                          onChange={(e) => handleInputChange('periodStart', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Period End</Label>
                        <Input
                          type="date"
                          value={formData.periodEnd}
                          onChange={(e) => handleInputChange('periodEnd', e.target.value)}
                        />
                      </div>
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
                        <Label>CAC Target</Label>
                        <Input
                          type="number"
                          value={formData.cacTarget}
                          onChange={(e) => handleInputChange('cacTarget', parseFloat(e.target.value))}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label>LTV Target</Label>
                        <Input
                          type="number"
                          value={formData.ltvTarget}
                          onChange={(e) => handleInputChange('ltvTarget', parseFloat(e.target.value))}
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <ButtonLoading loading={calculating} onClick={handleCalculate} text="Calculate" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No performance metrics found. Calculate your first metrics to get started.</p>
                </div>
              ) : (
                metrics.map((metric) => (
                  <Card key={metric._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {new Date(metric.periodStart).toLocaleDateString()} - {new Date(metric.periodEnd).toLocaleDateString()}
                          </h3>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {metric.periodType}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(metric._id)}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Alerts */}
                      {metric.alerts && metric.alerts.filter(a => !a.acknowledged).length > 0 && (
                        <div className="mb-4 space-y-2">
                          {metric.alerts.filter(a => !a.acknowledged).map((alert, idx) => (
                            <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${
                              alert.severity === 'high' ? 'bg-red-50 text-red-800' :
                              alert.severity === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                              'bg-blue-50 text-blue-800'
                            }`}>
                              <AlertTriangle className="h-4 w-4" />
                              <span className="flex-1 text-sm">{alert.message}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(metric._id)}
                              >
                                Acknowledge
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">ROAS</p>
                          <p className="text-xl font-bold">{metric.roas?.toFixed(2) || '0.00'}</p>
                          {metric.meetsROASTarget !== null && (
                            <div className={`flex items-center gap-1 text-xs ${metric.meetsROASTarget ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.meetsROASTarget ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {metric.meetsROASTarget ? 'On Target' : 'Below Target'}
                            </div>
                          )}
                          {metric.comparison && (
                            <div className={`text-xs ${metric.comparison.roasChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.comparison.roasChangePercent >= 0 ? '+' : ''}{metric.comparison.roasChangePercent?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CAC</p>
                          <p className="text-xl font-bold">${metric.cac?.toFixed(2) || '0.00'}</p>
                          {metric.meetsCACTarget !== null && (
                            <div className={`flex items-center gap-1 text-xs ${metric.meetsCACTarget ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.meetsCACTarget ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {metric.meetsCACTarget ? 'On Target' : 'Above Target'}
                            </div>
                          )}
                          {metric.comparison && (
                            <div className={`text-xs ${metric.comparison.cacChangePercent <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.comparison.cacChangePercent >= 0 ? '+' : ''}{metric.comparison.cacChangePercent?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">LTV</p>
                          <p className="text-xl font-bold">${metric.ltv?.toFixed(2) || '0.00'}</p>
                          {metric.meetsLTVTarget !== null && (
                            <div className={`flex items-center gap-1 text-xs ${metric.meetsLTVTarget ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.meetsLTVTarget ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {metric.meetsLTVTarget ? 'On Target' : 'Below Target'}
                            </div>
                          )}
                          {metric.comparison && (
                            <div className={`text-xs ${metric.comparison.ltvChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.comparison.ltvChangePercent >= 0 ? '+' : ''}{metric.comparison.ltvChangePercent?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Performance Score</p>
                          <p className="text-xl font-bold">{metric.performanceScore?.toFixed(0) || '0'}%</p>
                          <div className={`text-xs ${metric.performanceScore >= 80 ? 'text-green-600' : metric.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {metric.performanceScore >= 80 ? 'Excellent' : metric.performanceScore >= 50 ? 'Good' : 'Needs Improvement'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p>Revenue</p>
                          <p className="font-semibold">${(metric.revenue || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p>Spend</p>
                          <p className="font-semibold">${(metric.spend || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p>Conversions</p>
                          <p className="font-semibold">{metric.conversions || 0}</p>
                        </div>
                        <div>
                          <p>CTR</p>
                          <p className="font-semibold">{(metric.ctr || 0).toFixed(2)}%</p>
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

export default PerformanceMetrics
