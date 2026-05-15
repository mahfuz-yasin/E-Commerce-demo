'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, RefreshCw, TrendingUp, DollarSign, MousePointer2, Eye, Target, ArrowRight } from 'lucide-react'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Ads Analytics' },
]

const FacebookAnalytics = () => {
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [dateRange, setDateRange] = useState('last_30d')
  const [insights, setInsights] = useState(null)
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    fetchInsights()
  }, [dateRange])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchInsights, 300000) // Refresh every 5 minutes
    }
    return () => clearInterval(interval)
  }, [autoRefresh, dateRange])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/facebook/business-manager/insights?date_preset=${dateRange}&fields=spend,impressions,clicks,cpc,ctr,conversions,actions`)
      if (data.success) {
        setInsights(data.summary)
        setCampaigns(data.insights || [])
      } else {
        showToast('error', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch insights')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '৳0'
    return `৳${parseFloat(value).toLocaleString('en-BD')}`
  }

  const formatNumber = (value) => {
    if (!value) return '0'
    return parseFloat(value).toLocaleString()
  }

  const formatPercentage = (value) => {
    if (!value) return '0%'
    return `${parseFloat(value).toFixed(2)}%`
  }

  const metrics = [
    { label: 'Spend', value: insights?.spend ? formatCurrency(insights.spend) : '৳0', icon: DollarSign, color: 'text-green-600' },
    { label: 'Impressions', value: insights?.impressions ? formatNumber(insights.impressions) : '0', icon: Eye, color: 'text-blue-600' },
    { label: 'Clicks', value: insights?.clicks ? formatNumber(insights.clicks) : '0', icon: MousePointer2, color: 'text-purple-600' },
    { label: 'CTR', value: insights?.ctr ? formatPercentage(insights.ctr) : '0%', icon: TrendingUp, color: 'text-orange-600' },
    { label: 'CPC', value: insights?.cpc ? formatCurrency(insights.cpc) : '৳0', icon: Target, color: 'text-red-600' },
    { label: 'Conversions', value: insights?.conversions ? formatNumber(insights.conversions) : '0', icon: ArrowRight, color: 'text-indigo-600' },
  ]

  const chartData = campaigns.slice(0, 7).map((c, index) => ({
    name: `Day ${index + 1}`,
    spend: c.spend || 0,
    clicks: c.clicks || 0,
    impressions: c.impressions || 0,
  }))

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="h-8 w-8 text-blue-600" />
              <CardTitle>Ads Analytics Dashboard</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7d">Last 7 Days</SelectItem>
                  <SelectItem value="last_30d">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <ButtonLoading
                loading={loading}
                text="Refresh"
                className="cursor-pointer"
                onClick={fetchInsights}
                icon={<RefreshCw className="h-4 w-4 mr-2" />}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm">Auto-refresh</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className={`p-3 bg-gray-100 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#22c55e" strokeWidth={2} name="Spend" />
                <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} name="Clicks" />
                <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} name="Impressions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Campaign</th>
                  <th className="text-right p-3 font-medium">Spend</th>
                  <th className="text-right p-3 font-medium">Results</th>
                  <th className="text-right p-3 font-medium">Cost/Result</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-600">
                      No campaign data available
                    </td>
                  </tr>
                ) : (
                  campaigns.slice(0, 5).map((campaign, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium">{campaign.campaign_name || `Campaign ${index + 1}`}</p>
                      </td>
                      <td className="text-right p-3">{formatCurrency(campaign.spend)}</td>
                      <td className="text-right p-3">{formatNumber(campaign.actions?.[0]?.value || campaign.conversions || 0)}</td>
                      <td className="text-right p-3">
                        {campaign.spend && campaign.actions?.[0]?.value 
                          ? formatCurrency(campaign.spend / campaign.actions[0].value)
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FacebookAnalytics
