'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import { showToast } from "@/lib/showToast"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { FaUpload, FaMagic, FaPalette, FaRobot, FaPlus, FaTrash, FaEdit, FaEye, FaSave, FaArrowRight, FaLayerGroup } from "react-icons/fa"
import { IoMdClose, IoMdSettings } from "react-icons/io"
import useFetch from "@/hooks/useFetch"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '/settings/pages', label: 'All Pages' },
    { href: '', label: 'Page Builder' },
]

const componentLibrary = [
    {
        id: 'heading',
        name: 'Heading',
        icon: '📝',
        description: 'Custom heading with animation',
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'paragraph',
        name: 'Paragraph',
        icon: '�',
        description: 'Text paragraph with styling',
        color: 'from-green-500 to-green-600'
    },
    {
        id: 'image',
        name: 'Image',
        icon: '🖼️',
        description: 'Image with animation and caption',
        color: 'from-pink-500 to-rose-600'
    },
    {
        id: 'divider',
        name: 'Divider',
        icon: '➖',
        description: 'Horizontal line with style',
        color: 'from-slate-500 to-slate-600'
    },
    {
        id: 'link',
        name: 'Link',
        icon: '🔗',
        description: 'Clickable link with animation',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'color',
        name: 'Color Block',
        icon: '🎨',
        description: 'Colored section with animation',
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'button',
        name: 'Button',
        icon: '�',
        description: 'Call-to-action button with animation',
        color: 'from-cyan-500 to-blue-600'
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: '↕️',
        description: 'Vertical space between elements',
        color: 'from-gray-500 to-gray-600'
    },
    {
        id: 'hero',
        name: 'Hero Section',
        icon: '🎯',
        description: 'Large hero banner with animation',
        color: 'from-blue-500 to-purple-600'
    },
    {
        id: 'text',
        name: 'Text Block',
        icon: '📝',
        description: 'Rich text content block',
        color: 'from-green-500 to-teal-600'
    },
    {
        id: 'section',
        name: 'Section',
        icon: '�',
        description: 'Container section with background',
        color: 'from-cyan-500 to-blue-600'
    },
    {
        id: 'video',
        name: 'Video',
        icon: '🎬',
        description: 'Video embed with animation',
        color: 'from-red-500 to-pink-600'
    }
]

