'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { use, useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { sizes } from '@/lib/utils'
import ColorPicker from '@/components/ui/ColorPicker'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

// Function to generate unique SKU
const generateSKU = (productName, colors) => {
  if (!productName || colors.length === 0) return ''
  
  const namePrefix = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  const colorCodes = colors.map(c => c.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)).join('')
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
  const timeCode = Date.now().toString(36).slice(-2).toUpperCase()
  
  return `${namePrefix}-${colorCodes}-${randomCode}${timeCode}`
}

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Edit Product Variant' },
]

const EditProductVariant = ({ params }) => {
  const { id } = use(params)

  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')
  const { data: getVariant, loading: getVariantLoading } = useFetch(`/api/product-variant/get/${id}`)

  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  useEffect(() => {
    if (getProduct && getProduct.success) {
      const data = getProduct.data
      const options = data.map((product) => ({ label: product.name, value: product._id }))
      setProductOption(options)
    }
  }, [getProduct])

  const formSchema = zSchema.pick({
    _id: true,
    product: true,
    sku: true,
    size: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      product: "",
      sku: "",
      size: [],
      mrp: "",
      sellingPrice: "",
      discountPercentage: "",
    },
  })

  useEffect(() => {
    if (getVariant && getVariant.success) {
      const variant = getVariant.data
      form.reset({
        _id: variant?._id,
        product: variant?.product?._id || variant?.product,
        sku: variant?.sku,
        size: variant?.size || [],
        mrp: variant?.mrp,
        sellingPrice: variant?.sellingPrice,
        discountPercentage: variant?.discountPercentage,
      })
      
      if (variant.colors) {
        setSelectedColors(variant.colors)
      }
      
      if (variant.media) {
        const media = variant.media.map((m) => ({ _id: m._id, url: m.secure_url }))
        setSelectedMedia(media)
      }
    }
  }, [getVariant, form])

  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

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

      const { data: response } = await axios.put('/api/product-variant/update', values)
      if (!response.success) {
        throw new Error(response.message)
      }

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
        <CardHeader className="px-5 py-4 border-b bg-muted/30">
          <h4 className='text-sm font-semibold text-foreground'>Edit Product Variant</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>

                <div className=''>
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={productOption}
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
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU<span className='text-red-500'>*</span></FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="text" placeholder="Enter sku" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const product = form.getValues('product')
                              const selectedProduct = productOption.find(p => p.value === product)
                              if (selectedProduct && selectedColors.length > 0) {
                                const newSKU = generateSKU(selectedProduct.label, selectedColors)
                                form.setValue('sku', newSKU)
                              }
                            }}
                            disabled={!form.getValues('product') || selectedColors.length === 0}
                            title="Regenerate SKU"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='md:col-span-2'>
                  <div className='border rounded-lg p-5 bg-gray-50/50'>
                    <div className='mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>Colors <span className='text-red-500'>*</span></h3>
                      <p className='text-sm text-gray-500'>Select one or more colors for this product variant</p>
                    </div>
                    <ColorPicker
                      selectedColors={selectedColors}
                      onChange={setSelectedColors}
                    />
                  </div>
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={sizes}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={true}
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
                <div className='mb-3'>
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
                <ButtonLoading loading={loading} type="submit" text="Save Changes" className="cursor-pointer" />
              </div>

            </form>
          </Form>

        </CardContent>
      </Card>

    </div>
  )
}

export default EditProductVariant
