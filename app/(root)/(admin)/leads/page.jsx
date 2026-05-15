'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Users, Download, Filter, Calendar, Search, Phone, Mail, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react'
import ButtonLoading from '@/components/Application/ButtonLoading'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Leads' },
]

const LeadsDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, filters])

  const fetchLeads = async () => {
    try {
      setFetching(true)
      const { data } = await axios.get('/api/leads')
      if (data.success) {
        setLeads(data.data)
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch leads')
    } finally {
      setFetching(false)
    }
  }

  const filterLeads = () => {
    let filtered = [...leads]

    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status)
    }

    if (filters.dateRange !== 'all') {
      const now = new Date()
      const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90
      const cutoff = new Date(now - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(lead => new Date(lead.createdAt) >= cutoff)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.fullName?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.phone?.includes(search) ||
        lead.formName?.toLowerCase().includes(search)
      )
    }

    setFilteredLeads(filtered)
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setLoading(true)
      const { data } = await axios.put(`/api/leads/${leadId}`, { status: newStatus })
      if (data.success) {
        showToast('success', data.message)
        await fetchLeads()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update lead status')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      setLoading(true)
      const { data } = await axios.put(`/api/leads/${selectedLead._id}`, { notes })
      if (data.success) {
        showToast('success', data.message)
        setIsNotesDialogOpen(false)
        setNotes('')
        await fetchLeads()
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save notes')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Form', 'Status', 'Date']
    const rows = filteredLeads.map(lead => [
      lead.fullName || 'N/A',
      lead.email || 'N/A',
      lead.phone || 'N/A',
      lead.formName || 'N/A',
      lead.status,
      new Date(lead.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'contacted':
        return <Phone className="h-4 w-4 text-orange-600" />
      case 'converted':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-orange-100 text-orange-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <CardTitle>Leads Dashboard</CardTitle>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <ButtonLoading
                loading={fetching}
                text="Refresh"
                className="cursor-pointer"
                onClick={fetchLeads}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center justify-end">
              {filteredLeads.length} leads
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found. Configure Lead Ads in Facebook Settings to start collecting leads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium">Form</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium">{lead.fullName || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{lead.email || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{lead.phone || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{lead.formName || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                          {getStatusIcon(lead.status)}
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead)
                              setIsDetailsDialogOpen(true)
                            }}
                          >
                            View
                          </Button>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => handleStatusChange(lead._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Full Name</Label>
                  <p className="font-medium">{selectedLead.fullName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <p className="font-medium">{selectedLead.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedLead.status)}`}>
                    {getStatusIcon(selectedLead.status)}
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </span>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Form Name</Label>
                  <p className="font-medium">{selectedLead.formName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Date</Label>
                  <p className="font-medium">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedLead.customFields && Object.keys(selectedLead.customFields).length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Custom Fields</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedLead.customFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Notes</Label>
                  <p className="text-sm bg-gray-50 p-4 rounded-lg">{selectedLead.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setNotes(selectedLead.notes || '')
                  setIsNotesDialogOpen(true)
                }}
                className="w-full"
              >
                {selectedLead.notes ? 'Edit Notes' : 'Add Notes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                placeholder="Enter notes about this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-32 px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <ButtonLoading
              loading={loading}
              text="Save Notes"
              className="cursor-pointer"
              onClick={handleSaveNotes}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeadsDashboard
