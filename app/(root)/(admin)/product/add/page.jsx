'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IoMdAdd, IoMdRemove } from 'react-icons/io'
import ColorPicker from '@/components/ui/ColorPicker'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Add Product' },
]

const AddProduct = () => {
  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')

  // media modal states  
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  useEffect(() => {
    if (getCategory && getCategory.success) {
      const data = getCategory.data
      const options = data.map((cat) => ({ label: cat.name, value: cat._id }))
      setCategoryOption(options)
    }
  }, [getCategory])

  const formSchema = zSchema.pick({
    name: true,
    slug: true,
    category: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    shortDescription: true,
    longDescription: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      shortDescription: "",
      longDescription: [{ header: "", paragraph: "" }],
    },
  })

  useEffect(() => {
    const name = form.getValues('name')
    if (name) {
      form.setValue('slug', slugify(name).toLowerCase())
    }
  }, [form.watch('name')])

  // discount percentage calculation 
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }

  }, [form.watch('mrp'), form.watch('sellingPrice')])

  // Dynamic longDescription handlers
  const addLongDescriptionSection = () => {
    const currentLongDescription = form.getValues('longDescription') || []
    form.setValue('longDescription', [...currentLongDescription, { header: "", paragraph: "" }])
  }

  const removeLongDescriptionSection = (index) => {
    const currentLongDescription = form.getValues('longDescription') || []
    if (currentLongDescription.length > 1) {
      const updated = currentLongDescription.filter((_, i) => i !== index)
      form.setValue('longDescription', updated)
    }
  }

  const updateLongDescription = (index, field, value) => {
    const currentLongDescription = form.getValues('longDescription') || []
    const updated = [...currentLongDescription]
    updated[index][field] = value
    form.setValue('longDescription', updated)
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select media.')
      }

      if (selectedColors.length <= 0) {
        return showToast('error', 'Please select at least one color.')
      }

      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds
      values.colors = selectedColors

      const { data: response } = await axios.post('/api/product/create', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      setSelectedColors([])
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
          <h4 className='text-xl font-semibold'>Add Product</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>

                <div className=''>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name<span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={categoryOption}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="mrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRP <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter MRP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter Selling Price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="number" readOnly placeholder="Enter Discount Percentage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a brief description (10+ characters)" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dynamic Long Description */}
                <div className='md:col-span-2'>
                  <div className='flex justify-between items-center mb-3'>
                    <FormLabel>Long Description <span className='text-red-500'>*</span></FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLongDescriptionSection}
                      className="cursor-pointer"
                    >
                      <IoMdAdd className="mr-1" /> Add Section
                    </Button>
                  </div>
                  
                  <div className='space-y-4'>
                    {form.watch('longDescription')?.map((section, index) => (
                      <div key={index} className='border rounded-lg p-4 bg-gray-50 dark:bg-card'>
                        <div className='flex justify-between items-center mb-3'>
                          <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            Section {index + 1}
                          </span>
                          {form.watch('longDescription').length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLongDescriptionSection(index)}
                              className="cursor-pointer"
                            >
                              <IoMdRemove className="mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className='space-y-3'>
                          <FormField
                            control={form.control}
                            name={`longDescription.${index}.header`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Header <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Enter section header"
                                    {...field}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`longDescription.${index}.paragraph`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Paragraph <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter section description (10+ characters)"
                                    className="min-h-[100px] mt-1"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Color Selection Section */}
              <div className='md:col-span-2'>
                <div className='border rounded-lg p-5 bg-gray-50/50'>
                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>Product Colors <span className='text-red-500'>*</span></h3>
                    <p className='text-sm text-gray-500'>Select one or more colors for this product</p>
                  </div>
                  <ColorPicker 
                    selectedColors={selectedColors} 
                    onChange={setSelectedColors} 
                  />
                </div>
              </div>

              <div className='md:col-span-2 border border-dashed rounded p-5 text-center'>
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />

                {selectedMedia.length > 0
                  && <div className='flex justify-center items-center flex-wrap mb-3 gap-2'>
                    {selectedMedia.map(media => (
                      <div key={media._id} className='h-24 w-24 border'>
                        <Image
                          src={media.url}
                          height={100}
                          width={100}
                          alt=''
                          className='size-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                }

                <div onClick={() => setOpen(true)} className='bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer'>
                  <span className='font-semibold'>Select Media</span>
                </div>

              </div>

              <div className='mb-3 mt-5'>
                <ButtonLoading loading={loading} type="submit" text="Add Product" className="cursor-pointer" />
              </div>

            </form>
          </Form>

        </CardContent>
      </Card>

    </div>
  )
}

export default AddProduct