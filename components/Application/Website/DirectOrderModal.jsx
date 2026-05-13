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
import { BsCashCoin, BsPhone, BsCheckCircleFill } from "react-icons/bs"

const directOrderSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().min(10, 'Address is required'),
    ordernote: z.string().optional()
})

const DirectOrderModal = ({ isOpen, onClose, product, variant, selectedSize }) => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Payment Method State
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(['cod'])
    const [paymentDetails, setPaymentDetails] = useState({
        bkashNumber: '',
        bkashTransactionId: '',
        nagadNumber: '',
        nagadTransactionId: ''
    })

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
        // Validate payment details for bKash/Nagad
        if (selectedPaymentMethods.includes('bkash')) {
            if (!paymentDetails.bkashNumber || !paymentDetails.bkashTransactionId) {
                showToast('error', 'Please enter bKash number and transaction ID')
                return
            }
        }
        if (selectedPaymentMethods.includes('nagad')) {
            if (!paymentDetails.nagadNumber || !paymentDetails.nagadTransactionId) {
                showToast('error', 'Please enter Nagad number and transaction ID')
                return
            }
        }

        setIsSubmitting(true)
        try {
            const paymentMethodString = selectedPaymentMethods.length > 1 
                ? selectedPaymentMethods.join('+')
                : selectedPaymentMethods[0]

            const response = await axios.post('/api/orders/direct', {
                ...data,
                orderSource: 'direct',
                paymentMethod: paymentMethodString,
                paymentDetails: selectedPaymentMethods.includes('cod') ? null : {
                    bkash: selectedPaymentMethods.includes('bkash') ? {
                        number: paymentDetails.bkashNumber,
                        transactionId: paymentDetails.bkashTransactionId
                    } : null,
                    nagad: selectedPaymentMethods.includes('nagad') ? {
                        number: paymentDetails.nagadNumber,
                        transactionId: paymentDetails.nagadTransactionId
                    } : null
                },
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

                    {/* Payment Methods */}
                    <div className='border-t pt-4'>
                        <h3 className='text-base font-semibold mb-3 flex items-center gap-2'>
                            Payment Method
                        </h3>
                        <p className='text-xs text-gray-500 mb-3'>Select one or more payment methods</p>
                        
                        <div className='grid grid-cols-3 gap-2 mb-4'>
                            {/* bKash */}
                            <label className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                selectedPaymentMethods.includes('bkash') 
                                    ? 'border-pink-500 bg-pink-50' 
                                    : 'border-gray-200 hover:border-pink-300'
                            }`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={selectedPaymentMethods.includes('bkash')}
                                    onChange={() => {
                                        setSelectedPaymentMethods(prev => 
                                            prev.includes('bkash') 
                                                ? prev.filter(m => m !== 'bkash')
                                                : [...prev.filter(m => m !== 'cod'), 'bkash']
                                        )
                                    }}
                                />
                                <div className='flex flex-col items-center text-center'>
                                    <BsPhone size={20} className={selectedPaymentMethods.includes('bkash') ? 'text-pink-600' : 'text-pink-400'} />
                                    <span className='text-xs font-medium mt-1 text-pink-600'>bKash</span>
                                    {selectedPaymentMethods.includes('bkash') && (
                                        <BsCheckCircleFill className='absolute top-1 right-1 text-pink-500' size={12} />
                                    )}
                                </div>
                            </label>

                            {/* Nagad */}
                            <label className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                selectedPaymentMethods.includes('nagad') 
                                    ? 'border-orange-500 bg-orange-50' 
                                    : 'border-gray-200 hover:border-orange-300'
                            }`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={selectedPaymentMethods.includes('nagad')}
                                    onChange={() => {
                                        setSelectedPaymentMethods(prev => 
                                            prev.includes('nagad') 
                                                ? prev.filter(m => m !== 'nagad')
                                                : [...prev.filter(m => m !== 'cod'), 'nagad']
                                        )
                                    }}
                                />
                                <div className='flex flex-col items-center text-center'>
                                    <BsPhone size={20} className={selectedPaymentMethods.includes('nagad') ? 'text-orange-600' : 'text-orange-400'} />
                                    <span className='text-xs font-medium mt-1 text-orange-600'>Nagad</span>
                                    {selectedPaymentMethods.includes('nagad') && (
                                        <BsCheckCircleFill className='absolute top-1 right-1 text-orange-500' size={12} />
                                    )}
                                </div>
                            </label>

                            {/* COD */}
                            <label className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                selectedPaymentMethods.includes('cod') 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-green-300'
                            }`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={selectedPaymentMethods.includes('cod')}
                                    onChange={() => {
                                        setSelectedPaymentMethods(prev => {
                                            const hasCod = prev.includes('cod')
                                            if (hasCod) return prev.filter(m => m !== 'cod')
                                            return ['cod']
                                        })
                                    }}
                                />
                                <div className='flex flex-col items-center text-center'>
                                    <BsCashCoin size={20} className={selectedPaymentMethods.includes('cod') ? 'text-green-600' : 'text-green-400'} />
                                    <span className='text-xs font-medium mt-1 text-green-600'>COD</span>
                                    {selectedPaymentMethods.includes('cod') && (
                                        <BsCheckCircleFill className='absolute top-1 right-1 text-green-500' size={12} />
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* bKash Details */}
                        {selectedPaymentMethods.includes('bkash') && (
                            <div className='bg-pink-50 rounded-lg p-3 mb-3 border border-pink-200'>
                                <h4 className='font-medium text-pink-700 mb-2 text-sm'>bKash Details</h4>
                                <div className='space-y-2'>
                                    <Input
                                        type="tel"
                                        placeholder="bKash Number"
                                        value={paymentDetails.bkashNumber}
                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, bkashNumber: e.target.value }))}
                                        className="border-pink-200 text-sm"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Transaction ID"
                                        value={paymentDetails.bkashTransactionId}
                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, bkashTransactionId: e.target.value }))}
                                        className="border-pink-200 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Nagad Details */}
                        {selectedPaymentMethods.includes('nagad') && (
                            <div className='bg-orange-50 rounded-lg p-3 mb-3 border border-orange-200'>
                                <h4 className='font-medium text-orange-700 mb-2 text-sm'>Nagad Details</h4>
                                <div className='space-y-2'>
                                    <Input
                                        type="tel"
                                        placeholder="Nagad Number"
                                        value={paymentDetails.nagadNumber}
                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, nagadNumber: e.target.value }))}
                                        className="border-orange-200 text-sm"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Transaction ID"
                                        value={paymentDetails.nagadTransactionId}
                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, nagadTransactionId: e.target.value }))}
                                        className="border-orange-200 text-sm"
                                    />
                                </div>
                            </div>
                        )}
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
                            {isSubmitting ? 'Placing Order...' : `Order (${selectedPaymentMethods.includes('cod') ? 'COD' : 'Paid'})`}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DirectOrderModal
