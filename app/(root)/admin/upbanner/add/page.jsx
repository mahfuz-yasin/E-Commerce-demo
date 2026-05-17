'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ADMIN_DASHBOARD, ADMIN_UPBANNER } from "@/routes/AdminPanelRoute"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { FaUpload } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import axios from "axios"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_UPBANNER, label: 'Up Banner' },
    { href: '', label: 'Add Banner' },
]

const AddUpBanner = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [bannerImage, setBannerImage] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()

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

    const removeBannerImage = () => {
        setBannerImage('')
        setValue('imageUrl', '')
    }

    const onSubmit = async (data) => {
        if (!bannerImage) {
            showToast('error', 'Please upload a banner image')
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post('/api/admin/upbanner', {
                ...data,
                imageUrl: bannerImage
            })

            if (response.data.success) {
                showToast('success', 'Banner added successfully')
                window.location.href = ADMIN_UPBANNER
            } else {
                showToast('error', response.data.message || 'Failed to add banner')
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
                    <h4 className='text-xl font-semibold'>Add Up Banner</h4>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Banner Title</Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="Enter banner title"
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Banner Link (Optional)</Label>
                            <Input
                                id="link"
                                {...register('link')}
                                placeholder="Enter banner link URL"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Banner Image *</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="order">Order</Label>
                            <Input
                                id="order"
                                type="number"
                                {...register('order')}
                                defaultValue={0}
                                placeholder="Enter order (lower number shows first)"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register('isActive')}
                                defaultChecked={true}
                            />
                            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                        </div>

                        <div className="flex gap-4">
                            {isLoading ? (
                                <ButtonLoading />
                            ) : (
                                <Button type="submit">Add Banner</Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddUpBanner
