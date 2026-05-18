'use client'
import { useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import ButtonLoading from '../ButtonLoading'
import { Truck, Package, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react'

const courierOptions = [
    { value: 'steadfast', label: 'Steadfast Courier', color: 'bg-blue-500' },
    { value: 'pathao', label: 'Pathao', color: 'bg-red-500' },
    { value: 'redx', label: 'REDX', color: 'bg-orange-500' }
]

export default function CourierIntegration({ order, onUpdate }) {
    const [selectedCourier, setSelectedCourier] = useState('steadfast')
    const [creating, setCreating] = useState(false)
    const [tracking, setTracking] = useState(false)
    const [courierInfo, setCourierInfo] = useState(order?.courierInfo || null)

    const handleCreateConsignment = async () => {
        if (selectedCourier !== 'steadfast') {
            showToast('error', 'Currently only Steadfast Courier is supported')
            return
        }

        setCreating(true)
        try {
            const { data: response } = await axios.post('/api/courier/steadfast/create', {
                orderId: order.order_id
            })

            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)
            setCourierInfo(response.data.order.courierInfo)
            
            // Update parent component
            if (onUpdate) {
                onUpdate(response.data.order)
            }

        } catch (error) {
            console.error('Create consignment error:', error)
            showToast('error', error.message || 'Failed to create consignment')
        } finally {
            setCreating(false)
        }
    }

    const handleTrackConsignment = async () => {
        setTracking(true)
        try {
            const { data: response } = await axios.post('/api/courier/steadfast/track', {
                orderId: order.order_id
            })

            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', 'Tracking information updated')
            setCourierInfo(response.data.order.courierInfo)
            
            // Update parent component
            if (onUpdate) {
                onUpdate(response.data.order)
            }

        } catch (error) {
            console.error('Track consignment error:', error)
            showToast('error', error.message || 'Failed to track consignment')
        } finally {
            setTracking(false)
        }
    }

    const openSteadfastTracking = () => {
        if (courierInfo?.trackingCode) {
            window.open(`https://steadfast.com.bd/track/${courierInfo.trackingCode}`, '_blank')
        }
    }

    // Status badge color
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'picked_up': 'bg-blue-100 text-blue-800',
            'in_transit': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'returned': 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Courier Integration</h3>
                </div>
            </div>

            <div className="p-4">
                {/* No Courier Assigned */}
                {!courierInfo?.courierName ? (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                            <p className="mb-2">Assign this order to a courier:</p>
                            <div className="bg-blue-50 p-3 rounded-md text-sm">
                                <p className="font-medium text-blue-800">Customer Details:</p>
                                <p><span className="font-medium">Name:</span> {order?.name}</p>
                                <p><span className="font-medium">Phone:</span> {order?.phone}</p>
                                <p><span className="font-medium">Address:</span> {order?.address}</p>
                                <p><span className="font-medium">COD Amount:</span> ৳{order?.totalAmount}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Courier
                            </label>
                            <select
                                value={selectedCourier}
                                onChange={(e) => setSelectedCourier(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {courierOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <ButtonLoading
                            type="button"
                            loading={creating}
                            onClick={handleCreateConsignment}
                            text="Create Consignment"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        />
                    </div>
                ) : (
                    /* Courier Assigned */
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-gray-800">
                                Assigned to {courierInfo.courierName === 'steadfast' ? 'Steadfast Courier' : courierInfo.courierName}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Tracking Code:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium text-blue-600">
                                        {courierInfo.trackingCode}
                                    </span>
                                    <button
                                        onClick={openSteadfastTracking}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Open in Steadfast"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {courierInfo.consignmentId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Consignment ID:</span>
                                    <span className="font-medium">{courierInfo.consignmentId}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(courierInfo.status)}`}>
                                    {courierInfo.status?.replace('_', ' ')?.toUpperCase()}
                                </span>
                            </div>

                            {courierInfo.createdAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Created:</span>
                                    <span className="text-sm">
                                        {new Date(courierInfo.createdAt).toLocaleDateString('bn-BD')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <ButtonLoading
                            type="button"
                            loading={tracking}
                            onClick={handleTrackConsignment}
                            text="Update Tracking Status"
                            className="w-full bg-green-600 hover:bg-green-700"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
