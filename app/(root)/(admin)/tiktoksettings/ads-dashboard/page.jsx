'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_TIKTOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, TrendingUp, DollarSign, MousePointer, Eye, RefreshCw, Calendar } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_TIKTOK_SETTINGS, label: 'TikTok Settings' },
  { href: '', label: 'Ads Dashboard' },
]

const TikTokAdsDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [metrics, setMetrics] = useState({
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    conversions: 0,
    costPerConversion: 0,
    roas: 0
  })
  const [dateRange, setDateRange] = useState('7days') // 7days, 30days, custom
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchCampaigns()
  }, [dateRange])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/tiktok/campaigns')
      if (data.success) {
        setCampaigns(data.data.list || [])
        calculateMetrics(data.data.list || [])
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (campaignList) => {
    const totalSpend = campaignList.reduce((sum, c) => sum + (c.budget || 0), 0)
    const totalImpressions = campaignList.reduce((sum, c) => sum + (c.impressions || 0), 0)
    const totalClicks = campaignList.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const totalConversions = campaignList.reduce((sum, c) => sum + (c.conversions || 0), 0)

    setMetrics({
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
      cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0,
      conversions: totalConversions,
      costPerConversion: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 0,
      roas: totalSpend > 0 ? ((totalConversions * 1000) / totalSpend).toFixed(2) : 0
    })

    // Generate chart data (mock data for demo)
    const days = dateRange === '7days' ? 7 : 30
    const mockChartData = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      spend: Math.floor(Math.random() * 5000) + 1000,
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 5000) + 500,
      conversions: Math.floor(Math.random() * 100) + 10
    }))
    setChartData(mockChartData)
  }

  const handleRefresh = () => {
    fetchCampaigns()
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-black" />
              <CardTitle>TikTok Ads Dashboard</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Spend"
          value={`৳${metrics.spend.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="+12%"
        />
        <MetricCard
          title="Impressions"
          value={metrics.impressions.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          trend="+8%"
        />
        <MetricCard
          title="Clicks"
          value={metrics.clicks.toLocaleString()}
          icon={<MousePointer className="h-5 w-5" />}
          trend="+15%"
        />
        <MetricCard
          title="CTR"
          value={`${metrics.ctr}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+3%"
        />
        <MetricCard
          title="CPC"
          value={`৳${metrics.cpc}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="-5%"
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+20%"
        />
        <MetricCard
          title="Cost/Conversion"
          value={`৳${metrics.costPerConversion}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="-10%"
        />
        <MetricCard
          title="ROAS"
          value={metrics.roas}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+18%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#8884d8" name="Spend" />
                <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversions vs Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
                <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
              <p className="mt-2">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No campaigns found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Campaign Name</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Budget</th>
                    <th className="text-right p-3">Spend</th>
                    <th className="text-right p-3">Impressions</th>
                    <th className="text-right p-3">Clicks</th>
                    <th className="text-right p-3">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.campaign_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{campaign.campaign_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="text-right p-3">৳{campaign.budget?.toLocaleString() || 0}</td>
                      <td className="text-right p-3">৳{campaign.budget?.toLocaleString() || 0}</td>
                      <td className="text-right p-3">{campaign.impressions?.toLocaleString() || 0}</td>
                      <td className="text-right p-3">{campaign.clicks?.toLocaleString() || 0}</td>
                      <td className="text-right p-3">
                        {campaign.impressions > 0 
                          ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) + '%' 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const MetricCard = ({ title, value, icon, trend }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend} from last period
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default TikTokAdsDashboard
