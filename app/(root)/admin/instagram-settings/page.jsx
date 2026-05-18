'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS, ADMIN_INSTAGRAM_BUSINESS, ADMIN_INSTAGRAM_SHOPPING, ADMIN_INSTAGRAM_CONTENT, ADMIN_INSTAGRAM_ANALYTICS, ADMIN_INSTAGRAM_MESSAGING, ADMIN_INSTAGRAM_ADS, ADMIN_INSTAGRAM_SHOP_SETUP } from '@/routes/AdminPanelRoute'
import Link from 'next/link'
import { Instagram, Store, ShoppingBag, Camera, BarChart3, MessageCircle, Target, CheckCircle, AlertCircle, ExternalLink, Settings, Zap, Users, Hash, Video, Trophy } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Instagram Business' },
]

const features = [
    {
        title: 'Business Account',
        description: 'Connect and manage your Instagram Business account',
        icon: Store,
        href: ADMIN_INSTAGRAM_BUSINESS,
        color: 'bg-pink-500',
        status: 'account'
    },
    {
        title: 'Instagram Shop',
        description: 'Set up Instagram Shopping and product catalog',
        icon: ShoppingBag,
        href: ADMIN_INSTAGRAM_SHOP_SETUP,
        color: 'bg-purple-500',
        status: 'shop'
    },
    {
        title: 'Product Tagging',
        description: 'Enable product tagging in posts and stories',
        icon: ShoppingBag,
        href: ADMIN_INSTAGRAM_SHOPPING,
        color: 'bg-indigo-500',
        status: 'tagging'
    },
    {
        title: 'Content Manager',
        description: 'Schedule posts, manage content calendar',
        icon: Camera,
        href: ADMIN_INSTAGRAM_CONTENT,
        color: 'bg-blue-500',
        status: 'content'
    },
    {
        title: 'Stories & Highlights',
        description: 'Create and manage story campaigns',
        icon: Camera,
        href: ADMIN_INSTAGRAM_CONTENT,
        color: 'bg-yellow-500',
        status: 'stories'
    },
    {
        title: 'Reels Manager',
        description: 'Manage Reels content and analytics',
        icon: Video,
        href: ADMIN_INSTAGRAM_CONTENT,
        color: 'bg-red-500',
        status: 'reels'
    },
    {
        title: 'Live Commerce',
        description: 'Live shopping and real-time product showcase',
        icon: Video,
        href: ADMIN_INSTAGRAM_CONTENT,
        color: 'bg-orange-500',
        status: 'live'
    },
    {
        title: 'Direct Messaging',
        description: 'Manage DMs and customer inquiries',
        icon: MessageCircle,
        href: ADMIN_INSTAGRAM_MESSAGING,
        color: 'bg-green-500',
        status: 'messaging'
    },
    {
        title: 'Automation',
        description: 'Auto-replies, chatbots, and quick responses',
        icon: Zap,
        href: ADMIN_INSTAGRAM_MESSAGING,
        color: 'bg-teal-500',
        status: 'automation'
    },
    {
        title: 'Ads Manager',
        description: 'Create and manage Instagram ad campaigns',
        icon: Target,
        href: ADMIN_INSTAGRAM_ADS,
        color: 'bg-cyan-500',
        status: 'ads'
    },
    {
        title: 'Audiences',
        description: 'Build and manage custom audiences',
        icon: Users,
        href: ADMIN_INSTAGRAM_ADS,
        color: 'bg-violet-500',
        status: 'audiences'
    },
    {
        title: 'Hashtag Strategy',
        description: 'Optimize hashtag usage and tracking',
        icon: Hash,
        href: ADMIN_INSTAGRAM_ANALYTICS,
        color: 'bg-fuchsia-500',
        status: 'hashtags'
    },
    {
        title: 'Influencer Hub',
        description: 'Manage influencer partnerships',
        icon: Users,
        href: ADMIN_INSTAGRAM_ANALYTICS,
        color: 'bg-rose-500',
        status: 'influencers'
    },
    {
        title: 'Collaborations',
        description: 'Creator collaborations and partnerships',
        icon: Users,
        href: ADMIN_INSTAGRAM_ANALYTICS,
        color: 'bg-emerald-500',
        status: 'collaborations'
    },
    {
        title: 'Contests',
        description: 'Run giveaways and contests',
        icon: Trophy,
        href: ADMIN_INSTAGRAM_ANALYTICS,
        color: 'bg-amber-500',
        status: 'contests'
    },
    {
        title: 'Analytics',
        description: 'Detailed insights and performance metrics',
        icon: BarChart3,
        href: ADMIN_INSTAGRAM_ANALYTICS,
        color: 'bg-sky-500',
        status: 'analytics'
    }
]

export default function InstagramSettingsPage() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success) {
                setConfig(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch config:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleActive = async () => {
        setSaving(true)
        try {
            const { data } = await axios.post('/api/admin/instagram/config', {
                isActive: !config?.isActive
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            setConfig(data.data)
            showToast('success', `Instagram Business ${data.data.isActive ? 'enabled' : 'disabled'} successfully!`)
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to update settings')
        } finally {
            setSaving(false)
        }
    }

    const isFeatureActive = (status) => {
        if (!config) return false
        
        const statusMap = {
            'account': config.businessAccount?.isConnected,
            'shop': config.shop?.isEnabled,
            'tagging': config.shop?.isEnabled,
            'content': config.content?.autoPostProducts || config.content?.postingSchedule?.enabled,
            'stories': config.content?.storyTemplates?.length > 0,
            'reels': config.content?.autoPostProducts,
            'live': config.shop?.checkoutEnabled,
            'messaging': config.messaging?.autoReplyEnabled,
            'automation': config.messaging?.aiChatbot?.enabled,
            'ads': config.ads?.adAccountId,
            'audiences': config.ads?.automatedAds?.enabled,
            'hashtags': config.content?.defaultHashtags?.length > 0,
            'influencers': config.influencers?.enabled,
            'collaborations': config.influencers?.enabled,
            'contests': false,
            'analytics': config.analytics?.trackingEnabled
        }
        
        return statusMap[status] || false
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Instagram className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Instagram Business</h1>
                            <p className="text-white/80">Full-featured Instagram commerce and marketing solution</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {config?.businessAccount?.isConnected ? (
                            <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                                <CheckCircle className="w-5 h-5" />
                                Connected: @{config.businessAccount.username}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                                <AlertCircle className="w-5 h-5" />
                                Not Connected
                            </span>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config?.isActive || false}
                                onChange={toggleActive}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-white/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-400"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {config?.businessAccount?.isConnected && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <p className="text-sm text-gray-500">Followers</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {(config.businessAccount.followersCount || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <p className="text-sm text-gray-500">Following</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {(config.businessAccount.followingCount || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <p className="text-sm text-gray-500">Media Posts</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {(config.businessAccount.mediaCount || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <p className="text-sm text-gray-500">Shop Status</p>
                        <p className="text-lg font-bold text-gray-800">
                            {config.shop?.isEnabled ? (
                                <span className="text-green-600">Active</span>
                            ) : (
                                <span className="text-gray-400">Not Set</span>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Features Grid */}
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-pink-600" />
                        <h4 className="text-lg font-bold text-gray-800">Instagram Business Features</h4>
                    </div>
                </div>

                <div className="p-5">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            const isActive = isFeatureActive(feature.status)
                            
                            return (
                                <Link
                                    key={index}
                                    href={feature.href}
                                    className="group border rounded-lg p-4 hover:shadow-md transition-all hover:border-pink-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center text-white`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {isActive ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                <AlertCircle className="w-3 h-3" /> Setup
                                            </span>
                                        )}
                                    </div>
                                    <h5 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                        {feature.title}
                                    </h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {feature.description}
                                    </p>
                                    <div className="mt-3 flex items-center gap-1 text-pink-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Configure
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-blue-800">Quick Links</h5>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a 
                        href="https://business.instagram.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-md border border-blue-200"
                    >
                        Instagram Business Help
                    </a>
                    <a 
                        href="https://developers.facebook.com/docs/instagram-api" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-md border border-blue-200"
                    >
                        Instagram API Documentation
                    </a>
                    <a 
                        href="https://www.facebook.com/business/help/898752977282997" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-md border border-blue-200"
                    >
                        Shopping on Instagram
                    </a>
                </div>
            </div>
        </div>
    )
}
