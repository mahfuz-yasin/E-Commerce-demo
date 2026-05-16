'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { WEBSITE_ORDER_DETAILS, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { clearCart } from '@/store/reducer/cartReducer'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React, { useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { IoCloseCircleSharp } from "react-icons/io5";
import { z } from 'zod'
import { FaShippingFast } from "react-icons/fa";
import { BsCashCoin, BsCreditCard, BsPhone, BsCheckCircleFill } from "react-icons/bs";
import { Textarea } from '@/components/ui/textarea'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { trackInitiateCheckout } from '@/components/FacebookPixel'
import { trackTikTokInitiateCheckout, generateTikTokEventId } from '@/components/TikTokPixel'
import { trackGA4BeginCheckout } from '@/lib/ga4-server'

import loading from '@/public/assets/images/loading.svg'
const breadCrumb = {
    title: 'Checkout',
    links: [
        { label: "Checkout" }
    ]
}
const Checkout = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const cart = useSelector(store => store?.cartStore || { products: [], count: 0 })
    const authStore = useSelector((store) => store?.authStore || { auth: null })
    const [verifiedCartData, setVerifiedCartData] = useState([])
    
    // Payment Method State
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(['cod'])
    const [paymentDetails, setPaymentDetails] = useState({
        bkashNumber: '',
        bkashTransactionId: '',
        nagadNumber: '',
        nagadTransactionId: ''
    })
    const { data: getVerifiedCartData } = useFetch('/api/cart-verification', 'POST', { data: cart.products })

    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    const [placingOrder, setPlacingOrder] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [orderDetails, setOrderDetails] = useState(null)
    useEffect(() => {
        if (getVerifiedCartData && getVerifiedCartData.success) {
            const cartData = getVerifiedCartData.data
            setVerifiedCartData(cartData)
        }
    }, [getVerifiedCartData])


    useEffect(() => {
        const cartProducts = cart.products

        const subTotalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)

        setSubTotal(subTotalAmount)
        setDiscount(discount)
        setTotalAmount(subTotalAmount)

        couponForm.setValue('minShoppingAmount', subTotalAmount)

    }, [cart])

    // Track InitiateCheckout event when cart has items
    useEffect(() => {
        if (cart.count > 0 && totalAmount > 0) {
            // Facebook Pixel tracking
            trackInitiateCheckout(
                totalAmount,
                'BDT',
                cart.count
            )
            
            // TikTok Pixel tracking (with same event_id for deduplication)
            const eventId = generateTikTokEventId()
            trackTikTokInitiateCheckout(
                totalAmount,
                'BDT',
                cart.count,
                eventId
            )

            // GA4 begin_checkout tracking
            try {
                trackGA4BeginCheckout(cart.products, totalAmount, null, authStore.auth?.userId)
            } catch (error) {
                console.error('GA4 begin_checkout tracking failed:', error)
            }
        }
    }, [cart.count, totalAmount])



    // coupon form 

    const couponFormSchema = zSchema.pick({
        code: true,
        minShoppingAmount: true
    })

    const couponForm = useForm({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: "",
            minShoppingAmount: subtotal
        }
    })

    const applyCoupon = async (values) => {
        setCouponLoading(true)
        try {
            const { data: response } = await axios.post('/api/coupon/apply', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            const discountPercentage = response.data.discountPercentage
            // get coupon discount amount 
            setCouponDiscountAmount((subtotal * discountPercentage) / 100)
            setTotalAmount(subtotal - ((subtotal * discountPercentage) / 100))
            showToast('success', response.message)
            setCouponCode(couponForm.getValues('code'))
            setIsCouponApplied(true)

            couponForm.resetField('code', '')
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setCouponLoading(false)
        }
    }

    const removeCoupon = () => {
        setIsCouponApplied(false)
        setCouponCode('')
        setCouponDiscountAmount(0)
        setTotalAmount(subtotal)
    }


    // place order 
    const orderFormSchema = z.object({
        name: z.string().min(2, 'Name is required'),
        phone: z.string().min(10, 'Phone number is required'),
        address: z.string().min(10, 'Address is required'),
        ordernote: z.string().optional(),
        userId: z.string().optional()
    })

    const orderForm = useForm({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            ordernote: '',
            userId: authStore?.auth?._id,
        }
    })


    useEffect(() => {
        if (authStore) {
            orderForm.setValue('userId', authStore?.auth?._id)
        }
    }, [authStore])

    const placeOrder = async (formData) => {
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

        setPlacingOrder(true)
        try {
            const products = verifiedCartData.map((cartItem) => (
                {
                    productId: cartItem.productId,
                    variantId: cartItem.variantId,
                    name: cartItem.name,
                    qty: cartItem.qty,
                    mrp: cartItem.mrp,
                    sellingPrice: cartItem.sellingPrice,
                }
            ))

            // Build payment method string
            const paymentMethodString = selectedPaymentMethods.length > 1 
                ? selectedPaymentMethods.join('+')
                : selectedPaymentMethods[0]

            const { data: orderResponseData } = await axios.post('/api/payment/save-cod-order', {
                ...formData,
                products: products,
                subtotal: subtotal,
                discount: discount,
                couponDiscountAmount: couponDiscountAmount,
                totalAmount: totalAmount,
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
                }
            })

            if (orderResponseData.success) {
                setOrderDetails({
                    orderId: orderResponseData.data.order_id,
                    totalAmount: totalAmount,
                    paymentMethods: selectedPaymentMethods,
                    paymentDetails: selectedPaymentMethods.includes('cod') ? null : paymentDetails
                })
                setShowConfirmation(true)
                dispatch(clearCart())
                orderForm.reset()
            } else {
                showToast('error', orderResponseData.message)
            }

        } catch (error) {
            console.error('Error in placeOrder:', error)
            showToast('error', error.message || 'Failed to place order. Please try again.')
        } finally {
            setPlacingOrder(false)
        }
    }

    const handleViewOrder = () => {
        setShowConfirmation(false)
        router.push(WEBSITE_ORDER_DETAILS(orderDetails.orderId))
    }

    return (
        <div>
            {/* Order Confirmation Modal */}
            {showConfirmation && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center'>
                        <div className='text-green-500 mb-4'>
                            <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                        <h2 className='text-2xl font-bold mb-2'>Order Placed Successfully!</h2>
                        <p className='text-gray-600 mb-4'>
                            Your order has been placed with {orderDetails?.paymentMethods?.map(m => 
                                m === 'bkash' ? 'bKash' : m === 'nagad' ? 'Nagad' : 'Cash on Delivery'
                            ).join(' + ')}.
                        </p>
                        <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                            <p className='text-sm text-gray-500'>Order ID</p>
                            <p className='font-semibold text-lg'>{orderDetails?.orderId}</p>
                            <p className='text-sm text-gray-500 mt-2'>Total Amount</p>
                            <p className='font-semibold text-lg'>{orderDetails?.totalAmount?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</p>
                        </div>
                        <Button onClick={handleViewOrder} className='w-full bg-black rounded-full px-5 cursor-pointer'>
                            View Order Details
                        </Button>
                    </div>
                </div>
            )}

            <div className="lg:px-32 px-4">
                <WebsiteBreadcrumb props={breadCrumb} />
                {cart.count === 0
                    ?
                    <div className='w-screen h-[500px] flex justify-center items-center py-32'>
                        <div className='text-center'>
                            <h4 className='text-4xl font-semibold mb-5'>Your cart is empty!</h4>
                            <Button type="button" asChild>
                                <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                    :
                    <div className='flex lg:flex-nowrap flex-wrap gap-10 my-20 lg:px-32 px-4'>
                    <div className='lg:w-[60%] w-full'>
                        <div className='flex font-semibold gap-2 items-center'>
                            <FaShippingFast size={25} /> Shipping Address:
                        </div>
                        <div className='mt-5'>

                            <Form {...orderForm}>
                                <form className='grid grid-cols-1 gap-5' onSubmit={orderForm.handleSubmit(placeOrder)}>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='name'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Full Name*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='phone'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Phone Number*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='address'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea placeholder="Full Address*" className="min-h-[100px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='ordernote'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea placeholder="Order Note (Optional)" className="min-h-[80px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Payment Method Section */}
                                    <div className='mb-6'>
                                        <h3 className='flex items-center gap-2 text-lg font-semibold mb-4'>
                                            <BsCreditCard size={20} />
                                            Select Payment Method
                                        </h3>
                                        <p className='text-sm text-gray-500 mb-4'>You can select one or multiple payment methods</p>
                                        
                                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                                            {/* bKash Option */}
                                            <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                                                selectedPaymentMethods.includes('bkash') 
                                                    ? 'border-pink-500 bg-pink-50 shadow-md' 
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
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                        selectedPaymentMethods.includes('bkash') ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
                                                    }`}>
                                                        <BsPhone size={24} />
                                                    </div>
                                                    <span className='font-semibold text-pink-600'>bKash</span>
                                                    {selectedPaymentMethods.includes('bkash') && (
                                                        <BsCheckCircleFill className='absolute top-3 right-3 text-pink-500' size={20} />
                                                    )}
                                                </div>
                                            </label>

                                            {/* Nagad Option */}
                                            <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                                                selectedPaymentMethods.includes('nagad') 
                                                    ? 'border-orange-500 bg-orange-50 shadow-md' 
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
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                        selectedPaymentMethods.includes('nagad') ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                        <BsPhone size={24} />
                                                    </div>
                                                    <span className='font-semibold text-orange-600'>Nagad</span>
                                                    {selectedPaymentMethods.includes('nagad') && (
                                                        <BsCheckCircleFill className='absolute top-3 right-3 text-orange-500' size={20} />
                                                    )}
                                                </div>
                                            </label>

                                            {/* Cash on Delivery Option */}
                                            <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                                                selectedPaymentMethods.includes('cod') 
                                                    ? 'border-green-500 bg-green-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={selectedPaymentMethods.includes('cod')}
                                                    onChange={() => {
                                                        setSelectedPaymentMethods(prev => {
                                                            const hasCod = prev.includes('cod')
                                                            if (hasCod) {
                                                                return prev.filter(m => m !== 'cod')
                                                            }
                                                            // If selecting COD, remove other methods
                                                            return ['cod']
                                                        })
                                                    }}
                                                />
                                                <div className='flex flex-col items-center text-center'>
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                        selectedPaymentMethods.includes('cod') ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                        <BsCashCoin size={24} />
                                                    </div>
                                                    <span className='font-semibold text-green-600'>Cash on Delivery</span>
                                                    {selectedPaymentMethods.includes('cod') && (
                                                        <BsCheckCircleFill className='absolute top-3 right-3 text-green-500' size={20} />
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* bKash Payment Details */}
                                        {selectedPaymentMethods.includes('bkash') && (
                                            <div className='bg-pink-50 rounded-xl p-5 mb-4 border border-pink-200 animate-in fade-in slide-in-from-top-2 duration-300'>
                                                <h4 className='font-semibold text-pink-700 mb-3 flex items-center gap-2'>
                                                    <BsPhone size={18} />
                                                    bKash Payment Details
                                                </h4>
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                                    <div>
                                                        <label className='block text-sm font-medium text-pink-700 mb-1'>
                                                            bKash Number *
                                                        </label>
                                                        <Input
                                                            type="tel"
                                                            placeholder="01XXXXXXXXX"
                                                            value={paymentDetails.bkashNumber}
                                                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, bkashNumber: e.target.value }))}
                                                            className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className='block text-sm font-medium text-pink-700 mb-1'>
                                                            Transaction ID *
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter transaction ID"
                                                            value={paymentDetails.bkashTransactionId}
                                                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, bkashTransactionId: e.target.value }))}
                                                            className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                                                        />
                                                    </div>
                                                </div>
                                                <p className='text-xs text-pink-600 mt-2'>
                                                    Send money to our bKash number and enter the transaction ID above
                                                </p>
                                            </div>
                                        )}

                                        {/* Nagad Payment Details */}
                                        {selectedPaymentMethods.includes('nagad') && (
                                            <div className='bg-orange-50 rounded-xl p-5 mb-4 border border-orange-200 animate-in fade-in slide-in-from-top-2 duration-300'>
                                                <h4 className='font-semibold text-orange-700 mb-3 flex items-center gap-2'>
                                                    <BsPhone size={18} />
                                                    Nagad Payment Details
                                                </h4>
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                                    <div>
                                                        <label className='block text-sm font-medium text-orange-700 mb-1'>
                                                            Nagad Number *
                                                        </label>
                                                        <Input
                                                            type="tel"
                                                            placeholder="01XXXXXXXXX"
                                                            value={paymentDetails.nagadNumber}
                                                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, nagadNumber: e.target.value }))}
                                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className='block text-sm font-medium text-orange-700 mb-1'>
                                                            Transaction ID *
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter transaction ID"
                                                            value={paymentDetails.nagadTransactionId}
                                                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, nagadTransactionId: e.target.value }))}
                                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                </div>
                                                <p className='text-xs text-orange-600 mt-2'>
                                                    Send money to our Nagad number and enter the transaction ID above
                                                </p>
                                            </div>
                                        )}

                                        {/* Selected Payment Summary */}
                                        <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                                            <h4 className='font-medium text-gray-700 mb-2'>Selected Payment Methods:</h4>
                                            <div className='flex flex-wrap gap-2'>
                                            {selectedPaymentMethods.length === 0 ? (
                                                <span className='text-sm text-gray-500'>Please select a payment method</span>
                                            ) : (
                                                selectedPaymentMethods.map(method => (
                                                    <span key={method} className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        method === 'bkash' ? 'bg-pink-100 text-pink-700' :
                                                        method === 'nagad' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {method === 'bkash' ? 'bKash' : method === 'nagad' ? 'Nagad' : 'Cash on Delivery'}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        </div>
                                    </div>

                                    <div className='mb-3'>
                                        <ButtonLoading type="submit" text={`Place Order ${selectedPaymentMethods.includes('cod') ? '(Cash on Delivery)' : '(Online Payment)'}`} loading={placingOrder} className="w-full bg-black hover:bg-gray-800 rounded-full px-5 cursor-pointer py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" />
                                    </div>

                                </form>
                            </Form>
                        </div>

                    </div>
                    <div className='lg:w-[40%] w-full'>
                        <div className='rounded bg-gray-50 p-5 sticky top-5'>
                            <h4 className='text-lg font-semibold mb-5'>Order Summary</h4>
                            <div>

                                <table className='w-full border'>
                                    <tbody>
                                        {verifiedCartData && verifiedCartData?.map((product, index) => (
                                            <tr key={product.cartItemId || `${product.variantId}-${index}`}>
                                                <td className='p-3'>
                                                    <div className='flex items-center gap-5'>
                                                        <Image src={product.media} width={60} height={60} alt={product.name} className='rounded' />
                                                        <div>
                                                            <h4 className='font-medium line-clamp-1'>
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product.url)}>{product.name}</Link>
                                                            </h4>
                                                            <p className='text-sm'>Colors: {Array.isArray(product.colors) ? product.colors.map(c => c.name).join(', ') : product.colors}</p>
                                                            <p className='text-sm'>Size: {product.size}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-3 text-center'>
                                                    <p className='text-nowrap text-sm'>
                                                        {product.qty} x {product.sellingPrice.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <table className='w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='font-medium py-2'>Subtotal</td>
                                            <td className='text-end py-2'>
                                                {subtotal.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Discount</td>
                                            <td className='text-end py-2'>
                                                - {discount.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Coupon Discount</td>
                                            <td className='text-end py-2'>
                                                -  {couponDiscountAmount.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2 text-xl'>Total</td>
                                            <td className='text-end py-2'>
                                                {totalAmount.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='mt-2 mb-5'>
                                    {!isCouponApplied
                                        ?
                                        <Form {...couponForm}>
                                            <form className='flex justify-between gap-5' onSubmit={couponForm.handleSubmit(applyCoupon)}>
                                                <div className='w-[calc(100%-100px)]'>
                                                    <FormField
                                                        control={couponForm.control}
                                                        name='code'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Enter coupon code" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    >

                                                    </FormField>
                                                </div>
                                                <div className='w-[100px]'>
                                                    <ButtonLoading type="submit" text="Apply" className="w-full cursor-pointer" loading={couponLoading} />
                                                </div>
                                            </form>
                                        </Form>
                                        :
                                        <div className='flex justify-between py-1 px-5 rounded-lg bg-gray-200'>
                                            <div>
                                                <span className='text-xs'>Coupon:</span>
                                                <p className='text-sm font-semibold'>{couponCode}</p>
                                            </div>
                                            <button type='button' onClick={removeCoupon} className='text-red-500 cursor-pointer'>
                                                <IoCloseCircleSharp size={25} />
                                            </button>
                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            }
            </div>
        </div>
    )
}

export default Checkout