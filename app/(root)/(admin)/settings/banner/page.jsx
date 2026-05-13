'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '', label: 'Banner' },
]

const BannerSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type: 'banner', key: 'promo_banner' })
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Banner settings saved successfully')
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
                            <Label htmlFor="imageUrl">Banner Image URL</Label>
                            <Input
                                id="imageUrl"
                                {...register('imageUrl')}
                                placeholder="Enter banner image URL"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Banner Link</Label>
                            <Input
                                id="link"
                                {...register('link')}
                                placeholder="Enter banner link URL"
                            />
                        </div>

                        <div className="flex gap-4">
                            {isLoading ? (
                                <ButtonLoading />
                            ) : (
                                <Button type="submit">Save Settings</Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default BannerSettings
