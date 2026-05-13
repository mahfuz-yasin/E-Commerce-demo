'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube, FaTwitter, FaLinkedin } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import useFetch from "@/hooks/useFetch"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '', label: 'Footer' },
]

const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: FaFacebookF, color: 'bg-blue-600' },
    { value: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: 'bg-green-600' },
    { value: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'bg-pink-600' },
    { value: 'youtube', label: 'YouTube', icon: FaYoutube, color: 'bg-red-600' },
    { value: 'twitter', label: 'Twitter', icon: FaTwitter, color: 'bg-sky-500' },
    { value: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, color: 'bg-blue-700' },
]

const FooterSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()
    const [existingFooter, setExistingFooter] = useState(null)
    const [socialLinks, setSocialLinks] = useState([])
    const [newSocialLink, setNewSocialLink] = useState({ platform: 'facebook', url: '' })
    const [pageLinks, setPageLinks] = useState([])
    const [newPageLink, setNewPageLink] = useState({ title: '', slug: '' })
    const { data: pagesData } = useFetch('/api/admin/pagebuilder?pageType=page', 'GET')
    const [availablePages, setAvailablePages] = useState([])

    useEffect(() => {
        fetchFooterData()
    }, [])

    useEffect(() => {
        if (pagesData && pagesData.success) {
            setAvailablePages(pagesData.data || [])
        }
    }, [pagesData])

    const fetchFooterData = async () => {
        setIsFetching(true)
        try {
            const response = await fetch('/api/admin/settings?type=footer')
            const result = await response.json()
            
            if (result.success && result.data && result.data.length > 0) {
                const footer = result.data.find(f => f.key === 'main_footer')
                if (footer) {
                    setExistingFooter(footer)
                    setValue('title', footer.title || '')
                    setValue('content', footer.content || '')
                    
                    // Parse social links
                    if (footer.link) {
                        try {
                            setSocialLinks(JSON.parse(footer.link))
                        } catch (e) {
                            setSocialLinks([])
                        }
                    }
                    
                    // Parse page links from content
                    if (footer.pageLinks) {
                        try {
                            setPageLinks(JSON.parse(footer.pageLinks))
                        } catch (e) {
                            setPageLinks([])
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching footer data:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const addSocialLink = () => {
        if (!newSocialLink.url) return
        setSocialLinks([...socialLinks, newSocialLink])
        setNewSocialLink({ platform: 'facebook', url: '' })
    }

    const removeSocialLink = (index) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index))
    }

    const addPageLink = () => {
        if (!newPageLink.title || !newPageLink.slug) return
        setPageLinks([...pageLinks, newPageLink])
        setNewPageLink({ title: '', slug: '' })
    }

    const removePageLink = (index) => {
        setPageLinks(pageLinks.filter((_, i) => i !== index))
    }

    const handlePageSelect = (slug) => {
        const page = availablePages.find(p => p.slug === slug)
        if (page) {
            setNewPageLink({ title: page.title, slug: page.slug })
        }
    }

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const payload = {
                ...data,
                link: JSON.stringify(socialLinks),
                pageLinks: JSON.stringify(pageLinks),
                type: 'footer',
                key: 'main_footer',
                isActive: true
            }

            let response
            if (existingFooter) {
                response = await fetch(`/api/admin/settings/${existingFooter._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                response = await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Footer settings saved successfully')
                if (!existingFooter) {
                    setExistingFooter(result.data)
                }
            } else {
                showToast('error', result.message || 'Failed to save footer settings')
            }
        } catch (error) {
            showToast('error', 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <div className="space-y-6">
                <Card className="py-0 rounded shadow-sm gap-0">
                    <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                        <h4 className='text-xl font-semibold'>Footer Settings</h4>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isFetching ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Company Name</Label>
                                    <Input
                                        id="title"
                                        {...register('title')}
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Footer Content (HTML)</Label>
                                    <Textarea
                                        id="content"
                                        {...register('content')}
                                        placeholder="Enter footer HTML content"
                                        rows={8}
                                    />
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <Card className="py-0 rounded shadow-sm gap-0">
                    <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                        <h4 className='text-xl font-semibold'>Social Media Links</h4>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Select
                                    value={newSocialLink.platform}
                                    onValueChange={(value) => setNewSocialLink({ ...newSocialLink, platform: value })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {socialPlatforms.map((platform) => (
                                            <SelectItem key={platform.value} value={platform.value}>
                                                <div className="flex items-center gap-2">
                                                    <platform.icon size={16} />
                                                    {platform.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Enter URL"
                                    value={newSocialLink.url}
                                    onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                                />
                                <Button type="button" onClick={addSocialLink}>Add</Button>
                            </div>

                            <div className="space-y-2">
                                {socialLinks.map((link, index) => {
                                    const platform = socialPlatforms.find(p => p.value === link.platform)
                                    const Icon = platform?.icon || FaFacebookF
                                    return (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className={`p-2 rounded-lg ${platform?.color || 'bg-blue-600'} text-white`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="flex-1">{link.url}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeSocialLink(index)}
                                            >
                                                <IoMdClose />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0 rounded shadow-sm gap-0">
                    <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                        <h4 className='text-xl font-semibold'>Page Links</h4>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Select
                                    value={newPageLink.slug}
                                    onValueChange={handlePageSelect}
                                >
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Select a page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePages.map((page) => (
                                            <SelectItem key={page._id} value={page.slug}>
                                                {page.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={addPageLink}>Add Page</Button>
                            </div>

                            <div className="space-y-2">
                                {pageLinks.map((link, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="p-2 rounded-lg bg-amber-600 text-white">
                                            <span className="font-bold">{link.title[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{link.title}</div>
                                            <div className="text-xs text-gray-500">/page/{link.slug}</div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removePageLink(index)}
                                        >
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    {isLoading ? (
                        <ButtonLoading />
                    ) : (
                        <Button onClick={handleSubmit(onSubmit)}>Save Settings</Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FooterSettings
