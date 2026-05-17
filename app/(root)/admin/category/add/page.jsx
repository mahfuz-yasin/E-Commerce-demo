'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import Image from 'next/image'
import MediaModal from '@/components/Application/Admin/MediaModal'
import { z } from 'zod'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' },
]

const AddCategory = () => {
  const [loading, setLoading] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const formSchema = zSchema.pick({
    name: true, slug: true
  }).extend({
    image: z.string().optional()
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
    },
  })

  useEffect(() => {
    const name = form.getValues('name')
    if (name) {
      form.setValue('slug', slugify(name).toLowerCase())
    }
  }, [form.watch('name')])

  // Handle media selection when modal closes
  useEffect(() => {
    if (!isMediaModalOpen && selectedMedia.length > 0) {
      form.setValue('image', selectedMedia[0]._id)
      setSelectedMedia([])
    }
  }, [isMediaModalOpen, selectedMedia, form])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data: response } = await axios.post('/api/category/create', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
          <h4 className='text-xl font-semibold'>Add Category</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm text-gray-500">Image selected (ID: {field.value})</span>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  form.setValue('image', '')
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
              </div>

              <div className='mb-3'>
                <ButtonLoading loading={loading} type="submit" text="Add Category" className="cursor-pointer" />
              </div>

            </form>
          </Form>

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

export default AddCategory