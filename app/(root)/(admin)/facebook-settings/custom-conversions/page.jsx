'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Plus, Trash2, Edit, Clock, Target, Link, MousePointer2, Eye } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Custom Conversions' },
]

const FacebookCustomConversions = () => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [conversions, setConversions] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConversion, setEditingConversion] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    eventName: '',
    ruleType: 'url_pattern',
    ruleValue: '',
    ruleValueNumber: 30,
    status: 'active'
  })

  useEffect(() => {
    fetchConversions()
  }, [])

  const fetchConversions = async () => {
    try {
      setFetching(true)
      const { data } = await axios.get('/api/custom-conversions')
      if (data.success) {
        setConversions(data.data)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch conversions')
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      if (editingConversion) {
        const { data } = await axios.put(`/api/custom-conversions/${editingConversion._id}`, formData)
        if (data.success) {
          showToast('success', data.message)
        }
      } else {
        const { data } = await axios.post('/api/custom-conversions', formData)
        if (data.success) {
          showToast('success', data.message)
        }
      }
      setIsDialogOpen(false)
      resetForm()
      fetchConversions()
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save conversion')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const { data } = await axios.delete(`/api/custom-conversions/${id}`)
      if (data.success) {
        showToast('success', data.message)
        fetchConversions()
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to delete conversion')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (conversion) => {
    setEditingConversion(conversion)
    setFormData({
      name: conversion.name,
      eventName: conversion.eventName,
      ruleType: conversion.ruleType,
      ruleValue: conversion.ruleValue,
      ruleValueNumber: conversion.ruleValueNumber || 30,
      status: conversion.status
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      eventName: '',
      ruleType: 'url_pattern',
      ruleValue: '',
      ruleValueNumber: 30,
      status: 'active'
    })
    setEditingConversion(null)
  }

  const getRuleIcon = (ruleType) => {
    switch (ruleType) {
      case 'url_pattern':
        return <Link className="h-4 w-4" />
      case 'time_on_page':
        return <Clock className="h-4 w-4" />
      case 'scroll_depth':
        return <Eye className="h-4 w-4" />
      case 'element_click':
        return <MousePointer2 className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getRuleDescription = (conversion) => {
    switch (conversion.ruleType) {
      case 'url_pattern':
        return `URL matches: ${conversion.ruleValue}`
      case 'time_on_page':
        return `Time on page > ${conversion.ruleValueNumber}s`
      case 'scroll_depth':
        return `Scroll depth > ${conversion.ruleValueNumber}%`
      case 'element_click':
        return `Click on element: ${conversion.ruleValue}`
      default:
        return conversion.ruleValue
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <CardTitle>Custom Conversion Rules</CardTitle>
            </div>
            <div className="flex gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingConversion ? 'Edit Conversion Rule' : 'Create Conversion Rule'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input
                        placeholder="Product View Complete"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Event Name (Facebook CAPI)</Label>
                      <Input
                        placeholder="ProductView_Complete"
                        value={formData.eventName}
                        onChange={(e) => handleInputChange('eventName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rule Type</Label>
                      <Select
                        value={formData.ruleType}
                        onValueChange={(value) => handleInputChange('ruleType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="url_pattern">URL Pattern</SelectItem>
                          <SelectItem value="time_on_page">Time on Page</SelectItem>
                          <SelectItem value="scroll_depth">Scroll Depth</SelectItem>
                          <SelectItem value="element_click">Element Click</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.ruleType === 'url_pattern' && (
                      <div className="space-y-2">
                        <Label>URL Pattern</Label>
                        <Input
                          placeholder="/product/*"
                          value={formData.ruleValue}
                          onChange={(e) => handleInputChange('ruleValue', e.target.value)}
                        />
                      </div>
                    )}

                    {formData.ruleType === 'time_on_page' && (
                      <div className="space-y-2">
                        <Label>Time (seconds)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.ruleValueNumber}
                          onChange={(e) => handleInputChange('ruleValueNumber', parseInt(e.target.value) || 30)}
                        />
                      </div>
                    )}

                    {formData.ruleType === 'scroll_depth' && (
                      <div className="space-y-2">
                        <Label>Scroll Depth (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.ruleValueNumber}
                          onChange={(e) => handleInputChange('ruleValueNumber', parseInt(e.target.value) || 50)}
                        />
                      </div>
                    )}

                    {formData.ruleType === 'element_click' && (
                      <div className="space-y-2">
                        <Label>CSS Selector</Label>
                        <Input
                          placeholder=".add-to-cart-button"
                          value={formData.ruleValue}
                          onChange={(e) => handleInputChange('ruleValue', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="status">Active</Label>
                      <Switch
                        id="status"
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <ButtonLoading loading={loading} text="Save" className="cursor-pointer" onClick={handleSave} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <ButtonLoading
                loading={fetching}
                text="Refresh"
                className="cursor-pointer"
                onClick={fetchConversions}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {conversions.length === 0 ? (
            <div className="text-center py-10">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No custom conversion rules found. Create your first rule to track custom events.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <div key={conversion._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getRuleIcon(conversion.ruleType)}
                    </div>
                    <div>
                      <h3 className="font-medium">{conversion.name}</h3>
                      <p className="text-sm text-gray-600">{conversion.eventName}</p>
                      <p className="text-xs text-gray-500 mt-1">{getRuleDescription(conversion)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${conversion.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {conversion.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(conversion)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(conversion._id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FacebookCustomConversions
