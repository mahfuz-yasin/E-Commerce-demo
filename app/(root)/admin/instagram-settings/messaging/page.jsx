'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { MessageCircle, Bot, Zap, CheckCircle, Plus, X, ExternalLink, MessageSquare, Clock, Key, Brain } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Messaging & Automation' },
]

export default function InstagramMessagingPage() {
    const [config, setConfig] = useState({
        messaging: {
            autoReplyEnabled: false,
            welcomeMessage: '',
            awayMessage: '',
            quickReplies: [],
            aiChatbot: {
                enabled: false,
                provider: 'openai',
                apiKey: ''
            }
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newReply, setNewReply] = useState({ keyword: '', response: '' })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    messaging: data.data.messaging || prev.messaging
                }))
            }
        } catch (error) {
            console.log('No existing config found')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await axios.post('/api/admin/instagram/config', {
                messaging: config.messaging
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Messaging settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const addQuickReply = () => {
        if (newReply.keyword && newReply.response) {
            setConfig(prev => ({
                ...prev,
                messaging: {
                    ...prev.messaging,
                    quickReplies: [...prev.messaging.quickReplies, { ...newReply, isActive: true }]
                }
            }))
            setNewReply({ keyword: '', response: '' })
        }
    }

    const removeQuickReply = (index) => {
        setConfig(prev => ({
            ...prev,
            messaging: {
                ...prev.messaging,
                quickReplies: prev.messaging.quickReplies.filter((_, i) => i !== index)
            }
        }))
    }

    const toggleQuickReply = (index) => {
        setConfig(prev => ({
            ...prev,
            messaging: {
                ...prev.messaging,
                quickReplies: prev.messaging.quickReplies.map((reply, i) => 
                    i === index ? { ...reply, isActive: !reply.isActive } : reply
                )
            }
        }))
    }

    const updateField = (path, value) => {
        setConfig(prev => {
            const newConfig = { ...prev }
            const keys = path.split('.')
            let current = newConfig
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
            return newConfig
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-green-600 to-teal-500 text-white">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Messaging & Automation</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Auto Reply Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h5 className="font-medium text-gray-800">Enable Auto Reply</h5>
                            <p className="text-sm text-gray-500">Automatically respond to direct messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.messaging?.autoReplyEnabled || false}
                                onChange={(e) => updateField('messaging.autoReplyEnabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    {/* Welcome Message */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            Welcome Message
                        </h5>
                        <p className="text-sm text-gray-500 mb-3">
                            Auto-sent when someone first messages your business
                        </p>
                        <textarea
                            value={config.messaging?.welcomeMessage || ''}
                            onChange={(e) => updateField('messaging.welcomeMessage', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                            placeholder="Hi! Thanks for reaching out. How can we help you today?"
                        />
                    </div>

                    {/* Away Message */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            Away Message
                        </h5>
                        <p className="text-sm text-gray-500 mb-3">
                            Sent when business hours are over
                        </p>
                        <textarea
                            value={config.messaging?.awayMessage || ''}
                            onChange={(e) => updateField('messaging.awayMessage', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                            placeholder="We're currently away. We'll get back to you as soon as possible!"
                        />
                    </div>

                    {/* Quick Replies */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            Quick Replies
                        </h5>
                        <div className="grid md:grid-cols-2 gap-3 mb-4">
                            <input
                                type="text"
                                value={newReply.keyword}
                                onChange={(e) => setNewReply(prev => ({ ...prev, keyword: e.target.value }))}
                                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Keyword (e.g., price)"
                            />
                            <input
                                type="text"
                                value={newReply.response}
                                onChange={(e) => setNewReply(prev => ({ ...prev, response: e.target.value }))}
                                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Response (e.g., Prices start from ৳500)"
                            />
                        </div>
                        <button
                            onClick={addQuickReply}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 mb-4"
                        >
                            <Plus className="w-4 h-4" /> Add Quick Reply
                        </button>

                        <div className="space-y-2">
                            {config.messaging?.quickReplies?.map((reply, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border flex items-center justify-between ${
                                        reply.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleQuickReply(index)}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                reply.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                            }`}
                                        >
                                            {reply.isActive && <CheckCircle className="w-4 h-4" />}
                                        </button>
                                        <div>
                                            <p className="font-medium text-gray-800">{reply.keyword}</p>
                                            <p className="text-sm text-gray-500">{reply.response}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeQuickReply(index)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Chatbot */}
                    <div className="border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-green-600" />
                                AI Chatbot
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.messaging?.aiChatbot?.enabled || false}
                                    onChange={(e) => updateField('messaging.aiChatbot.enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    AI Provider
                                </label>
                                <select
                                    value={config.messaging?.aiChatbot?.provider || 'openai'}
                                    onChange={(e) => updateField('messaging.aiChatbot.provider', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="openai">OpenAI (GPT)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="custom">Custom API</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={config.messaging?.aiChatbot?.apiKey || ''}
                                    onChange={(e) => updateField('messaging.aiChatbot.apiKey', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter your AI API key"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Messaging Settings"
                            className="bg-green-600 hover:bg-green-700"
                        />
                        <a
                            href="https://business.facebook.com/inbox"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Meta Business Suite Inbox
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
