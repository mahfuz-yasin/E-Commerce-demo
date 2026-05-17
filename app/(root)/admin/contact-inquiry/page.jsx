'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { format } from 'date-fns'
import { IoMailOutline, IoEyeOutline, IoTrashOutline, IoReload } from 'react-icons/io5'

const statusColors = {
    pending: 'bg-yellow-500',
    read: 'bg-blue-500',
    replied: 'bg-green-500',
    resolved: 'bg-gray-500'
}

const statusLabels = {
    pending: 'Pending',
    read: 'Read',
    replied: 'Replied',
    resolved: 'Resolved'
}

const ContactInquiry = () => {
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedInquiry, setSelectedInquiry] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [reply, setReply] = useState('')
    const [sendingReply, setSendingReply] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchInquiries()
    }, [statusFilter])

    const fetchInquiries = async () => {
        setLoading(true)
        try {
            const url = statusFilter !== 'all' 
                ? `/api/admin/contact-inquiry?status=${statusFilter}` 
                : '/api/admin/contact-inquiry'
            const response = await axios.get(url)
            if (response.data.success) {
                setInquiries(response.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error)
            showToast('Failed to load inquiries', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleView = (inquiry) => {
        setSelectedInquiry(inquiry)
        setReply(inquiry.reply || '')
        setIsDialogOpen(true)
        
        // Mark as read if pending
        if (inquiry.status === 'pending') {
            updateStatus(inquiry._id, 'read')
        }
    }

    const updateStatus = async (id, status) => {
        try {
            await axios.put('/api/admin/contact-inquiry', { id, status })
            fetchInquiries()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleReply = async () => {
        if (!reply.trim()) {
            showToast('Please enter a reply', 'error')
            return
        }
        
        setSendingReply(true)
        try {
            await axios.put('/api/admin/contact-inquiry', { 
                id: selectedInquiry._id, 
                reply 
            })
            showToast('Reply saved successfully', 'success')
            setIsDialogOpen(false)
            fetchInquiries()
        } catch (error) {
            console.error('Error saving reply:', error)
            showToast('Failed to save reply', 'error')
        } finally {
            setSendingReply(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return
        
        try {
            await axios.delete('/api/admin/contact-inquiry', { data: { ids: [id] } })
            showToast('Inquiry deleted successfully', 'success')
            fetchInquiries()
        } catch (error) {
            console.error('Error deleting inquiry:', error)
            showToast('Failed to delete inquiry', 'error')
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Contact Inquiries</h1>
                <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchInquiries} variant="outline" size="icon">
                        <IoReload className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <IoMailOutline className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No inquiries found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                        <Card key={inquiry._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                                            <Badge className={`${statusColors[inquiry.status]} text-white`}>
                                                {statusLabels[inquiry.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <span className="font-medium">Email:</span> {inquiry.email}
                                        </p>
                                        {inquiry.phone && (
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Phone:</span> {inquiry.phone}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Subject:</span> {inquiry.subject}
                                        </p>
                                        <p className="text-gray-700 line-clamp-2">{inquiry.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Received: {format(new Date(inquiry.createdAt), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleView(inquiry)}
                                        >
                                            <IoEyeOutline className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(inquiry._id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <IoTrashOutline className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Inquiry Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Inquiry Details</DialogTitle>
                    </DialogHeader>
                    
                    {selectedInquiry && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-gray-900">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900">{selectedInquiry.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <p className="text-gray-900">{selectedInquiry.phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="mt-1">
                                        <Badge className={`${statusColors[selectedInquiry.status]} text-white`}>
                                            {statusLabels[selectedInquiry.status]}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600">Subject</label>
                                <p className="text-gray-900 font-medium">{selectedInquiry.subject}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600">Message</label>
                                <div className="bg-gray-50 p-4 rounded-lg mt-1">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600">Your Reply</label>
                                <Textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                            
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => updateStatus(selectedInquiry._id, 'resolved')}
                                        disabled={selectedInquiry.status === 'resolved'}
                                    >
                                        Mark as Resolved
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleReply}
                                    disabled={sendingReply || !reply.trim()}
                                >
                                    {sendingReply ? 'Saving...' : 'Save Reply'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ContactInquiry
