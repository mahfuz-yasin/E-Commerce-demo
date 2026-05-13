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

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '', label: 'Footer' },
]

const FooterSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()
    const [existingFooter, setExistingFooter] = useState(null)

    useEffect(() => {
        fetchFooterData()
    }, [])

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
                    setValue('link', footer.link || '')
                }
            }
        } catch (error) {
            console.error('Error fetching footer data:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const payload = {
                ...data,
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

                            <div className="space-y-2">
                                <Label htmlFor="link">Social Links (JSON)</Label>
                                <Textarea
                                    id="link"
                                    {...register('link')}
                                    placeholder='[{"platform": "facebook", "url": "#"}, {"platform": "whatsapp", "url": "https://wa.me/8801810841539"}]'
                                    rows={4}
                                />
                                <p className="text-xs text-gray-500">
                                    Example: platform, url pairs in JSON format
                                </p>
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

export default FooterSettings
