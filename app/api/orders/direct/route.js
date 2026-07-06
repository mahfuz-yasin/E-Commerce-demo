import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import BlockedCustomerModel from "@/models/BlockedCustomer.model";
import ShippingRuleModel from "@/models/ShippingRule.model";
import { z } from "zod";
import { headers } from "next/headers";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().min(1, 'Product ID is required'),
            variantId: z.string().min(1, 'Variant ID is required'),
            name: z.string().min(1),
            qty: z.number().min(1),
            mrp: z.number().nonnegative(),
            sellingPrice: z.number().nonnegative()
        })

        const paymentDetailsSchema = z.object({
            bkash: z.object({
                number: z.string(),
                transactionId: z.string()
            }).nullable().optional(),
            nagad: z.object({
                number: z.string(),
                transactionId: z.string()
            }).nullable().optional()
        }).optional().nullable()

        const adSourceSchema = z.object({
            platform: z.enum(['facebook', 'tiktok', 'google', 'instagram', 'organic', 'direct', 'other']).optional(),
            campaignId: z.string().optional().nullable(),
            adSetId: z.string().optional().nullable(),
            adId: z.string().optional().nullable(),
            utmSource: z.string().optional().nullable(),
            utmMedium: z.string().optional().nullable(),
            utmCampaign: z.string().optional().nullable(),
            utmContent: z.string().optional().nullable(),
            fbclid: z.string().optional().nullable(),
            ttclid: z.string().optional().nullable(),
            gclid: z.string().optional().nullable(),
            landingPage: z.string().optional().nullable(),
            referrer: z.string().optional().nullable(),
        }).optional()

        const orderSchema = z.object({
            name: z.string().min(2, 'Name is required'),
            phone: z.string().min(10, 'Phone number is required'),
            address: z.string().min(10, 'Address is required'),
            ordernote: z.string().optional(),
            userId: z.string().optional(),
            orderSource: z.enum(['direct', 'whatsapp']).default('direct'),
            paymentMethod: z.string().optional(),
            paymentDetails: paymentDetailsSchema,
            products: z.array(productSchema).min(1, 'At least one product is required'),
            adSource: adSourceSchema,
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            console.error('Validation error:', validate.error)
            const errorMessages = validate.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            return response(false, 400, `Validation failed: ${errorMessages}`, { error: validate.error })
        }

        const validatedData = validate.data

        // Check if products exist
        if (!validatedData.products || validatedData.products.length === 0) {
            return response(false, 400, 'No products in order', {})
        }

        // Get client IP, UA, and FB cookies for Advanced Event Match Quality
        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
            || headersList.get('x-real-ip')
            || null
        const userAgent = headersList.get('user-agent') || null
        const cookieHeader = headersList.get('cookie') || ''
        const fbcFromCookie = cookieHeader.match(/_fbc=([^;]+)/)?.[1]
        const fbclid = validatedData.adSource?.fbclid
        const fbc = fbcFromCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined)
        const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1] || undefined

        // Fraud Guard Check
        const blockQuery = [{ phone: validatedData.phone, isActive: true, deletedAt: null }]
        if (ipAddress) blockQuery.push({ ipAddress, isActive: true, deletedAt: null })
        const isBlocked = await BlockedCustomerModel.findOne({ $or: blockQuery })
        if (isBlocked) {
            return response(false, 403, 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। বিস্তারিত জানতে যোগাযোগ করুন।')
        }

        // Order Trap System — block duplicate pending orders from same phone within 10 min
        const trapWindow = new Date(Date.now() - 10 * 60 * 1000)
        const recentPending = await OrderModel.findOne({
            phone: validatedData.phone,
            status: 'pending',
            deletedAt: null,
            createdAt: { $gte: trapWindow },
        })
        if (recentPending) {
            return response(false, 429, 'আপনার একটি অর্ডার ইতিমধ্যে প্রক্রিয়াধীন আছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।')
        }

        // Calculate totals from single product
        const product = validatedData.products[0]
        if (!product) {
            return response(false, 400, 'Product data is missing', {})
        }

        const subtotal = (product.mrp || 0) * (product.qty || 1)
        const discount = ((product.mrp || 0) - (product.sellingPrice || 0)) * (product.qty || 1)
        const productTotal = (product.sellingPrice || 0) * (product.qty || 1)

        // Check shipping rules
        let shippingCharge = 60
        let freeShipping = false
        const activeRule = await ShippingRuleModel.findOne({ isActive: true, deletedAt: null }).sort({ priority: -1 })
        if (activeRule) {
            if (activeRule.type === 'free') {
                freeShipping = true
                shippingCharge = 0
            } else if (activeRule.type === 'conditional_free' && productTotal >= activeRule.freeShippingMinAmount) {
                freeShipping = true
                shippingCharge = 0
            } else {
                shippingCharge = activeRule.flatCharge || 60
            }
        }
        const totalAmount = productTotal + shippingCharge

        // Generate a unique order ID and invoice number
        const order_id = 'DIRECT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        const invoiceNumber = 'INV-' + Date.now().toString().slice(-8)

        const hasOnlinePayment = validatedData.paymentDetails &&
            (validatedData.paymentDetails.bkash || validatedData.paymentDetails.nagad)

        const newOrder = await OrderModel.create({
            user: validatedData.userId,
            name: validatedData.name,
            phone: validatedData.phone,
            address: validatedData.address,
            ordernote: validatedData.ordernote,
            products: validatedData.products,
            discount: discount,
            couponDiscountAmount: 0,
            subtotal: subtotal,
            shippingCharge,
            freeShipping,
            totalAmount: totalAmount,
            payment_id: hasOnlinePayment ? `PAY-${Date.now()}` : null,
            order_id: order_id,
            invoiceNumber,
            status: hasOnlinePayment ? 'paid' : 'pending',
            paymentMethod: validatedData.paymentMethod || 'COD',
            paymentDetails: validatedData.paymentDetails || null,
            orderSource: validatedData.orderSource,
            adSource: {
                ...(validatedData.adSource || {}),
                fbc: fbc || undefined,
                fbp: fbp || undefined,
            },
            ipAddress,
            userAgent,
        })

        console.log('Direct order created successfully:', newOrder)

        return response(true, 200, 'Order placed successfully.', { order_id })

    } catch (error) {
        console.error('Direct order error:', error)
        console.error('Error stack:', error.stack)
        return catchError(error, 'Failed to create order. Please try again.')
    }
}
