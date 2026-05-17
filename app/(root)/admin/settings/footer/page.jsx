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
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaUpload } from "react-icons/fa"
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
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm()
    const [existingFooter, setExistingFooter] = useState(null)
    const [socialLinks, setSocialLinks] = useState([])
    const [newSocialLink, setNewSocialLink] = useState({ platform: 'facebook', url: '' })
    const [pageLinks, setPageLinks] = useState([])
    const [newPageLink, setNewPageLink] = useState({ title: '', slug: '' })
    const { data: pagesData } = useFetch('/api/admin/pagebuilder?pageType=page', 'GET')
    const [availablePages, setAvailablePages] = useState([])
    const [logoImage, setLogoImage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const titleValue = watch('title', '')

    useEffect(() => {
        fetchFooterData()
    }, [])

    useEffect(() => {
        if (pagesData && pagesData.success && Array.isArray(pagesData.data)) {
            setAvailablePages(pagesData.data || [])
        }
    }, [pagesData])

    useEffect(() => {
        if (titleValue) {
            const slug = titleValue
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
            setValue('slug', slug)
        }
    }, [titleValue, setValue])

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const result = await response.json()
            
            if (result.success) {
                setLogoImage(result.data.url)
                setValue('logo', result.data.url)
                showToast('success', 'Image uploaded successfully')
            } else {
                showToast('error', 'Failed to upload image')
            }
        } catch (error) {
            showToast('error', 'An error occurred')
        } finally {
            setIsUploading(false)
        }
    }

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
                    setValue('slug', footer.slug || '')
                    
                    if (footer.logo) {
                        setLogoImage(footer.logo)
                        setValue('logo', footer.logo)
                    }
                    
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

    const removeLogo = () => {
        setLogoImage('')
        setValue('logo', '')
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
                                    <Label htmlFor="slug">Slug (Auto-generated)</Label>
                                    <Input
                                        id="slug"
                                        {...register('slug')}
                                        placeholder="company-slug"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="logo">Company Logo</Label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </div>
                                        <Button type="button" variant="outline" disabled={isUploading}>
                                            {isUploading ? 'Uploading...' : <FaUpload />}
                                        </Button>
                                    </div>
                                    {logoImage && (
                                        <div className="mt-2 flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <img src={logoImage} alt="Logo" className="w-16 h-16 object-contain rounded" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Current Logo</p>
                                                <p className="text-xs text-gray-500 truncate">{logoImage}</p>
                                            </div>
                                            <Button type="button" variant="destructive" size="sm" onClick={removeLogo}>
                                                <IoMdClose />
                                            </Button>
                                        </div>
                                    )}
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
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label className="mb-2">Platform</Label>
                                    <Select
                                        value={newSocialLink.platform}
                                        onValueChange={(value) => setNewSocialLink({ ...newSocialLink, platform: value })}
                                    >
                                        <SelectTrigger>
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
                                </div>
                                <div className="flex-[2]">
                                    <Label className="mb-2">URL</Label>
                                    <Input
                                        placeholder="Enter URL"
                                        value={newSocialLink.url}
                                        onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Button type="button" onClick={addSocialLink} className="w-full">
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {socialLinks.map((link, index) => {
                                    const platform = socialPlatforms.find(p => p.value === link.platform)
                                    const Icon = platform?.icon || FaFacebookF
                                    return (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                                            <div className={`p-2.5 rounded-lg ${platform?.color || 'bg-blue-600'} text-white shadow-sm`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="flex-1 text-sm">{link.url}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeSocialLink(index)}
                                                className="rounded-full"
                                            >
                                                <IoMdClose />
                                            </Button>
                                        </div>
                                    )
                                })}
                                {socialLinks.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No social media links added yet
                                    </div>
                                )}
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
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label className="mb-2">Select Page</Label>
                                    <Select
                                        value={newPageLink.slug}
                                        onValueChange={handlePageSelect}
                                    >
                                        <SelectTrigger>
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
                                </div>
                                <div>
                                    <Button type="button" onClick={addPageLink} className="w-full">
                                        Add Page
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {pageLinks.map((link, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-100 hover:border-amber-200 transition-all">
                                        <div className="p-2.5 rounded-lg bg-amber-600 text-white shadow-sm">
                                            <span className="font-bold">{link.title[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{link.title}</div>
                                            <div className="text-xs text-gray-500">/page/{link.slug}</div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removePageLink(index)}
                                            className="rounded-full"
                                        >
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                ))}
                                {pageLinks.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No page links added yet
                                    </div>
                                )}
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
