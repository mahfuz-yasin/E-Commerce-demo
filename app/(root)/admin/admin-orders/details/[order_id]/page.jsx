'use client'
import Image from "next/image"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link"
import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
import useFetch from "@/hooks/useFetch"
import { use, useEffect, useState } from "react"
import { ADMIN_DASHBOARD, ADMIN_ORDER_SHOW } from "@/routes/AdminPanelRoute"
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import Select from "@/components/Application/Select"
import { orderStatus } from "@/lib/utils"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { showToast } from "@/lib/showToast"
import CourierIntegration from "@/components/Application/Admin/CourierIntegration"
import InvoicePrint from "@/components/Application/Admin/InvoicePrint"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare } from "lucide-react"
import axios from "axios"


const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_ORDER_SHOW, label: 'Orders' },
    { href: '', label: 'Order Details' },
]

const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Unverified', value: 'unverified' },
]

const OrderDetails = ({ params }) => {
    const { order_id } = use(params)
    const [orderData, setOrderData] = useState()
    const [orderStatus, setOrderStatus] = useState()
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [aiCalling, setAiCalling] = useState(false)
    const [smsText, setSmsText] = useState('')
    const [showSmsBox, setShowSmsBox] = useState(false)
    const [sendingSMS, setSendingSMS] = useState(false)
    const { data, loading } = useFetch(`/api/orders/get/${order_id}`)
    const { data: fraudSettings } = useFetch('/api/fraud-guard/settings')

    const handleOrderUpdate = (updatedOrder) => {
        setOrderData(updatedOrder)
    }

    const buildWhatsAppUrl = () => {
        const o = orderData
        if (!o) return null
        const phone = (fraudSettings?.data?.blockWhatsappNumber || o.phone || '').replace(/\D/g, '')
        const customerPhone = o.phone?.replace(/\D/g, '')
        const waNumber = phone || customerPhone
        const template = fraudSettings?.data?.whatsappMessageTemplate ||
            'অর্ডার: {{order_id}}\nনাম: {{customer_name}}\nমোট: {{total}}\nঠিকানা: {{address}}'
        const products = o.products?.map(p => p.name || 'Product').join(', ') || '—'
        const msg = template
            .replace(/{{order_id}}/g, o.order_id || '')
            .replace(/{{customer_name}}/g, o.name || '')
            .replace(/{{products}}/g, products)
            .replace(/{{quantity}}/g, o.products?.reduce((s, p) => s + (p.qty || 0), 0) || 1)
            .replace(/{{subtotal}}/g, o.subtotal || o.total || '')
            .replace(/{{delivery_charge}}/g, o.shippingCost || 0)
            .replace(/{{discount}}/g, o.discountAmount || 0)
            .replace(/{{total}}/g, o.total || '')
            .replace(/{{address}}/g, o.address || '')
            .replace(/{{status}}/g, o.status || '')
            .replace(/{{site_name}}/g, 'Our Store')
        const waTarget = o.phone?.replace(/\D/g, '') || ''
        return `https://wa.me/${waTarget.startsWith('0') ? '880' + waTarget.slice(1) : waTarget}?text=${encodeURIComponent(msg)}`
    }


    useEffect(() => {
        if (data && data.success) {
            setOrderData(data.data)
            setOrderStatus(data?.data?.status)
        }
    }, [data])


    const handleSendSMS = async () => {
        if (!smsText.trim()) { showToast('error', 'মেসেজ লিখুন।'); return }
        setSendingSMS(true)
        try {
            const { data: res } = await axios.post('/api/sms/send', {
                phone: orderData?.phone,
                name: orderData?.name,
                message: smsText,
                orderId: orderData?._id,
            })
            showToast(res.success ? 'success' : 'error', res.message)
            if (res.success) { setSmsText(''); setShowSmsBox(false) }
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'SMS পাঠানো যায়নি।')
        } finally {
            setSendingSMS(false)
        }
    }

    const handleAICall = async () => {
        setAiCalling(true)
        try {
            const { data: res } = await axios.post('/api/ai-call', { orderId: orderData?._id })
            showToast(res.success ? 'success' : 'error', res.message)
            if (res.success) setOrderData(prev => ({ ...prev, aiCallStatus: 'initiated' }))
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'Call failed.')
        } finally {
            setAiCalling(false)
        }
    }

    const handleOrderStatus = async () => {
        setUpdatingStatus(true)
        try {
            const { data: response } = await axios.put('/api/orders/update-status', {
                _id: orderData?._id,
                status: orderStatus
            })
            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)

        } catch (error) {
            showToast('error', error.message)
        } finally {
            setUpdatingStatus(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className="border">
                {!orderData ?
                    <div className="flex justify-center items-center py-32">
                        <h4 className="text-red-500 text-xl font-semibold">Order Not Found</h4>
                    </div>
                    :
                    <div >
                        {showSmsBox && (
                            <div className="px-5 py-3 border-b bg-blue-50 dark:bg-card">
                                <p className="text-sm font-semibold mb-2">📩 {orderData?.name} ({orderData?.phone})-কে SMS পাঠান</p>
                                <div className="flex gap-2">
                                    <textarea
                                        className="flex-1 border rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        rows={3}
                                        placeholder="মেসেজ লিখুন..."
                                        value={smsText}
                                        onChange={e => setSmsText(e.target.value)}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <Button size="sm" onClick={handleSendSMS} disabled={sendingSMS}>
                                            {sendingSMS ? 'পাঠানো...' : 'পাঠান'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setShowSmsBox(false)}>বাতিল</Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {[
                                        `আপনার অর্ডার ${orderData?.order_id} কনফার্ম হয়েছে। ধন্যবাদ!`,
                                        `আপনার অর্ডার ${orderData?.order_id} ডেলিভারিতে দেওয়া হয়েছে।`,
                                        `আপনার অর্ডার ${orderData?.order_id} ডেলিভার হয়েছে। আমাদের সেবা কেমন লাগলো জানান।`,
                                    ].map((t, i) => (
                                        <button key={i} onClick={() => setSmsText(t)} className="text-xs bg-white border rounded px-2 py-1 hover:bg-primary hover:text-white transition-colors">
                                            টেমপ্লেট {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="py-2 px-5 border-b mb-3 flex items-center justify-between">
                            <h4 className="text-lg font-bold text-primary">Order Details</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSmsBox(v => !v)}
                                    className="flex items-center gap-1"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    SMS পাঠান
                                </Button>
                                {orderData && (
                                    <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WhatsApp
                                        </Button>
                                    </a>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAICall}
                                    disabled={aiCalling || orderData?.aiCallStatus === 'completed'}
                                    className="flex items-center gap-1"
                                >
                                    <Phone className="w-4 h-4" />
                                    {aiCalling ? 'কল হচ্ছে...' : orderData?.aiCallStatus === 'completed' ? '✓ কল হয়েছে' : orderData?.aiCallStatus === 'initiated' ? '⏳ কল চলমান' : 'AI কনফার্মেশন কল'}
                                </Button>
                                <InvoicePrint order={orderData} />
                            </div>
                        </div>

                        <div className="px-5 mb-5">
                            <div className="mb-5">
                                <p><b>Order Id:</b> {orderData?.order_id}</p>
                                <p><b>Transaction Id:</b> {orderData?.payment_id}</p>
                                <p className="capitalize"><b>Status:</b> {orderData?.status}</p>
                            </div>
                            <table className="w-full border">
                                <thead className="border-b bg-gray-50 dark:bg-card md:table-header-group hidden">
                                    <tr>
                                        <th className="text-start p-3">Product</th>
                                        <th className="text-center p-3">Price</th>
                                        <th className="text-center p-3">Quantity</th>
                                        <th className="text-center p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderData && orderData?.products?.map((product, index) => (
                                        <tr key={product.variantId?._id || index} className="md:table-row block border-b">
                                            <td className="md:table-cell p-3">
                                                <div className="flex items-center gap-5">
                                                    <Image src={product?.image || product?.variantId?.media?.[0]?.secure_url || placeholderImg.src} width={60} height={60} alt="product" className="rounded" />
                                                    <div>
                                                        <h4 className="text-lg">
                                                            {product?.productId?.slug ? (
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}>
                                                                    {product?.name || product?.productId?.name || 'Unknown Product'}
                                                                </Link>
                                                            ) : (
                                                                <span>{product?.name || product?.productId?.name || 'Unknown Product'}</span>
                                                            )}
                                                            {product?.variantId?.colors && <p className="text-sm text-gray-500">Colors: {product.variantId.colors.map(c => c.name).join(', ')}</p>}
                                                            <p className="text-sm text-gray-500">Size: {product?.size || (product?.variantId?.size ? (Array.isArray(product.variantId.size) ? product.variantId.size.join(', ') : product.variantId.size) : 'N/A')}</p>
                                                        </h4>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Price</span>
                                                <span>{product.sellingPrice?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' }) || 'N/A'}</span>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Quantity</span>
                                                <span>{product.qty || 0}</span>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Total</span>
                                                <span>{((product.qty || 0) * (product.sellingPrice || 0)).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!orderData?.products || orderData.products.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="p-5 text-center text-gray-500">
                                                No products found in this order.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-10 border mt-10">
                                <div className="p-5">
                                    <h4 className="text-lg font-semibold mb-5">Shipping Address</h4>
                                    <div>
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-medium py-2">Name</td>
                                                    <td className="text-end py-2">{orderData?.name || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Phone</td>
                                                    <td className="text-end py-2">{orderData?.phone || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Address</td>
                                                    <td className="text-end py-2">{orderData?.address || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Order note</td>
                                                    <td className="text-end py-2">{orderData?.ordernote || '---'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Payment Method</td>
                                                    <td className="text-end py-2">{orderData?.paymentMethod || 'COD'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Order Source</td>
                                                    <td className="text-end py-2 capitalize">{orderData?.orderSource || 'cart'}</td>
                                                </tr>

                                                {/* Payment Details for bKash */}
                                                {orderData?.paymentDetails?.bkash && (
                                                    <>
                                                        <tr>
                                                            <td className="font-medium py-2 text-pink-600" colSpan="2">bKash Payment Details</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-medium py-1 pl-4 text-sm">bKash Number</td>
                                                            <td className="text-end py-1 text-sm">{orderData.paymentDetails.bkash.number}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-medium py-1 pl-4 text-sm">Transaction ID</td>
                                                            <td className="text-end py-1 text-sm">{orderData.paymentDetails.bkash.transactionId}</td>
                                                        </tr>
                                                    </>
                                                )}

                                                {/* Payment Details for Nagad */}
                                                {orderData?.paymentDetails?.nagad && (
                                                    <>
                                                        <tr>
                                                            <td className="font-medium py-2 text-orange-600" colSpan="2">Nagad Payment Details</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-medium py-1 pl-4 text-sm">Nagad Number</td>
                                                            <td className="text-end py-1 text-sm">{orderData.paymentDetails.nagad.number}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-medium py-1 pl-4 text-sm">Transaction ID</td>
                                                            <td className="text-end py-1 text-sm">{orderData.paymentDetails.nagad.transactionId}</td>
                                                        </tr>
                                                    </>
                                                )}

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    {/* Courier Integration */}
                                    <CourierIntegration 
                                        order={orderData} 
                                        onUpdate={handleOrderUpdate}
                                    />

                                    {/* Order Summary */}
                                    <div className="p-5 bg-gray-50 dark:bg-card rounded-lg border">
                                        <h4 className="text-lg font-semibold mb-5">Order Summary</h4>
                                        <div>
                                            <table className="w-full">
                                                <tbody>
                                                    <tr>
                                                        <td className="font-medium py-2">Subtotal</td>
                                                        <td className="text-end py-2">{(orderData?.subtotal || 0).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-medium py-2">Discount</td>
                                                        <td className="text-end py-2">{(orderData?.discount || 0).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-medium py-2">Coupon Discount</td>
                                                        <td className="text-end py-2">{(orderData?.couponDiscountAmount || 0).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-medium py-2">Total</td>
                                                        <td className="text-end py-2">{(orderData?.totalAmount || 0).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="pt-3">
                                            <h4 className="text-lg font-semibold mb-2">Order Status</h4>
                                            <Select
                                                options={statusOptions}
                                                selected={orderStatus}
                                                setSelected={(value) => setOrderStatus(value)}
                                                placeholder="Select"
                                                isMulti={false}
                                            />
                                            <ButtonLoading type="button" loading={updatingStatus} onClick={handleOrderStatus} text="Save Status" className="mt-5 cursor-pointer" />
                                        </div>
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

export default OrderDetails