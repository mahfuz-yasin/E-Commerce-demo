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
import { FaUpload, FaMagic, FaPalette, FaRobot } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import useFetch from "@/hooks/useFetch"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '/settings/pages', label: 'All Pages' },
    { href: '', label: 'Page Builder' },
]

const componentLibrary = [
    {
        id: 'hero',
        name: 'Hero Section',
        icon: '🎯',
        description: 'Large hero banner with title and CTA'
    },
    {
        id: 'text',
        name: 'Text Block',
        icon: '📝',
        description: 'Rich text content block'
    },
    {
        id: 'image',
        name: 'Image',
        icon: '🖼️',
        description: 'Image with optional caption'
    },
    {
        id: 'button',
        name: 'Button',
        icon: '🔘',
        description: 'Call-to-action button'
    },
    {
        id: 'section',
        name: 'Section',
        icon: '📦',
        description: 'Container section with background'
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: '↕️',
        description: 'Vertical space between elements'
    },
    {
        id: 'divider',
        name: 'Divider',
        icon: '➖',
        description: 'Horizontal line separator'
    },
    {
        id: 'video',
        name: 'Video',
        icon: '🎬',
        description: 'Video embed or upload'
    },
    {
        id: 'gallery',
        name: 'Gallery',
        icon: '🖼️',
        description: 'Image grid gallery'
    },
    {
        id: 'form',
        name: 'Form',
        icon: '📋',
        description: 'Contact or lead generation form'
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
            case 'hero':
                return { title: 'Welcome to Our Page', subtitle: 'Your subtitle here', buttonText: 'Get Started', buttonLink: '/' }
            case 'text':
                return { text: 'Your text content here...' }
            case 'image':
                return { url: '', alt: 'Image description', caption: '' }
            case 'button':
                return { text: 'Click Me', link: '/', variant: 'primary' }
            case 'section':
                return { backgroundColor: '#ffffff', padding: '40px' }
            case 'spacer':
                return { height: '40px' }
            case 'divider':
                return { color: '#e5e7eb', thickness: '1px' }
            case 'video':
                return { url: '', type: 'embed' }
            case 'gallery':
                return { images: [] }
            case 'form':
                return { fields: [] }
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Component Library */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <h4 className='text-lg font-semibold'>Components</h4>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {componentLibrary.map((component) => (
                            <Button
                                key={component.id}
                                variant="outline"
                                className="w-full justify-start h-auto py-3"
                                onClick={() => addComponent(component.id)}
                            >
                                <span className="text-2xl mr-2">{component.icon}</span>
                                <div className="text-left">
                                    <div className="font-medium">{component.name}</div>
                                    <div className="text-xs text-gray-500">{component.description}</div>
                                </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Page Builder Canvas */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Page Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h4 className='text-lg font-semibold'>Page Settings</h4>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                                >
                                    <FaMagic className="mr-2" />
                                    {isGenerating ? 'Generating...' : 'AI Generate'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pageTitle">Page Title *</Label>
                                    <Input
                                        id="pageTitle"
                                        value={pageTitle}
                                        onChange={(e) => setPageTitle(e.target.value)}
                                        placeholder="Enter page title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pageSlug">Page Slug (Auto-generated) *</Label>
                                    <Input
                                        id="pageSlug"
                                        value={pageSlug}
                                        onChange={(e) => setPageSlug(e.target.value)}
                                        placeholder="page-slug"
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pageDescription">Description</Label>
                                <Textarea
                                    id="pageDescription"
                                    value={pageDescription}
                                    onChange={(e) => setPageDescription(e.target.value)}
                                    placeholder="Page description"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="featuredImage">Featured Image</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            id="featuredImage"
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
                                {featuredImage && (
                                    <div className="mt-2 flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <img src={featuredImage} alt="Featured" className="w-16 h-16 object-contain rounded" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Current Image</p>
                                            <p className="text-xs text-gray-500 truncate">{featuredImage.substring(0, 50)}...</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setFeaturedImage('')}
                                        >
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Page Styles */}
                    <Card>
                        <CardHeader>
                            <h4 className='text-lg font-semibold flex items-center gap-2'>
                                <FaPalette />
                                Page Styles
                            </h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="animation">Animation</Label>
                                    <Select
                                        value={pageStyles.animation}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, animation: value })}
                                    >
                                        <SelectTrigger>
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
                                    <Label htmlFor="primaryColor">Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={pageStyles.primaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, primaryColor: e.target.value })}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={pageStyles.primaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, primaryColor: e.target.value })}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={pageStyles.secondaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, secondaryColor: e.target.value })}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={pageStyles.secondaryColor}
                                            onChange={(e) => setPageStyles({ ...pageStyles, secondaryColor: e.target.value })}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shadow">Shadow</Label>
                                    <Select
                                        value={pageStyles.shadow}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, shadow: value })}
                                    >
                                        <SelectTrigger>
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
                                    <Label htmlFor="borderRadius">Border Radius</Label>
                                    <Input
                                        value={pageStyles.borderRadius}
                                        onChange={(e) => setPageStyles({ ...pageStyles, borderRadius: e.target.value })}
                                        placeholder="0px"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fontFamily">Font Family</Label>
                                    <Select
                                        value={pageStyles.fontFamily}
                                        onValueChange={(value) => setPageStyles({ ...pageStyles, fontFamily: value })}
                                    >
                                        <SelectTrigger>
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
                    <Card>
                        <CardHeader>
                            <h4 className='text-lg font-semibold'>Categories</h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {availableCategories.map((category) => (
                                    <Button
                                        key={category._id}
                                        type="button"
                                        variant={selectedCategories.includes(category._id) ? "default" : "outline"}
                                        onClick={() => handleCategoryToggle(category._id)}
                                        className={selectedCategories.includes(category._id) ? "bg-amber-600 hover:bg-amber-700" : ""}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                            {selectedCategories.length === 0 && (
                                <p className="text-gray-400 text-sm">No categories selected</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Related Categories & Products */}
                    <Card>
                        <CardHeader>
                            <h4 className='text-lg font-semibold'>Related Categories & Products</h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Related Categories</Label>
                                <div className="flex flex-wrap gap-2">
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
                                            >
                                                {category.name}
                                            </Button>
                                        ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Related Products</Label>
                                <div className="flex flex-wrap gap-2">
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
                                        >
                                            {product.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Canvas */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h4 className='text-lg font-semibold'>Page Canvas</h4>
                                {isLoading ? (
                                    <ButtonLoading />
                                ) : (
                                    <Button onClick={handleSave}>Save Page</Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {components.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-lg mb-2">Start building your page</p>
                                    <p>Drag components from the library or click to add</p>
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
                                                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors"
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xl cursor-move">⋮⋮</span>
                                                                        <span className="font-medium capitalize">{component.type}</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeComponent(index)}
                                                                    >
                                                                        Remove
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
                        <div>
                            <Label>Caption</Label>
                            <Input
                                value={component.content.caption || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, caption: e.target.value })}
                            />
                        </div>
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
                    </div>
                )
            case 'spacer':
                return (
                    <div className="space-y-3">
                        <div>
                            <Label>Height (px)</Label>
                            <Input
                                value={component.content.height || ''}
                                onChange={(e) => onUpdate('content', { ...component.content, height: e.target.value })}
                            />
                        </div>
                    </div>
                )
            default:
                return <p className="text-gray-500">No editor available for this component type</p>
        }
    }

    return renderEditor()
}

export default PageBuilder
