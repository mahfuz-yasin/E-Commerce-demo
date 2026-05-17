'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { FaUpload } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '', label: 'Banner' },
]

const BannerSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [existingBanner, setExistingBanner] = useState(null)
    const [bannerImage, setBannerImage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()

    useEffect(() => {
        fetchBannerData()
    }, [])

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
                setBannerImage(result.data.url)
                setValue('imageUrl', result.data.url)
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

    const fetchBannerData = async () => {
        setIsFetching(true)
        try {
            const response = await fetch('/api/admin/settings?type=banner')
            const result = await response.json()

            if (result.success && result.data && result.data.length > 0) {
                const banner = result.data.find(b => b.key === 'promo_banner')
                if (banner) {
                    setExistingBanner(banner)
                    setValue('title', banner.title || '')
                    setValue('content', banner.content || '')

                    if (banner.imageUrl) {
                        setBannerImage(banner.imageUrl)
                        setValue('imageUrl', banner.imageUrl)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching banner data:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const removeBannerImage = () => {
        setBannerImage('')
        setValue('imageUrl', '')
    }

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            let response
            if (existingBanner) {
                response = await fetch(`/api/admin/settings/${existingBanner._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, type: 'banner', key: 'promo_banner' })
                })
            } else {
                response = await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, type: 'banner', key: 'promo_banner' })
                })
            }

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Banner settings saved successfully')
                if (!existingBanner) {
                    setExistingBanner(result.data)
                }
            } else {
                showToast('error', result.message || 'Failed to save banner settings')
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

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <h4 className='text-xl font-semibold'>Banner Settings</h4>
                </CardHeader>
                <CardContent className="p-6">
                    {isFetching ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Banner Title</Label>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="Enter banner title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Banner Description</Label>
                                <Textarea
                                    id="content"
                                    {...register('content')}
                                    placeholder="Enter banner description"
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Banner Image</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            id="imageUrl"
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
                                {bannerImage && (
                                    <div className="mt-2 flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <img src={bannerImage} alt="Banner" className="w-32 h-20 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Current Banner</p>
                                            <p className="text-xs text-gray-500 truncate">{bannerImage}</p>
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={removeBannerImage}>
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {isLoading ? (
                                    <ButtonLoading />
                                ) : (
                                    <Button type="submit">Save Settings</Button>
                                )}
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default BannerSettings
