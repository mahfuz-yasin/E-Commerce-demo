'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { useState, useEffect } from "react"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import axios from "axios"
import Editor from "@/components/Application/Admin/Editor"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '', label: 'About Us' },
]

const AboutUsSettings = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [existingContent, setExistingContent] = useState(null)
    const [editorContent, setEditorContent] = useState('')

    useEffect(() => {
        fetchAboutContent()
    }, [])

    const fetchAboutContent = async () => {
        setIsFetching(true)
        try {
            const response = await axios.get('/api/settings/about-us')
            if (response.data.success && response.data.data) {
                setExistingContent(response.data.data)
                setEditorContent(response.data.data.content || '')
            }
        } catch (error) {
            console.error('Error fetching about content:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const handleEditorChange = (event, editor) => {
        const data = editor.getData()
        setEditorContent(data)
    }

    const onSubmit = async () => {
        setIsLoading(true)
        try {
            let response
            if (existingContent) {
                response = await axios.put(`/api/admin/settings/${existingContent._id}`, {
                    content: editorContent,
                    type: 'page',
                    key: 'about-us'
                })
            } else {
                response = await axios.post('/api/admin/settings', {
                    content: editorContent,
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
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <div className="border border-gray-300 rounded-md">
                                    <Editor 
                                        onChange={handleEditorChange} 
                                        initialData={editorContent} 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {isLoading ? (
                                    <ButtonLoading />
                                ) : (
                                    <Button onClick={onSubmit}>Save Content</Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AboutUsSettings
