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
    { href: '', label: 'Header' },
]

const HeaderSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type: 'header', key: 'main_header' })
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Header settings saved successfully')
            } else {
                showToast('error', result.message || 'Failed to save header settings')
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

            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-4 border-b bg-muted/30">
                    <h4 className='text-sm font-semibold text-foreground'>Header Settings</h4>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Logo Text</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Enter logo text"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Navigation Links (HTML)</Label>
                            <Textarea
                                id="content"
                                {...register('content')}
                                placeholder="Enter navigation HTML"
                                rows={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Logo Link</Label>
                            <Input
                                id="link"
                                {...register('link')}
                                placeholder="Enter logo link URL"
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

export default HeaderSettings
