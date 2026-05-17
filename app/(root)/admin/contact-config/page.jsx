'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { IoSaveOutline, IoReload } from 'react-icons/io5'

const ContactConfig = () => {
    const [config, setConfig] = useState({
        companyName: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            district: '',
            country: ''
        },
        phone: {
            primary: '',
            secondary: ''
        },
        email: {
            primary: '',
            support: ''
        },
        businessHours: {
            days: '',
            hours: ''
        },
        socialLinks: {
            facebook: '',
            whatsapp: '',
            instagram: '',
            twitter: '',
            youtube: ''
        },
        mapEmbedUrl: '',
        pageTitle: '',
        pageSubtitle: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/admin/contact-config')
            if (response.data.success && response.data.data) {
                setConfig(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching config:', error)
            showToast('Failed to load configuration', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (section, field, value) => {
        if (section) {
            setConfig(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }))
        } else {
            setConfig(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await axios.put('/api/admin/contact-config', config)
            showToast('Configuration saved successfully', 'success')
        } catch (error) {
            console.error('Error saving config:', error)
            showToast('Failed to save configuration', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Contact Page Configuration</h1>
                <div className="flex gap-3">
                    <Button onClick={fetchConfig} variant="outline" size="icon">
                        <IoReload className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <IoSaveOutline className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-1/2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="page">Page</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={config.companyName || ''}
                                    onChange={(e) => handleChange(null, 'companyName', e.target.value)}
                                    placeholder="Al-Hilal Panjabi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="businessDays">Business Days</Label>
                                <Input
                                    id="businessDays"
                                    value={config.businessHours?.days || ''}
                                    onChange={(e) => handleChange('businessHours', 'days', e.target.value)}
                                    placeholder="Sat - Thu"
                                />
                            </div>
                            <div>
                                <Label htmlFor="businessHours">Business Hours</Label>
                                <Input
                                    id="businessHours"
                                    value={config.businessHours?.hours || ''}
                                    onChange={(e) => handleChange('businessHours', 'hours', e.target.value)}
                                    placeholder="9AM - 8PM"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="address">
                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="addressLine1">Address Line 1</Label>
                                <Input
                                    id="addressLine1"
                                    value={config.address?.line1 || ''}
                                    onChange={(e) => handleChange('address', 'line1', e.target.value)}
                                    placeholder="Magura Sadar"
                                />
                            </div>
                            <div>
                                <Label htmlFor="addressLine2">Address Line 2</Label>
                                <Input
                                    id="addressLine2"
                                    value={config.address?.line2 || ''}
                                    onChange={(e) => handleChange('address', 'line2', e.target.value)}
                                    placeholder="Magura"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={config.address?.city || ''}
                                        onChange={(e) => handleChange('address', 'city', e.target.value)}
                                        placeholder="Magura"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="district">District</Label>
                                    <Input
                                        id="district"
                                        value={config.address?.district || ''}
                                        onChange={(e) => handleChange('address', 'district', e.target.value)}
                                        placeholder="Khulna Division"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={config.address?.country || ''}
                                    onChange={(e) => handleChange('address', 'country', e.target.value)}
                                    placeholder="Bangladesh"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="primaryPhone">Primary Phone</Label>
                                <Input
                                    id="primaryPhone"
                                    value={config.phone?.primary || ''}
                                    onChange={(e) => handleChange('phone', 'primary', e.target.value)}
                                    placeholder="+880 1810-841539"
                                />
                            </div>
                            <div>
                                <Label htmlFor="secondaryPhone">Secondary Phone (Optional)</Label>
                                <Input
                                    id="secondaryPhone"
                                    value={config.phone?.secondary || ''}
                                    onChange={(e) => handleChange('phone', 'secondary', e.target.value)}
                                    placeholder="+880 1XXX-XXXXXX"
                                />
                            </div>
                            <div>
                                <Label htmlFor="primaryEmail">Primary Email</Label>
                                <Input
                                    id="primaryEmail"
                                    value={config.email?.primary || ''}
                                    onChange={(e) => handleChange('email', 'primary', e.target.value)}
                                    placeholder="info@alhilalpanjabi.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="supportEmail">Support Email</Label>
                                <Input
                                    id="supportEmail"
                                    value={config.email?.support || ''}
                                    onChange={(e) => handleChange('email', 'support', e.target.value)}
                                    placeholder="support@alhilalpanjabi.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="social">
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="facebook">Facebook URL</Label>
                                <Input
                                    id="facebook"
                                    value={config.socialLinks?.facebook || ''}
                                    onChange={(e) => handleChange('socialLinks', 'facebook', e.target.value)}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="whatsapp">WhatsApp URL</Label>
                                <Input
                                    id="whatsapp"
                                    value={config.socialLinks?.whatsapp || ''}
                                    onChange={(e) => handleChange('socialLinks', 'whatsapp', e.target.value)}
                                    placeholder="https://wa.me/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="instagram">Instagram URL</Label>
                                <Input
                                    id="instagram"
                                    value={config.socialLinks?.instagram || ''}
                                    onChange={(e) => handleChange('socialLinks', 'instagram', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="twitter">Twitter URL</Label>
                                <Input
                                    id="twitter"
                                    value={config.socialLinks?.twitter || ''}
                                    onChange={(e) => handleChange('socialLinks', 'twitter', e.target.value)}
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="youtube">YouTube URL</Label>
                                <Input
                                    id="youtube"
                                    value={config.socialLinks?.youtube || ''}
                                    onChange={(e) => handleChange('socialLinks', 'youtube', e.target.value)}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="page">
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="pageTitle">Page Title</Label>
                                <Input
                                    id="pageTitle"
                                    value={config.pageTitle || ''}
                                    onChange={(e) => handleChange(null, 'pageTitle', e.target.value)}
                                    placeholder="Contact Us"
                                />
                            </div>
                            <div>
                                <Label htmlFor="pageSubtitle">Page Subtitle</Label>
                                <Input
                                    id="pageSubtitle"
                                    value={config.pageSubtitle || ''}
                                    onChange={(e) => handleChange(null, 'pageSubtitle', e.target.value)}
                                    placeholder="Have questions? We would love to hear from you..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="mapEmbedUrl">Google Maps Embed URL (Optional)</Label>
                                <Input
                                    id="mapEmbedUrl"
                                    value={config.mapEmbedUrl || ''}
                                    onChange={(e) => handleChange(null, 'mapEmbedUrl', e.target.value)}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Paste the embed URL from Google Maps. Leave empty to hide the map.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ContactConfig