const PageBuilder = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [pageTitle, setPageTitle] = useState('')
    const [pageSlug, setPageSlug] = useState('')
    const [pageDescription, setPageDescription] = useState('')
    const [featuredImage, setFeaturedImage] = useState('')
    const [metaTitle, setMetaTitle] = useState('')
    const [metaDescription, setMetaDescription] = useState('')
    const [metaKeywords, setMetaKeywords] = useState('')
    const [components, setComponents] = useState([])
    const [selectedComponent, setSelectedComponent] = useState(null)
    const [selectedCategories, setSelectedCategories] = useState([])
    const [relatedCategories, setRelatedCategories] = useState([])
    const [relatedProducts, setRelatedProducts] = useState([])
    const [pageStyles, setPageStyles] = useState({
        animation: 'none',
        animationDuration: '0.3s',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        shadow: 'none',
        borderRadius: '0px',
        fontFamily: 'default'
    })
    const { data: categoriesData } = useFetch('/api/admin/categories', 'GET')
    const { data: productsData } = useFetch('/api/admin/products', 'GET')
    const { data: existingPages } = useFetch('/api/admin/pagebuilder?pageType=page', 'GET')

    const availableCategories = categoriesData?.data || []
    const availableProducts = productsData?.data || []
    const existingSlugs = existingPages?.data?.map(p => p.slug) || []

    useEffect(() => {
        if (pageTitle) {
            let slug = pageTitle
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
            
            // Check for conflicts and make unique
            let counter = 1
            let uniqueSlug = slug
            while (existingSlugs.includes(uniqueSlug)) {
                uniqueSlug = `${slug}-${counter}`
                counter++
            }
            
            setPageSlug(uniqueSlug)
        }
    }, [pageTitle, existingSlugs])

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
                setFeaturedImage(result.data.url)
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

    const handleAIGenerate = async () => {
        if (!pageTitle) {
            showToast('error', 'Please enter a page title first')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/ai/generate-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: pageTitle, description: pageDescription })
            })
            const result = await response.json()
            
            if (result.success) {
                setComponents(result.data.components || [])
                setPageDescription(result.data.description || pageDescription)
                showToast('success', 'Page content generated successfully')
            } else {
                showToast('error', result.message || 'Failed to generate content')
            }
        } catch (error) {
            showToast('error', 'An error occurred')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    const handleDragEnd = (result) => {
        if (!result.destination) return

        const items = Array.from(components)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setComponents(items.map((item, index) => ({ ...item, order: index })))
    }

    const addComponent = (componentType) => {
        const newComponent = {
            type: componentType,
            content: getDefaultContent(componentType),
            styles: getDefaultStyles(componentType),
            order: components.length
        }
        setComponents([...components, newComponent])
    }

    const removeComponent = (index) => {
        const newComponents = components.filter((_, i) => i !== index)
        setComponents(newComponents.map((item, i) => ({ ...item, order: i })))
    }

    const updateComponent = (index, field, value) => {
        const newComponents = [...components]
        if (field === 'content') {
            newComponents[index] = { ...newComponents[index], content: value }
        } else if (field === 'styles') {
            newComponents[index] = { ...newComponents[index], styles: value }
        }
        setComponents(newComponents)
    }

    const getDefaultContent = (type) => {
        switch (type) {
            case 'heading':
                return { 
                    text: 'Heading Text', 
                    level: 'h2',
                    align: 'left',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'paragraph':
                return { 
                    text: 'Your paragraph text here...', 
                    align: 'left',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'image':
                return { 
                    url: '', 
                    alt: 'Image description', 
                    caption: '',
                    animation: 'none',
                    animationDelay: '0s',
                    rounded: false
                }
            case 'divider':
                return { 
                    color: '#e5e7eb', 
                    thickness: '1px',
                    style: 'solid',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'link':
                return { 
                    text: 'Link Text', 
                    url: '/',
                    openInNewTab: false,
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'color':
                return { 
                    backgroundColor: '#3b82f6',
                    height: '100px',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'button':
                return { 
                    text: 'Click Me', 
                    link: '/', 
                    variant: 'primary',
                    size: 'medium',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'spacer':
                return { 
                    height: '40px',
                    animation: 'none'
                }
            case 'hero':
                return { 
                    title: 'Welcome to Our Page', 
                    subtitle: 'Your subtitle here', 
                    buttonText: 'Get Started', 
                    buttonLink: '/',
                    animation: 'fade-in',
                    animationDelay: '0s'
                }
            case 'text':
                return { 
                    text: 'Your text content here...',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'section':
                return { 
                    backgroundColor: '#ffffff', 
                    padding: '40px',
                    animation: 'none',
                    animationDelay: '0s'
                }
            case 'video':
                return { 
                    url: '', 
                    type: 'embed',
                    animation: 'none',
                    animationDelay: '0s'
                }
            default:
                return {}
        }
    }

    const getDefaultStyles = (type) => {
        return {
            padding: '16px',
            margin: '0',
            backgroundColor: 'transparent',
            textColor: '#000000'
        }
    }

    const handleSave = async () => {
        if (!pageTitle || !pageSlug) {
            showToast('error', 'Title and slug are required')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/pagebuilder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: pageTitle,
                    slug: pageSlug,
                    description: pageDescription,
                    featuredImage: featuredImage,
                    pageType: 'page',
                    components: components,
                    categories: selectedCategories,
                    relatedCategories: relatedCategories,
                    relatedProducts: relatedProducts,
                    styles: pageStyles,
                    metaTitle: metaTitle,
                    metaDescription: metaDescription,
                    metaKeywords: metaKeywords,
                    isActive: true,
                    isPublished: false
                })
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Page created successfully')
                window.location.href = '/settings/pages'
            } else {
                showToast('error', result.message || 'Failed to create page')
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Component Library - Collapsible on mobile */}
                <Card className="lg:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <FaLayerGroup className="text-xl" />
                            <h4 className='text-lg font-semibold'>Components</h4>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 lg:p-4 space-y-2 lg:space-y-3 max-h-[60vh] overflow-y-auto">
                        {componentLibrary.map((component) => (
                            <Button
                                key={component.id}
                                variant="outline"
                                className="w-full justify-start h-auto py-2 lg:py-4 px-3 lg:px-4 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-400 group text-sm lg:text-base"
                                onClick={() => addComponent(component.id)}
                            >
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br ${component.color} flex items-center justify-center mr-2 lg:mr-3 shadow-md group-hover:scale-110 transition-transform`}>
                                    <span className="text-xl lg:text-2xl">{component.icon}</span>
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-xs lg:text-sm">{component.name}</div>
                                    <div className="text-xs text-gray-500 hidden lg:block">{component.description}</div>
                                </div>
                                <FaPlus className="ml-auto text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Page Builder Canvas */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Page Settings */}
                    <Card className="shadow-xl border-2 border-blue-100">
                        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <IoMdSettings className="text-xl" />
                                    <h4 className='text-lg font-semibold'>Page Settings</h4>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:from-pink-600 hover:to-rose-600 shadow-lg text-sm"
                                >
                                    <FaRobot className="mr-2" />
                                    {isGenerating ? 'Generating...' : 'AI Generate'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-5 bg-gradient-to-b from-white to-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="pageTitle" className="text-sm font-semibold text-gray-700">Page Title *</Label>
                                    <Input
                                        id="pageTitle"
                                        value={pageTitle}
                                        onChange={(e) => setPageTitle(e.target.value)}
                                        placeholder="Enter page title"
                                        className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pageSlug" className="text-sm font-semibold text-gray-700">Page Slug (Auto-generated) *</Label>
                                    <Input
                                        id="pageSlug"
                                        value={pageSlug}
                                        onChange={(e) => setPageSlug(e.target.value)}
                                        placeholder="page-slug"
                                        className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pageDescription" className="text-sm font-semibold text-gray-700">Description</Label>
                                <Textarea
                                    id="pageDescription"
                                    value={pageDescription}
                                    onChange={(e) => setPageDescription(e.target.value)}
                                    placeholder="Page description"
                                    rows={3}
                                    className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="featuredImage" className="text-sm font-semibold text-gray-700">Featured Image</Label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Input
                                            id="featuredImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        disabled={isUploading}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600 shadow-md"
                                    >
                                        {isUploading ? 'Uploading...' : <FaUpload />}
                                    </Button>
                                </div>
                                {featuredImage && (
                                    <div className="mt-3 flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                                        <img src={featuredImage} alt="Featured" className="w-20 h-20 object-contain rounded-lg shadow-md" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">Current Image</p>
                                            <p className="text-xs text-gray-500 truncate">{featuredImage.substring(0, 50)}...</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setFeaturedImage('')}
                                            className="rounded-full shadow-md"
                                        >
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* SEO Section */}
                            <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaRobot className="text-purple-600" />
                                    <h5 className="text-lg font-semibold text-gray-800">SEO Settings</h5>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaTitle" className="text-sm font-semibold text-gray-700">Meta Title</Label>
                                    <Input
                                        id="metaTitle"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="SEO meta title"
                                        className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaDescription" className="text-sm font-semibold text-gray-700">Meta Description</Label>
                                    <Textarea
                                        id="metaDescription"
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder="SEO meta description"
                                        rows={3}
                                        className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaKeywords" className="text-sm font-semibold text-gray-700">Meta Keywords</Label>
                                    <Input
                                        id="metaKeywords"
                                        value={metaKeywords}
                                        onChange={(e) => setMetaKeywords(e.target.value)}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Page Styles */}
                    <Card className="shadow-xl border-2 border-purple-100">
                        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <FaPalette className="text-xl" />
                                <h4 className='text-lg font-semibold'>Page Styles</h4>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-5 bg-gradient-to-b from-white to-purple-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="animation" className="text-sm font-semibold text-gray-700">Animation</Label>
                                    <Select
                                        value={pageStyles.animation}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, animation: value })}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                                            <SelectValue placeholder="Select animation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="fade">Fade</SelectItem>
                                            <SelectItem value="slide">Slide</SelectItem>
                                            <SelectItem value="zoom">Zoom</SelectItem>
                                            <SelectItem value="bounce">Bounce</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="primaryColor" className="text-sm font-semibold text-gray-700">Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={pageStyles.primaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, primaryColor: e.target.value })}
                                            className="w-16 h-10 border-2 rounded-lg cursor-pointer"
                                        />
                                        <Input
                                            value={pageStyles.primaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, primaryColor: e.target.value })}
                                            className="flex-1 border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryColor" className="text-sm font-semibold text-gray-700">Secondary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={pageStyles.secondaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, secondaryColor: e.target.value })}
                                            className="w-16 h-10 border-2 rounded-lg cursor-pointer"
                                        />
                                        <Input
                                            value={pageStyles.secondaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, secondaryColor: e.target.value })}
                                            className="flex-1 border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shadow" className="text-sm font-semibold text-gray-700">Shadow</Label>
                                    <Select
                                        value={pageStyles.shadow}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, shadow: value })}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                                            <SelectValue placeholder="Select shadow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="borderRadius" className="text-sm font-semibold text-gray-700">Border Radius</Label>
                                    <Input
                                        value={pageStyles.borderRadius}
                                        onChange={(e) => setPageStyles({ ...pageStyles, borderRadius: e.target.value })}
                                        placeholder="0px"
                                        className="border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fontFamily" className="text-sm font-semibold text-gray-700">Font Family</Label>
                                    <Select
                                        value={pageStyles.fontFamily}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, fontFamily: value })}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                                            <SelectValue placeholder="Select font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                            <SelectItem value="serif">Serif</SelectItem>
                                            <SelectItem value="monospace">Monospace</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card className="shadow-xl border-2 border-amber-100">
                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                            <h4 className='text-lg font-semibold'>Categories</h4>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 bg-gradient-to-b from-white to-amber-50">
                            <div className="flex flex-wrap gap-3">
                                {availableCategories.map((category) => (
                                    <Button
                                        key={category._id}
                                        type="button"
                                        variant={selectedCategories.includes(category._id) ? "default" : "outline"}
                                        onClick={() => handleCategoryToggle(category._id)}
                                        className={selectedCategories.includes(category._id) 
                                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md hover:from-amber-600 hover:to-orange-700" 
                                            : "border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all"}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                            {selectedCategories.length === 0 && (
                                <div className="text-center py-6 bg-amber-50 rounded-lg border-2 border-amber-200">
                                    <p className="text-amber-600 text-sm font-medium">No categories selected</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Related Categories & Products */}
                    <Card className="shadow-xl border-2 border-teal-100">
                        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
                            <h4 className='text-lg font-semibold'>Related Categories & Products</h4>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5 bg-gradient-to-b from-white to-teal-50">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Related Categories</Label>
                                <div className="flex flex-wrap gap-3">
                                    {availableCategories
                                        .filter(cat => !selectedCategories.includes(cat._id))
                                        .map((category) => (
                                            <Button
                                                key={category._id}
                                                type="button"
                                                variant={relatedCategories.includes(category._id) ? "default" : "outline"}
                                                onClick={() => {
                                                    setRelatedCategories(prev =>
                                                        prev.includes(category._id)
                                                            ? prev.filter(id => id !== category._id)
                                                            : [...prev, category._id]
                                                    )
                                                }}
                                                size="sm"
                                                className={relatedCategories.includes(category._id)
                                                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0 shadow-md"
                                                    : "border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all"}
                                            >
                                                {category.name}
                                            </Button>
                                        ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Related Products</Label>
                                <div className="flex flex-wrap gap-3">
                                    {availableProducts.map((product) => (
                                        <Button
                                            key={product._id}
                                            type="button"
                                            variant={relatedProducts.includes(product._id) ? "default" : "outline"}
                                            onClick={() => {
                                                setRelatedProducts(prev =>
                                                    prev.includes(product._id)
                                                        ? prev.filter(id => id !== product._id)
                                                        : [...prev, product._id]
                                                )
                                            }}
                                            size="sm"
                                            className={relatedProducts.includes(product._id)
                                                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0 shadow-md"
                                                : "border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all"}
                                        >
                                            {product.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Canvas */}
                    <Card className="shadow-xl border-2 border-indigo-100">
                        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <FaEdit className="text-xl" />
                                    <h4 className='text-lg font-semibold'>Page Canvas</h4>
                                </div>
                                {isLoading ? (
                                    <ButtonLoading />
                                ) : (
                                    <Button 
                                        onClick={handleSave}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-lg w-full sm:w-auto"
                                    >
                                        <FaSave className="mr-2" />
                                        Save Page
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 bg-gradient-to-b from-white to-indigo-50">
                            {components.length === 0 ? (
                                <div className="text-center py-16 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-200">
                                    <div className="mb-4">
                                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
                                            <FaPlus className="text-3xl text-indigo-500" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700 mb-2">Start building your page</p>
                                    <p className="text-gray-500">Drag components from the library or click to add</p>
                                </div>
                            ) : (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="canvas">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-4"
                                            >
                                                {components.map((component, index) => (
                                                    <Draggable
                                                        key={index}
                                                        draggableId={String(index)}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="border-2 border-dashed border-indigo-300 rounded-xl p-5 hover:border-indigo-500 hover:shadow-lg transition-all bg-white"
                                                            >
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl cursor-move text-gray-400 hover:text-indigo-500 transition-colors">⋮⋮</span>
                                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${componentLibrary.find(c => c.id === component.type)?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-md`}>
                                                                            <span className="text-xl">{componentLibrary.find(c => c.id === component.type)?.icon || '📦'}</span>
                                                                        </div>
                                                                        <span className="font-semibold text-gray-800 capitalize">{component.type}</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeComponent(index)}
                                                                        className="rounded-full shadow-md"
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </div>
                                                                <ComponentEditor
                                                                    component={component}
                                                                    onUpdate={(field, value) => updateComponent(index, field, value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const ComponentEditor = ({ component, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false)

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
                onUpdate('content', { ...component.content, url: result.data.url })
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

    const renderEditor = () => {
        switch (component.type) {
            case 'heading':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Heading Text</Label>
                            <Input
                                value={component.content.text || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, text: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Heading Level</Label>
                            <Select
                                value={component.content.level || 'h2'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="h1">H1</SelectItem>
                                    <SelectItem value="h2">H2</SelectItem>
                                    <SelectItem value="h3">H3</SelectItem>
                                    <SelectItem value="h4">H4</SelectItem>
                                    <SelectItem value="h5">H5</SelectItem>
                                    <SelectItem value="h6">H6</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Alignment</Label>
                            <Select
                                value={component.content.align || 'left'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, align: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'paragraph':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Paragraph Text</Label>
                            <Textarea
                                value={component.content.text || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, text: e.target.value })}
                                rows={5}
                            />
                        </div>
                        <div>
                            <Label>Alignment</Label>
                            <Select
                                value={component.content.align || 'left'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, align: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="justify">Justify</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'divider':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Color</Label>
                            <Input
                                type="color"
                                value={component.content.color || '#e5e7eb'}
                                onChange={(e) => onUpdate('content', { ...component.content, color: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Thickness</Label>
                            <Input
                                type="number"
                                value={component.content.thickness || '1'}
                                onChange={(e) => onUpdate('content', { ...component.content, thickness: e.target.value + 'px' })}
                            />
                        </div>
                        <div>
                            <Label>Style</Label>
                            <Select
                                value={component.content.style || 'solid'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, style: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="dashed">Dashed</SelectItem>
                                    <SelectItem value="dotted">Dotted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'link':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Link Text</Label>
                            <Input
                                value={component.content.text || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, text: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>URL</Label>
                            <Input
                                value={component.content.url || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, url: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={component.content.openInNewTab || false}
                                onChange={(e) => onUpdate('content', { ...component.content, openInNewTab: e.target.checked })}
                            />
                            <Label>Open in new tab</Label>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'color':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Background Color</Label>
                            <Input
                                type="color"
                                value={component.content.backgroundColor || '#3b82f6'}
                                onChange={(e) => onUpdate('content', { ...component.content, backgroundColor: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Height (px)</Label>
                            <Input
                                type="number"
                                value={component.content.height || '100'}
                                onChange={(e) => onUpdate('content', { ...component.content, height: e.target.value + 'px' })}
                            />
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'hero':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={component.content.title || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Input
                                value={component.content.subtitle || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, subtitle: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Button Text</Label>
                            <Input
                                value={component.content.buttonText || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, buttonText: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Button Link</Label>
                            <Input
                                value={component.content.buttonLink || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, buttonLink: e.target.value })}
                            />
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'text':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Text Content</Label>
                            <Textarea
                                value={component.content.text || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, text: e.target.value })}
                                rows={5}
                            />
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'image':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Upload Image</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                                <Button type="button" variant="outline" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : <FaUpload />}
                                </Button>
                            </div>
                        </div>
                        {component.content.url && (
                            <div className="mt-2">
                                <img src={component.content.url} alt="Preview" className="max-w-full h-32 object-cover rounded" />
                            </div>
                        )}
                        <div>
                            <Label>Or Enter Image URL</Label>
                            <Input
                                value={component.content.url || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <Label>Alt Text</Label>
                            <Input
                                value={component.content.alt || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, alt: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={component.content.rounded || false}
                                onChange={(e) => onUpdate('content', { ...component.content, rounded: e.target.checked })}
                            />
                            <Label>Rounded corners</Label>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'button':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Button Text</Label>
                            <Input
                                value={component.content.text || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, text: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Button Link</Label>
                            <Input
                                value={component.content.link || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, link: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Variant</Label>
                            <Select
                                value={component.content.variant || 'primary'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, variant: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="outline">Outline</SelectItem>
                                    <SelectItem value="ghost">Ghost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Size</Label>
                            <Select
                                value={component.content.size || 'medium'}
                                onValueChange={(value) => onUpdate('content', { ...component.content, size: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'spacer':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Height (px)</Label>
                            <Input
                                type="number"
                                value={component.content.height || '40'}
                                onChange={(e) => onUpdate('content', { ...component.content, height: e.target.value + 'px' })}
                            />
                        </div>
                    </div>
                )
            case 'section':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Background Color</Label>
                            <Input
                                type="color"
                                value={component.content.backgroundColor || '#ffffff'}
                                onChange={(e) => onUpdate('content', { ...component.content, backgroundColor: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Padding (px)</Label>
                            <Input
                                type="number"
                                value={component.content.padding || '40'}
                                onChange={(e) => onUpdate('content', { ...component.content, padding: e.target.value + 'px' })}
                            />
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            case 'video':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Video URL</Label>
                            <Input
                                value={component.content.url || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, url: e.target.value })}
                                placeholder="YouTube or Vimeo URL"
                            />
                        </div>
                        <AnimationSelector
                            animation={component.content.animation || 'none'}
                            delay={component.content.animationDelay || '0s'}
                            onAnimationChange={(animation) => onUpdate('content', { ...component.content, animation })}
                            onDelayChange={(animationDelay) => onUpdate('content', { ...component.content, animationDelay })}
                        />
                    </div>
                )
            default:
                return <p className="text-gray-500">No editor available for this component type</p>
        }
    }

    const AnimationSelector = ({ animation, delay, onAnimationChange, onDelayChange }) => (
        <div className="space-y-2 pt-2 border-t border-gray-200">
            <div>
                <Label>Animation</Label>
                <Select value={animation} onValueChange={onAnimationChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade-in">Fade In</SelectItem>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="slide-down">Slide Down</SelectItem>
                        <SelectItem value="slide-left">Slide Left</SelectItem>
                        <SelectItem value="slide-right">Slide Right</SelectItem>
                        <SelectItem value="zoom-in">Zoom In</SelectItem>
                        <SelectItem value="zoom-out">Zoom Out</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                        <SelectItem value="rotate">Rotate</SelectItem>
                        <SelectItem value="flip">Flip</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {animation !== 'none' && (
                <div>
                    <Label>Animation Delay</Label>
                    <Input
                        type="number"
                        value={delay}
                        onChange={(e) => onDelayChange(e.target.value + 's')}
                        placeholder="0"
                        min="0"
                        step="0.1"
                    />
                </div>
            )}
        </div>
    )

    return renderEditor()
}

export default PageBuilder
