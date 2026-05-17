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
import { Facebook, Plus, Edit, Trash2, Play, Pause, RefreshCw, BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'A/B Testing' },
]

const AdABTesting = () => {
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [variants, setVariants] = useState([{ name: '', creative: { primaryText: '', headline: '' } }])
  
  const [formData, setFormData] = useState({
    testName: '',
    testType: 'creative',
    adAccountId: '',
    duration: 7,
    startDate: new Date().toISOString().split('T')[0],
    autoWinnerSelection: true,
    winnerCriteria: 'roas',
    minimumSampleSize: 1000,
    confidenceLevel: 95,
    status: 'draft'
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/facebook/ab-tests')
      if (data.success) {
        setTests(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch tests')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants]
    if (field === 'name') {
      newVariants[index].name = value
    } else {
      newVariants[index].creative[field] = value
    }
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', creative: { primaryText: '', headline: '' } }])
  }

  const removeVariant = (index) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = editingTest ? { ...formData, variants, _id: editingTest._id } : { ...formData, variants }
      
      const { data } = await axios.post('/api/facebook/ab-tests', payload)
      
      if (data.success) {
        showToast('success', editingTest ? 'Test updated successfully' : 'Test created successfully')
        setIsDialogOpen(false)
        setEditingTest(null)
        setFormData({
          testName: '',
          testType: 'creative',
          adAccountId: '',
          duration: 7,
          startDate: new Date().toISOString().split('T')[0],
          autoWinnerSelection: true,
          winnerCriteria: 'roas',
          minimumSampleSize: 1000,
          confidenceLevel: 95,
          status: 'draft'
        })
        setVariants([{ name: '', creative: { primaryText: '', headline: '' } }])
        fetchTests()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save test')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (test) => {
    setEditingTest(test)
    setFormData(test)
    setVariants(test.variants || [{ name: '', creative: { primaryText: '', headline: '' } }])
    setIsDialogOpen(true)
  }

  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return
    
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/facebook/ab-tests/${testId}`)
      
      if (data.success) {
        showToast('success', 'Test deleted successfully')
        fetchTests()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete test')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (test) => {
    try {
      setLoading(true)
      const newStatus = test.status === 'running' ? 'paused' : test.status === 'paused' ? 'running' : 'running'
      const { data } = await axios.put(`/api/facebook/ab-tests/${test._id}`, {
        ...test,
        status: newStatus
      })
      
      if (data.success) {
        showToast('success', `Test ${newStatus === 'running' ? 'started' : 'paused'} successfully`)
        fetchTests()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyWinner = async (testId) => {
    try {
      setLoading(true)
      const { data } = await axios.post(`/api/facebook/ab-tests/${testId}/results`)
      
      if (data.success) {
        showToast('success', 'Winner applied successfully')
        fetchTests()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to apply winner')
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
                  <p className="text-sm text-gray-600">Running Tests</p>
                  <p className="text-2xl font-bold">{tests.filter(t => t.status === 'running').length}</p>
                </div>
                <Play className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Tests</p>
                  <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Variants</p>
                  <p className="text-2xl font-bold">{tests.reduce((sum, t) => sum + (t.variants?.length || 0), 0)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg ROAS</p>
                  <p className="text-2xl font-bold">{tests.length > 0 ? (tests.reduce((sum, t) => sum + (t.results?.[0]?.roas || 0), 0) / tests.length).toFixed(2) : '0.00'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
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
                <CardTitle>A/B Testing</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchTests}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingTest(null)
                      setFormData({
                        testName: '',
                        testType: 'creative',
                        adAccountId: '',
                        duration: 7,
                        startDate: new Date().toISOString().split('T')[0],
                        autoWinnerSelection: true,
                        winnerCriteria: 'roas',
                        minimumSampleSize: 1000,
                        confidenceLevel: 95,
                        status: 'draft'
                      })
                      setVariants([{ name: '', creative: { primaryText: '', headline: '' } }])
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTest ? 'Edit A/B Test' : 'Create New A/B Test'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Test Name</Label>
                        <Input
                          value={formData.testName}
                          onChange={(e) => handleInputChange('testName', e.target.value)}
                          placeholder="Enter test name"
                        />
                      </div>
                      <div>
                        <Label>Test Type</Label>
                        <Select value={formData.testType} onValueChange={(value) => handleInputChange('testType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="audience">Audience</SelectItem>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="placement">Placement</SelectItem>
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
                      <div>
                        <Label>Duration (days)</Label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                          placeholder="7"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-semibold">Variants</h3>
                        {variants.map((variant, index) => (
                          <div key={index} className="space-y-2 p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label>Variant {index + 1} Name</Label>
                              {variants.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                              placeholder="Enter variant name"
                            />
                            <Input
                              value={variant.creative.primaryText}
                              onChange={(e) => handleVariantChange(index, 'primaryText', e.target.value)}
                              placeholder="Primary text"
                            />
                            <Input
                              value={variant.creative.headline}
                              onChange={(e) => handleVariantChange(index, 'headline', e.target.value)}
                              placeholder="Headline"
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addVariant}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <Label>Auto Winner Selection</Label>
                          <Switch
                            checked={formData.autoWinnerSelection}
                            onCheckedChange={(checked) => handleInputChange('autoWinnerSelection', checked)}
                          />
                        </div>
                        <div>
                          <Label>Winner Criteria</Label>
                          <Select value={formData.winnerCriteria} onValueChange={(value) => handleInputChange('winnerCriteria', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="roas">ROAS</SelectItem>
                              <SelectItem value="cpa">CPA</SelectItem>
                              <SelectItem value="ctr">CTR</SelectItem>
                              <SelectItem value="conversions">Conversions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Minimum Sample Size</Label>
                          <Input
                            type="number"
                            value={formData.minimumSampleSize}
                            onChange={(e) => handleInputChange('minimumSampleSize', parseInt(e.target.value))}
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <Label>Confidence Level (%)</Label>
                          <Input
                            type="number"
                            value={formData.confidenceLevel}
                            onChange={(e) => handleInputChange('confidenceLevel', parseInt(e.target.value))}
                            placeholder="95"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <ButtonLoading loading={loading} onClick={handleSubmit} text="Save Test" />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No A/B tests found. Create your first test to get started.</p>
                </div>
              ) : (
                tests.map((test) => (
                  <Card key={test._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{test.testName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              test.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              test.status === 'completed' ? 'bg-green-100 text-green-800' :
                              test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {test.status}
                            </span>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {test.testType}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Variants</p>
                              <p className="font-semibold">{test.variants?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Duration</p>
                              <p className="font-semibold">{test.duration} days</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Impressions</p>
                              <p className="font-semibold">{test.totalImpressions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Conversions</p>
                              <p className="font-semibold">{test.totalConversions || 0}</p>
                            </div>
                          </div>
                          {test.winner && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-800">
                                Winner: {test.winner.variantName} ({test.winner.reason})
                              </span>
                              {!test.winner.applied && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApplyWinner(test._id)}
                                  disabled={loading}
                                >
                                  Apply
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(test)}
                            disabled={loading || test.status === 'completed'}
                          >
                            {test.status === 'running' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(test)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(test._id)}
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

export default AdABTesting
