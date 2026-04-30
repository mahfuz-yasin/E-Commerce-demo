'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { WEBSITE_ORDER_DETAILS } from '@/routes/WebsiteRoute'
import { useRouter } from 'next/navigation'

const directOrderSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().min(10, 'Address is required'),
    ordernote: z.string().optional()
})

const DirectOrderModal = ({ isOpen, onClose, product, variant, selectedSize }) => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(directOrderSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            ordernote: ''
        }
    })

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post('/api/orders/direct', {
                ...data,
                orderSource: 'direct',
                products: [{
                    productId: product._id,
                    variantId: variant._id,
                    name: product.name,
                    qty: 1,
                    mrp: variant.mrp,
                    sellingPrice: variant.sellingPrice
                }]
            })

            if (response.data.success) {
                showToast('success', 'Order placed successfully!')
                onClose()
                router.push(WEBSITE_ORDER_DETAILS(response.data.data.order_id))
            } else {
                showToast('error', response.data.message || 'Failed to place order')
            }
        } catch (error) {
            console.error('Error placing direct order:', error)
            showToast('error', 'Failed to place order. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative z-[10000]'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold'>অর্ডার করুন (Order Now)</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-500 hover:text-gray-700 text-2xl'
                    >
                        &times;
                    </button>
                </div>

                {/* Product Summary */}
                <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                    <p className='font-semibold'>{product?.name}</p>
                    <p className='text-sm text-gray-600'>Color: {variant?.color}</p>
                    {selectedSize && <p className='text-sm text-gray-600'>Size: {selectedSize}</p>}
                    <p className='font-bold mt-2'>{variant?.sellingPrice?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Full Name *</label>
                        <Input
                            {...form.register('name')}
                            placeholder='Enter your full name'
                            className='w-full'
                        />
                        {form.formState.errors.name && (
                            <p className='text-red-500 text-sm mt-1'>{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>Phone Number *</label>
                        <Input
                            {...form.register('phone')}
                            placeholder='Enter your phone number'
                            className='w-full'
                        />
                        {form.formState.errors.phone && (
                            <p className='text-red-500 text-sm mt-1'>{form.formState.errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>Full Address *</label>
                        <Textarea
                            {...form.register('address')}
                            placeholder='Enter your full address'
                            className='w-full min-h-[100px]'
                        />
                        {form.formState.errors.address && (
                            <p className='text-red-500 text-sm mt-1'>{form.formState.errors.address.message}</p>
                        )}
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>Order Note (Optional)</label>
                        <Textarea
                            {...form.register('ordernote')}
                            placeholder='Any additional notes'
                            className='w-full min-h-[80px]'
                        />
                    </div>

                    <div className='flex gap-3 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            className='flex-1'
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='flex-1 bg-black rounded-full'
                        >
                            {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DirectOrderModal
