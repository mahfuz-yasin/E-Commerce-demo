'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_ANALYTICS } from '@/routes/AdminPanelRoute'
import { showToast } from '@/lib/showToast'
import { RefreshCw, Users, Eye, ShoppingCart, DollarSign, Activity, TrendingUp, Calendar } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Analytics' },
]

const Analytics = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('30daysAgo')
  const [overviewMetrics, setOverviewMetrics] = useState(null)
  const [trafficData, setTrafficData] = useState(null)
  const [ecommerceMetrics, setEcommerceMetrics] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [topPages, setTopPages] = useState([])
  const [topEvents, setTopEvents] = useState([])
  const [realTimeUsers, setRealTimeUsers] = useState(0)
  const [realTimeEvents, setRealTimeEvents] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const startDate = dateRange
      const endDate = 'today'

      // Fetch all data in parallel
      const [overview, traffic, ecommerce, products, pages, events] = await Promise.all([
        axios.get(`/api/admin/analytics/overview?startDate=${startDate}&endDate=${endDate}`),
        axios.get(`/api/admin/analytics/traffic?startDate=${startDate}&endDate=${endDate}`),
        axios.get(`/api/admin/analytics/ecommerce?startDate=${startDate}&endDate=${endDate}&type=overview`),
        axios.get(`/api/admin/analytics/ecommerce?startDate=${startDate}&endDate=${endDate}&type=products`),
        axios.get(`/api/admin/analytics/pages?startDate=${startDate}&endDate=${endDate}&limit=10`),
        axios.get(`/api/admin/analytics/events?startDate=${startDate}&endDate=${endDate}&limit=10`)
      ])

      if (overview.data.success) setOverviewMetrics(overview.data.data)
      if (traffic.data.success) setTrafficData(traffic.data.data)
      if (ecommerce.data.success) setEcommerceMetrics(ecommerce.data.data)
      if (products.data.success) setTopProducts(products.data.data)
      if (pages.data.success) setTopPages(pages.data.data)
      if (events.data.success) setTopEvents(events.data.data)
    } catch (error) {
      showToast('error', 'Failed to fetch analytics data')
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      const [users, events] = await Promise.all([
        axios.get('/api/admin/analytics/realtime?type=users'),
        axios.get('/api/admin/analytics/realtime?type=events&limit=20')
      ])

      if (users.data.success) setRealTimeUsers(users.data.data.activeUsers)
      if (events.data.success) setRealTimeEvents(events.data.data)
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }

  useEffect(() => {
    fetchRealTimeData()
    const interval = setInterval(fetchRealTimeData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num) => {
    if (!num) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (num) => {
    if (!num) return '৳0'
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(num)
  }

  return (
    <div className="lg:px-32 px-4">
      <WebsiteBreadcrumb data={breadcrumbData} />
      
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="7daysAgo">Last 7 days</option>
            <option value="30daysAgo">Last 30 days</option>
            <option value="90daysAgo">Last 90 days</option>
          </select>
          <Button onClick={fetchAnalyticsData} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (Real-time)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(realTimeUsers)}</div>
            <p className="text-xs text-muted-foreground">Current active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events per Minute</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewMetrics?.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewMetrics?.screenPageViews)}</div>
            <p className="text-xs text-muted-foreground">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewMetrics?.eventCount)}</div>
            <p className="text-xs text-muted-foreground">Total events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewMetrics?.sessions)}</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Ecommerce Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ecommerceMetrics?.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchasers</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(ecommerceMetrics?.totalPurchasers)}</div>
            <p className="text-xs text-muted-foreground">Total purchasers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Purchase Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ecommerceMetrics?.averagePurchaseRevenue)}</div>
            <p className="text-xs text-muted-foreground">Average purchase value</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.itemName}</p>
                  <p className="text-sm text-muted-foreground">{product.itemCategory}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(product.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(product.itemQuantity)} sold</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{page.pageTitle}</p>
                  <p className="text-sm text-muted-foreground">{page.pagePath}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNumber(page.screenPageViews)} views</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(page.activeUsers)} users</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.eventName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNumber(event.eventCount)}</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(event.totalUsers)} users</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
