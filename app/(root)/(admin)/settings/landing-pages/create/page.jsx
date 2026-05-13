'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '/settings/landing-pages', label: 'All Landing Pages' },
    { href: '', label: 'Create Landing Page' },
]

const CreateLandingPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type: 'landing_page' })
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Landing page created successfully')
                window.location.href = '/settings/landing-pages'
            } else {
                showToast('error', result.message || 'Failed to create landing page')
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
                    <h4 className='text-xl font-semibold'>Create Landing Page</h4>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="key">Page Key (slug) *</Label>
                            <Input
                                id="key"
                                {...register('key', { required: 'Page key is required' })}
                                placeholder="Enter page key (e.g., summer-sale)"
                            />
                            {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Page Title *</Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="Enter page title"
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Page Content (HTML) *</Label>
                            <Textarea
                                id="content"
                                {...register('content', { required: 'Content is required' })}
                                placeholder="Enter page content"
                                rows={10}
                            />
                            {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
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
                            <Label htmlFor="link">Page Link *</Label>
                            <Input
                                id="link"
                                {...register('link', { required: 'Link is required' })}
                                placeholder="Enter page link URL"
                            />
                            {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register('isActive')}
                                defaultChecked={true}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>

                        <div className="flex gap-4">
                            {isLoading ? (
                                <ButtonLoading />
                            ) : (
                                <Button type="submit">Create Landing Page</Button>
                            )}
                            <Button type="button" variant="outline" asChild>
                                <Link href="/settings/landing-pages">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateLandingPage
