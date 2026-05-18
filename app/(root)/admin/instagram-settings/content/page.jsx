'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { Camera, Calendar, Clock, Hash, Save, Plus, X, ExternalLink, Image as ImageIcon, Video as VideoIcon, CheckCircle } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Content Manager' },
]

const defaultSchedule = {
    enabled: false,
    times: ['10:00', '14:00', '19:00']
}

export default function InstagramContentPage() {
    const [config, setConfig] = useState({
        content: {
            autoPostProducts: false,
            defaultHashtags: ['#panjabi', '#traditionalwear', '#fashion', '#bangladesh'],
            postingSchedule: defaultSchedule,
            storyTemplates: []
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newHashtag, setNewHashtag] = useState('')
    const [newTime, setNewTime] = useState('')

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    content: data.data.content || prev.content
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
                content: config.content
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Content settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const addHashtag = () => {
        if (newHashtag && !config.content.defaultHashtags.includes(newHashtag)) {
            setConfig(prev => ({
                ...prev,
                content: {
                    ...prev.content,
                    defaultHashtags: [...prev.content.defaultHashtags, newHashtag]
                }
            }))
            setNewHashtag('')
        }
    }

    const removeHashtag = (index) => {
        setConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                defaultHashtags: prev.content.defaultHashtags.filter((_, i) => i !== index)
            }
        }))
    }

    const addScheduleTime = () => {
        if (newTime && !config.content.postingSchedule.times.includes(newTime)) {
            setConfig(prev => ({
                ...prev,
                content: {
                    ...prev.content,
                    postingSchedule: {
                        ...prev.content.postingSchedule,
                        times: [...prev.content.postingSchedule.times, newTime].sort()
                    }
                }
            }))
            setNewTime('')
        }
    }

    const removeScheduleTime = (index) => {
        setConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                postingSchedule: {
                    ...prev.content.postingSchedule,
                    times: prev.content.postingSchedule.times.filter((_, i) => i !== index)
                }
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
                <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Content Manager</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Auto Post Products */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h5 className="font-medium text-gray-800">Auto Post New Products</h5>
                            <p className="text-sm text-gray-500">Automatically create Instagram posts for new products</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.content?.autoPostProducts || false}
                                onChange={(e) => updateField('content.autoPostProducts', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Default Hashtags */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-blue-600" />
                            Default Hashtags
                        </h5>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newHashtag}
                                onChange={(e) => setNewHashtag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add hashtag (e.g., #fashion)"
                            />
                            <button
                                onClick={addHashtag}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {config.content?.defaultHashtags?.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeHashtag(index)}
                                        className="hover:text-blue-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Posting Schedule */}
                    <div className="border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Posting Schedule
                            </h5>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.content?.postingSchedule?.enabled || false}
                                    onChange={(e) => updateField('content.postingSchedule.enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={addScheduleTime}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Time
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {config.content?.postingSchedule?.times?.map((time, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                >
                                    <Clock className="w-3 h-3" />
                                    {time}
                                    <button
                                        onClick={() => removeScheduleTime(index)}
                                        className="hover:text-green-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Story Templates */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                            Story Templates
                        </h5>
                        <p className="text-sm text-gray-500 mb-4">
                            Create reusable story templates for product promotions
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                                <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Add New Template</p>
                            </div>
                            {config.content?.storyTemplates?.map((template, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{template.name}</span>
                                        <button className="text-gray-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{template.template}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Content Settings"
                            className="bg-blue-600 hover:bg-blue-700"
                        />
                        <a
                            href="https://business.facebook.com/creatorstudio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Meta Creator Studio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
