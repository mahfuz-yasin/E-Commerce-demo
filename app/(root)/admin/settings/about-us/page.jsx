'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import axios from "axios"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '', label: 'About Us' },
]

const AboutUsSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [existingContent, setExistingContent] = useState(null)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()

    useEffect(() => {
        fetchAboutContent()
    }, [])

    const fetchAboutContent = async () => {
        setIsFetching(true)
        try {
            const response = await axios.get('/api/settings/about-us')
            if (response.data.success && response.data.data) {
                setExistingContent(response.data.data)
                setValue('content', response.data.data.content || '')
            }
        } catch (error) {
            console.error('Error fetching about content:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            let response
            if (existingContent) {
                response = await axios.put(`/api/admin/settings/${existingContent._id}`, {
                    ...data,
                    type: 'page',
                    key: 'about-us'
                })
            } else {
                response = await axios.post('/api/admin/settings', {
                    ...data,
                    type: 'page',
                    key: 'about-us'
                })
            }

            if (response.data.success) {
                showToast('success', 'About page content saved successfully')
                if (!existingContent) {
                    setExistingContent(response.data.data)
                }
            } else {
                showToast('error', response.data.message || 'Failed to save content')
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
                    <h4 className='text-xl font-semibold'>About Us Settings</h4>
                </CardHeader>
                <CardContent className="p-6">
                    {isFetching ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content (HTML supported)</label>
                                <textarea
                                    {...register('content', { required: 'Content is required' })}
                                    className="w-full min-h-[400px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Enter about us content..."
                                />
                                {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                            </div>

                            <div className="flex gap-4">
                                {isLoading ? (
                                    <ButtonLoading />
                                ) : (
                                    <Button type="submit">Save Content</Button>
                                )}
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AboutUsSettings
