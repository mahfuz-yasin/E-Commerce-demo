'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/showToast'
import { IoLocationOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5'
import { FaFacebookF, FaWhatsapp, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import axios from 'axios'

// Default contact config
const defaultConfig = {
    companyName: 'E-Online Fashion Panjabi',
    address: {
        line1: 'Magura Sadar',
        line2: 'Magura',
        city: 'Magura',
        district: 'Khulna Division',
        country: 'Bangladesh'
    },
    phone: {
        primary: '+880 1810-841539',
        secondary: ''
    },
    email: {
        primary: 'info@alhilalpanjabi.com',
        support: 'support@alhilalpanjabi.com'
    },
    businessHours: {
        days: 'Sat - Thu',
        hours: '9AM - 8PM'
    },
    socialLinks: {
        facebook: '#',
        whatsapp: 'https://wa.me/8801810841539',
        instagram: '#',
        twitter: '',
        youtube: ''
    },
    mapEmbedUrl: '',
    pageTitle: 'Contact Us',
    pageSubtitle: 'Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.'
}

const ContactUs = () => {
    const [config, setConfig] = useState(defaultConfig)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch contact config
    useEffect(() => {
        fetchContactConfig()
    }, [])

    const fetchContactConfig = async () => {
        try {
            const response = await axios.get('/api/contact/config')
            if (response.data.success && response.data.data) {
                setConfig({ ...defaultConfig, ...response.data.data })
            }
        } catch (error) {
            console.error('Error fetching contact config:', error)
            // Keep default config on error
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            const response = await axios.post('/api/contact/submit', formData)
            if (response.data.success) {
                showToast(response.data.message || 'Message sent successfully! We will get back to you soon.', 'success')
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
            } else {
                showToast(response.data.message || 'Failed to send message. Please try again.', 'error')
            }
        } catch (error) {
            console.error('Error submitting contact form:', error)
            showToast(error?.response?.data?.message || 'Failed to send message. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Get full address string
    const getFullAddress = () => {
        const { line1, line2, city, district, country } = config.address || {}
        const parts = [config.companyName, line1, line2, city, district, country].filter(Boolean)
        return parts
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{config.pageTitle}</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">
                        {config.pageSubtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                <IoLocationOutline className="text-amber-600 text-2xl" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                            <p className="text-gray-600 text-sm">
                                {getFullAddress().map((part, index) => (
                                    <span key={index}>
                                        {part}
                                        {index < getFullAddress().length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                <IoCallOutline className="text-amber-600 text-2xl" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600 text-sm">
                                {config.phone?.primary}{config.phone?.secondary && <><br />{config.phone.secondary}</>}
                                <br />
                                {config.businessHours?.days}: {config.businessHours?.hours}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                <IoMailOutline className="text-amber-600 text-2xl" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 text-sm">
                                {config.email?.primary}{config.email?.support && <><br />{config.email.support}</>}
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                            <div className="flex gap-3">
                                {config.socialLinks?.facebook && (
                                    <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                        <FaFacebookF />
                                    </a>
                                )}
                                {config.socialLinks?.whatsapp && (
                                    <a href={config.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                                        <FaWhatsapp />
                                    </a>
                                )}
                                {config.socialLinks?.instagram && (
                                    <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                                        <FaInstagram />
                                    </a>
                                )}
                                {config.socialLinks?.twitter && (
                                    <a href={config.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                        <FaTwitter />
                                    </a>
                                )}
                                {config.socialLinks?.youtube && (
                                    <a href={config.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                                        <FaYoutube />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name *
                                        </label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your name"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your email"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <Input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <Input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter subject"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Message *
                                    </label>
                                    <Textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Write your message here..."
                                        rows={6}
                                        className="w-full resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </div>

                        {/* Map Section */}
                        {config.mapEmbedUrl ? (
                            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <iframe
                                    src={config.mapEmbedUrl}
                                    width="100%"
                                    height="400"
                                    style={{ border: 0, borderRadius: '0.75rem' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Location Map"
                                />
                            </div>
                        ) : (
                            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                                    <div className="text-center">
                                        <IoLocationOutline className="text-4xl text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Map coming soon</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
