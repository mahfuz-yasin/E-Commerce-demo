import WebsiteBreadcrumb from "@/components/Application/Website/WebsiteBreadcrumb"
import Image from "next/image"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link"
import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
import { connectDB } from "@/lib/databaseConnection"
import OrderModel from "@/models/Order.model"
import { notFound } from "next/navigation"

const fmt = (amount) =>
    typeof amount === 'number'
        ? `৳${amount.toLocaleString('en-BD')}`
        : '৳0'

const STATUS_STYLE = {
    pending:    'bg-blue-100 text-blue-700 border border-blue-200',
    processing: 'bg-amber-100 text-amber-700 border border-amber-200',
    shipped:    'bg-cyan-100 text-cyan-700 border border-cyan-200',
    delivered:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cancelled:  'bg-red-100 text-red-700 border border-red-200',
    unverified: 'bg-orange-100 text-orange-700 border border-orange-200',
}

const STEPS = ['pending', 'processing', 'shipped', 'delivered']

const breadcrumb = {
    title: 'Order Details',
    links: [{ label: 'Order Details' }]
}

const OrderDetails = async ({ params }) => {
    const { orderid } = await params

    await connectDB()
    const order = await OrderModel.findOne({ order_id: orderid })
        .populate('products.productId', 'name slug')
        .populate({ path: 'products.variantId', populate: { path: 'media' } })
        .lean()

    if (!order) notFound()

    const statusIdx = STEPS.indexOf(order.status)

    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500 mt-1 font-mono">{order.order_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                    </span>
                </div>

                {/* Progress stepper — only for non-cancelled */}
                {order.status !== 'cancelled' && order.status !== 'unverified' && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 mx-8 z-0" />
                            <div
                                className="absolute left-0 top-4 h-0.5 bg-emerald-500 mx-8 z-0 transition-all duration-700"
                                style={{ width: statusIdx >= 0 ? `${(statusIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
                            />
                            {STEPS.map((step, i) => {
                                const done = i <= statusIdx
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                            done
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                            {done ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-xs capitalize font-medium ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Order Info */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Order Information</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x">
                        <div className="px-5 py-4 space-y-2 text-sm">
                            <Row label="Order ID" value={<span className="font-mono">{order.order_id}</span>} />
                            {order.payment_id && <Row label="Transaction ID" value={order.payment_id} />}
                            <Row label="Payment Method" value={<span className="capitalize">{order.paymentMethod}</span>} />
                            {order.paymentDetails?.bkash?.number && <Row label="bKash Number" value={order.paymentDetails.bkash.number} />}
                            {order.paymentDetails?.bkash?.transactionId && <Row label="bKash Txn ID" value={order.paymentDetails.bkash.transactionId} />}
                            {order.paymentDetails?.nagad?.number && <Row label="Nagad Number" value={order.paymentDetails.nagad.number} />}
                            {order.paymentDetails?.nagad?.transactionId && <Row label="Nagad Txn ID" value={order.paymentDetails.nagad.transactionId} />}
                        </div>
                        <div className="px-5 py-4 space-y-2 text-sm">
                            <Row label="Customer" value={order.name} />
                            <Row label="Phone" value={order.phone} />
                            <Row label="Address" value={order.address} />
                            {order.ordernote && <Row label="Note" value={order.ordernote} />}
                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Products ({order.products?.length})</h2>
                    </div>
                    <div className="divide-y">
                        {order.products?.map((product, index) => {
                            const img = product?.image || product?.variantId?.media?.[0]?.secure_url || placeholderImg.src
                            const lineTotal = (product?.qty || 0) * (product?.sellingPrice || 0)
                            const colors = product?.variantId?.colors?.map(c => c.name).join(', ')
                            const size = product?.size || product?.variantId?.size?.join(', ')
                            return (
                                <div key={`${product?.variantId?._id || index}-${index}`} className="flex items-center gap-4 px-5 py-4">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                                        <Image src={img} alt={product?.name || 'product'} fill className="object-cover" sizes="64px" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1 text-sm">
                                            {product?.name}
                                        </Link>
                                        <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-500">
                                            {colors && <span>Color: {colors}</span>}
                                            {size && <span>Size: {size}</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">Qty: {product?.qty} × {fmt(product?.sellingPrice)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-gray-900 text-sm">{fmt(lineTotal)}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Order Summary</h2>
                    </div>
                    <div className="px-5 py-4 space-y-2 text-sm max-w-sm ml-auto">
                        {order.subtotal > 0 && <SummaryRow label="Subtotal" value={fmt(order.subtotal)} />}
                        {order.discount > 0 && <SummaryRow label="Discount" value={`-${fmt(order.discount)}`} className="text-emerald-600" />}
                        {order.couponDiscountAmount > 0 && <SummaryRow label="Coupon Discount" value={`-${fmt(order.couponDiscountAmount)}`} className="text-emerald-600" />}
                        {order.deliveryCharge > 0 && <SummaryRow label="Delivery Charge" value={fmt(order.deliveryCharge)} />}
                        <div className="border-t pt-2 mt-2">
                            <SummaryRow label="Total" value={fmt(order.totalAmount)} bold />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4">
        <span className="text-gray-500 shrink-0">{label}</span>
        <span className="text-gray-900 text-right">{value}</span>
    </div>
)

const SummaryRow = ({ label, value, bold, className = '' }) => (
    <div className="flex justify-between gap-4">
        <span className={bold ? 'font-semibold text-gray-900' : 'text-gray-500'}>{label}</span>
        <span className={`${bold ? 'font-bold text-gray-900 text-base' : 'text-gray-900'} ${className}`}>{value}</span>
    </div>
)

export default OrderDetails