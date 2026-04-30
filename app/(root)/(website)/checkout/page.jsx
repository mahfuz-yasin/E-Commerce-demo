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
import { Textarea } from '@/components/ui/textarea'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

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
    const cart = useSelector(store => store.cartStore)
    const authStore = useSelector(store => store.authStore)
    const [verifiedCartData, setVerifiedCartData] = useState([])
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

            const { data: orderResponseData } = await axios.post('/api/payment/save-cod-order', {
                ...formData,
                products: products,
                subtotal: subtotal,
                discount: discount,
                couponDiscountAmount: couponDiscountAmount,
                totalAmount: totalAmount,
                paymentMethod: 'COD'
            })

            if (orderResponseData.success) {
                setOrderDetails({
                    orderId: orderResponseData.data.order_id,
                    totalAmount: totalAmount
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
                            Your order has been placed with Cash on Delivery.
                        </p>
                        <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                            <p className='text-sm text-gray-500'>Order ID</p>
                            <p className='font-semibold text-lg'>{orderDetails?.orderId}</p>
                            <p className='text-sm text-gray-500 mt-2'>Total Amount</p>
                            <p className='font-semibold text-lg'>{orderDetails?.totalAmount?.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</p>
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

                                    <div className='mb-3'>
                                        <ButtonLoading type="submit" text="Place Order" loading={placingOrder} className="bg-black rounded-full px-5 cursor-pointer" />
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
                                                            <p className='text-sm'>Color: {product.color}</p>
                                                            <p className='text-sm'>Size: {product.size}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-3 text-center'>
                                                    <p className='text-nowrap text-sm'>
                                                        {product.qty} x {product.sellingPrice.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}
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
                                                {subtotal.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Discount</td>
                                            <td className='text-end py-2'>
                                                - {discount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Coupon Discount</td>
                                            <td className='text-end py-2'>
                                                -  {couponDiscountAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2 text-xl'>Total</td>
                                            <td className='text-end py-2'>
                                                {totalAmount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}
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