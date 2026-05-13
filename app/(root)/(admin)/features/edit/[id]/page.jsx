'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_FEATURES_SHOW, ADMIN_FEATURES_EDIT, ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { useParams } from "next/navigation"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FEATURES_SHOW, label: 'Features' },
    { href: '', label: 'Edit Feature' },
]

const EditFeature = () => {
    const params = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const [featureData, setFeatureData] = useState(null)
    const { register, handleSubmit, setValue, formState: { errors } } = useForm()

    useEffect(() => {
        const fetchFeature = async () => {
            try {
                const response = await fetch(`/api/admin/features/${params.id}`)
                const result = await response.json()
                if (result.success) {
                    setFeatureData(result.data)
                    // Set form values
                    setValue('title', result.data.title)
                    setValue('description', result.data.description)
                    setValue('icon', result.data.icon)
                    setValue('color', result.data.color)
                    setValue('link', result.data.link)
                    setValue('buttonText', result.data.buttonText)
                    setValue('order', result.data.order)
                    setValue('isActive', result.data.isActive)
                }
            } catch (error) {
                showToast('error', 'Failed to fetch feature data')
            }
        }
        fetchFeature()
    }, [params.id, setValue])

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/features/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Feature updated successfully')
                window.location.href = ADMIN_FEATURES_SHOW
            } else {
                showToast('error', result.message || 'Failed to update feature')
            }
        } catch (error) {
            showToast('error', 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (!featureData) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <h4 className='text-xl font-semibold'>Edit Feature</h4>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    {...register('title', { required: 'Title is required' })}
                                    placeholder="Enter feature title"
                                    defaultValue={featureData.title}
                                />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon *</Label>
                                <Select onValueChange={(value) => setValue('icon', value)} defaultValue={featureData.icon}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GiReturnArrow">GiReturnArrow</SelectItem>
                                        <SelectItem value="FaShippingFast">FaShippingFast</SelectItem>
                                        <SelectItem value="BiSupport">BiSupport</SelectItem>
                                        <SelectItem value="TbRosetteDiscountFilled">TbRosetteDiscountFilled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.icon && <p className="text-red-500 text-sm">{errors.icon.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Color *</Label>
                                <Select onValueChange={(value) => setValue('color', value)} defaultValue={featureData.color}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="orange">Orange</SelectItem>
                                        <SelectItem value="red">Red</SelectItem>
                                        <SelectItem value="pink">Pink</SelectItem>
                                        <SelectItem value="indigo">Indigo</SelectItem>
                                        <SelectItem value="teal">Teal</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.color && <p className="text-red-500 text-sm">{errors.color.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    {...register('order', { valueAsNumber: true })}
                                    placeholder="Enter display order"
                                    defaultValue={featureData.order}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                {...register('description', { required: 'Description is required' })}
                                placeholder="Enter feature description"
                                rows={3}
                                defaultValue={featureData.description}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="link">Link *</Label>
                                <Input
                                    id="link"
                                    {...register('link', { required: 'Link is required' })}
                                    placeholder="Enter link URL"
                                    defaultValue={featureData.link}
                                />
                                {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="buttonText">Button Text *</Label>
                                <Input
                                    id="buttonText"
                                    {...register('buttonText', { required: 'Button text is required' })}
                                    placeholder="Enter button text"
                                    defaultValue={featureData.buttonText}
                                />
                                {errors.buttonText && <p className="text-red-500 text-sm">{errors.buttonText.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register('isActive')}
                                defaultChecked={featureData.isActive}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>

                        <div className="flex gap-4">
                            {isLoading ? (
                                <ButtonLoading />
                            ) : (
                                <Button type="submit">Update Feature</Button>
                            )}
                            <Button type="button" variant="outline" asChild>
                                <Link href={ADMIN_FEATURES_SHOW}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditFeature
