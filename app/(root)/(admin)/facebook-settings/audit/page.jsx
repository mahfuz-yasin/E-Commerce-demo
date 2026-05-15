'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, CheckCircle2, XCircle, AlertCircle, RefreshCw, Activity, Database, Globe, ShoppingBag } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'System Audit' },
]

const FacebookAudit = () => {
  const [loading, setLoading] = useState(false)
  const [diagnosing, setDiagnosing] = useState(false)
  const [statusData, setStatusData] = useState({
    pixel: { status: 'unknown', message: 'Not checked' },
    capi: { status: 'unknown', message: 'Not checked' },
    businessManager: { status: 'unknown', message: 'Not checked' },
    catalog: { status: 'unknown', message: 'Not checked' },
    messenger: { status: 'unknown', message: 'Not checked' },
    leadAds: { status: 'unknown', message: 'Not checked' },
    webhooks: { status: 'unknown', message: 'Not checked' }
  })

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    try {
      setDiagnosing(true)
      const { data } = await axios.post('/api/facebook/audit/diagnostics')
      if (data.success) {
        setStatusData(data.data)
        showToast('success', 'Diagnostics completed successfully')
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to run diagnostics')
    } finally {
      setDiagnosing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return 'Healthy'
      case 'warning':
        return 'Warning'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
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
              <CardTitle>Facebook Integration Audit</CardTitle>
            </div>
            <div className="flex gap-3">
              <ButtonLoading
                loading={diagnosing}
                text="Run Full Diagnostic"
                className="cursor-pointer"
                onClick={runDiagnostics}
                icon={<RefreshCw className="h-4 w-4 mr-2" />}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pixel Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.pixel.status === 'healthy' ? 'bg-green-100' : statusData.pixel.status === 'warning' ? 'bg-orange-100' : statusData.pixel.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Globe className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Pixel Status</h3>
                  {getStatusIcon(statusData.pixel.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.pixel.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.pixel.status)}`}>
                  {getStatusBadge(statusData.pixel.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CAPI Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.capi.status === 'healthy' ? 'bg-green-100' : statusData.capi.status === 'warning' ? 'bg-orange-100' : statusData.capi.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Activity className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">CAPI Status</h3>
                  {getStatusIcon(statusData.capi.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.capi.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.capi.status)}`}>
                  {getStatusBadge(statusData.capi.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Manager Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.businessManager.status === 'healthy' ? 'bg-green-100' : statusData.businessManager.status === 'warning' ? 'bg-orange-100' : statusData.businessManager.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Database className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Business Manager</h3>
                  {getStatusIcon(statusData.businessManager.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.businessManager.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.businessManager.status)}`}>
                  {getStatusBadge(statusData.businessManager.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catalog Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.catalog.status === 'healthy' ? 'bg-green-100' : statusData.catalog.status === 'warning' ? 'bg-orange-100' : statusData.catalog.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Catalog Feed</h3>
                  {getStatusIcon(statusData.catalog.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.catalog.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.catalog.status)}`}>
                  {getStatusBadge(statusData.catalog.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messenger Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.messenger.status === 'healthy' ? 'bg-green-100' : statusData.messenger.status === 'warning' ? 'bg-orange-100' : statusData.messenger.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Facebook className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Messenger</h3>
                  {getStatusIcon(statusData.messenger.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.messenger.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.messenger.status)}`}>
                  {getStatusBadge(statusData.messenger.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Ads Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.leadAds.status === 'healthy' ? 'bg-green-100' : statusData.leadAds.status === 'warning' ? 'bg-orange-100' : statusData.leadAds.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Database className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Lead Ads</h3>
                  {getStatusIcon(statusData.leadAds.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.leadAds.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.leadAds.status)}`}>
                  {getStatusBadge(statusData.leadAds.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusData.webhooks.status === 'healthy' ? 'bg-green-100' : statusData.webhooks.status === 'warning' ? 'bg-orange-100' : statusData.webhooks.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Webhooks</h3>
                  {getStatusIcon(statusData.webhooks.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{statusData.webhooks.message}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(statusData.webhooks.status)}`}>
                  {getStatusBadge(statusData.webhooks.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FacebookAudit
