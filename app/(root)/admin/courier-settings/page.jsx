'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_COURIER_SETTINGS } from '@/routes/AdminPanelRoute'
import { Truck, Settings, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Courier Settings' },
]

export default function CourierSettingsPage() {
    const [couriers, setCouriers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCouriers()
    }, [])

    const fetchCouriers = async () => {
        try {
            const { data } = await axios.get('/api/admin/courier/config')
            if (data.success) {
                setCouriers(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch couriers:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCourierIcon = (name) => {
        const icons = {
            'steadfast': <span className="text-blue-600 font-bold">Steadfast</span>,
            'pathao': <span className="text-red-600 font-bold">Pathao</span>,
            'redx': <span className="text-orange-600 font-bold">REDX</span>
        }
        return icons[name] || name
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-bold text-primary">Courier Settings</h4>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-gray-600 mb-6">
                        Configure courier integration settings. You can set up API credentials, enable/disable couriers, and manage delivery preferences.
                    </p>

                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading couriers...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Steadfast Card */}
                            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-blue-600 font-bold text-lg">Steadfast Courier</span>
                                    {couriers.find(c => c.courierName === 'steadfast')?.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle className="w-4 h-4" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                                            <XCircle className="w-4 h-4" /> Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Bangladesh\'s leading courier service with extensive coverage and reliable delivery.
                                </p>
                                <Link 
                                    href="/admin/courier-settings/steadfast"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configure
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Pathao Card */}
                            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-red-600 font-bold text-lg">Pathao Courier</span>
                                    {couriers.find(c => c.courierName === 'pathao')?.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle className="w-4 h-4" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                                            <XCircle className="w-4 h-4" /> Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Popular courier service with real-time tracking and fast delivery options.
                                </p>
                                <Link 
                                    href="/admin/courier-settings/pathao"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configure
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
