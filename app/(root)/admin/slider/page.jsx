'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import useDeleteMutation from '@/hooks/useDeleteMutation'
import { ADMIN_DASHBOARD, ADMIN_SLIDER } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoMdAdd } from 'react-icons/io'
import { z } from 'zod'
import MediaModal from '@/components/Application/Admin/MediaModal'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Slider Management' },
]

const sliderSchema = z.object({
    heading: z.string().min(3, 'Heading must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    buttonText: z.string().min(2, 'Button text is required'),
    buttonLink: z.string().min(1, 'Button link is required'),
    imageUrl: z.string().min(1, 'Image is required'),
    publicId: z.string().min(1, 'Image is required'),
    isActive: z.boolean().default(true),
})

const SliderManagement = () => {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSlider, setEditingSlider] = useState(null)
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])

    const { data: slidersData, isLoading } = useQuery({
        queryKey: ['sliders'],
        queryFn: async () => {
            const { data } = await axios.get('/api/slider?deleteType=SD')
            return data
        }
    })

    const form = useForm({
        resolver: zodResolver(sliderSchema),
        defaultValues: {
            heading: '',
            description: '',
            buttonText: 'Shop Now',
            buttonLink: '/shop',
            imageUrl: '',
            publicId: '',
            isActive: true,
        }
    })

    const createMutation = useMutation({
        mutationFn: (data) => axios.post('/api/slider/create', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sliders'] })
            setIsDialogOpen(false)
            form.reset()
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data) => axios.put('/api/slider/update', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sliders'] })
            setIsDialogOpen(false)
            setEditingSlider(null)
            form.reset()
        }
    })

    const deleteMutation = useDeleteMutation('sliders', '/api/slider/delete')
    const restoreMutation = useMutation({
        mutationFn: (id) => axios.put('/api/slider/restore', { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sliders'] })
    })

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }) => axios.put('/api/slider/update', { _id: id, isActive }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sliders'] })
    })

    const onSubmit = (data) => {
        if (editingSlider) {
            updateMutation.mutate({ ...data, _id: editingSlider._id })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (slider) => {
        setEditingSlider(slider)
        form.reset({
            heading: slider.heading,
            description: slider.description,
            buttonText: slider.buttonText,
            buttonLink: slider.buttonLink,
            imageUrl: slider.imageUrl,
            publicId: slider.publicId,
            isActive: slider.isActive,
        })
        setIsDialogOpen(true)
    }

    const handleAddNew = () => {
        setEditingSlider(null)
        form.reset({
            heading: '',
            description: '',
            buttonText: 'Shop Now',
            buttonLink: '/shop',
            imageUrl: '',
            publicId: '',
            isActive: true,
        })
        setIsDialogOpen(true)
    }

    const handleMediaSelect = () => {
        if (selectedMedia.length > 0) {
            form.setValue('imageUrl', selectedMedia[0].secure_url)
            form.setValue('publicId', selectedMedia[0].public_id)
        }
        setIsMediaModalOpen(false)
        setSelectedMedia([])
    }

    // Handle media selection when modal closes
    React.useEffect(() => {
        if (!isMediaModalOpen && selectedMedia.length > 0) {
            form.setValue('imageUrl', selectedMedia[0].secure_url)
            form.setValue('publicId', selectedMedia[0].public_id)
            setSelectedMedia([])
        }
    }, [isMediaModalOpen, selectedMedia, form])

    const sliders = slidersData?.data?.sliders || []

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="px-5 py-4 border-b bg-muted/30">
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold text-xl uppercase'>Slider Management</h4>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleAddNew} className="cursor-pointer">
                                    <IoMdAdd className="mr-1" /> Add New Slide
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingSlider ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
                                </DialogHeader>
                                
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        {/* Image Upload */}
                                        <FormField
                                            control={form.control}
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Slider Image <span className='text-red-500'>*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            {field.value ? (
                                                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                                    <Image 
                                                                        src={field.value} 
                                                                        alt="Preview" 
                                                                        fill 
                                                                        className="object-cover"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-2 right-2"
                                                                        onClick={() => {
                                                                            form.setValue('imageUrl', '')
                                                                            form.setValue('publicId', '')
                                                                        }}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="w-full h-32 border-dashed"
                                                                    onClick={() => setIsMediaModalOpen(true)}
                                                                >
                                                                    Select from Media Library
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="heading"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Heading <span className='text-red-500'>*</span></FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter heading" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="buttonText"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Button Text</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Shop Now" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description <span className='text-red-500'>*</span></FormLabel>
                                                    <FormControl>
                                                        <textarea 
                                                            className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Enter description"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="buttonLink"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Button Link</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., /shop" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="isActive"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Active Status</FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsDialogOpen(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <ButtonLoading 
                                                type="submit" 
                                                className="flex-1 cursor-pointer"
                                                loading={createMutation.isPending || updateMutation.isPending}
                                                text={editingSlider ? 'Update Slide' : 'Create Slide'}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="pb-5 pt-4">
                    {isLoading ? (
                        <div className="text-center py-10">Loading sliders...</div>
                    ) : sliders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No sliders found. Add your first slide!</div>
                    ) : (
                        <div className="grid gap-4">
                            {sliders.map((slider, index) => (
                                <div key={slider._id} className="flex gap-4 p-4 border rounded-lg items-center">
                                    <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image 
                                            src={slider.imageUrl} 
                                            alt={slider.heading}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold truncate">{slider.heading}</h5>
                                        <p className="text-sm text-gray-500 truncate">{slider.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span className="text-gray-500">Order: {slider.sortOrder || index}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${slider.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {slider.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                checked={slider.isActive}
                                                onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: slider._id, isActive: checked })}
                                            />
                                            <span className="text-sm text-gray-500">{slider.isActive ? 'On' : 'Off'}</span>
                                        </div>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEdit(slider)}
                                        >
                                            Edit
                                        </Button>
                                        
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => deleteMutation.mutate({ ids: [slider._id], deleteType: 'SD' })}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <MediaModal 
                open={isMediaModalOpen} 
                setOpen={setIsMediaModalOpen}
                selectedMedia={selectedMedia}
                setSelectedMedia={setSelectedMedia}
                isMultiple={false}
            />
        </div>
    )
}

export default SliderManagement
