'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from '@/lib/showToast'

const whatsappOrderSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().min(10, 'Address is required'),
    ordernote: z.string().optional()
})

const WhatsAppOrderModal = ({ isOpen, onClose, product, variant, selectedSize }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(whatsappOrderSchema),
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
            // Construct WhatsApp message
            const message = `
*New Order via WhatsApp*

*Product Details:*
Product: ${product?.name}
Color: ${variant?.color}
${selectedSize ? `Size: ${selectedSize}` : ''}
Price: ${variant?.sellingPrice?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
MRP: ${variant?.mrp?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}

*Customer Details:*
Name: ${data.name}
Phone: ${data.phone}
Address: ${data.address}
${data.ordernote ? `Note: ${data.ordernote}` : ''}

Thank you for your order!
            `.trim()

            // Encode message for URL
            const encodedMessage = encodeURIComponent(message)
            
            // WhatsApp number
            const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801810841539'
            
            // Open WhatsApp with pre-filled message
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
            
            window.open(whatsappUrl, '_blank')
            
            showToast('success', 'Opening WhatsApp...')
            onClose()
            
            // Optional: Save to database with orderSource: 'whatsapp'
            try {
                await fetch('/api/orders/direct', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        orderSource: 'whatsapp',
                        products: [{
                            productId: product._id,
                            variantId: variant._id,
                            name: product.name,
                            qty: 1,
                            mrp: variant.mrp,
                            sellingPrice: variant.sellingPrice
                        }]
                    })
                })
            } catch (error) {
                console.error('Error saving WhatsApp order:', error)
            }
            
        } catch (error) {
            console.error('Error with WhatsApp order:', error)
            showToast('error', 'Failed to open WhatsApp. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative z-[10000]'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold'>ওয়াটসঅ্যাপে অর্ডার করুন (Order on WhatsApp)</h2>
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
                            className='flex-1 bg-green-600 hover:bg-green-700 rounded-full'
                        >
                            {isSubmitting ? 'Opening...' : 'Open WhatsApp'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default WhatsAppOrderModal
