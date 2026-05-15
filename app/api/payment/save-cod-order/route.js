import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import { z } from "zod";
import { trackPurchase } from "@/lib/facebook-capi";
import { trackTikTokPurchase, generateTikTokEventId } from "@/lib/tiktok-events-api";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().length(24, 'Invalid product id format'),
            variantId: z.string().length(24, 'Invalid variant id format'),
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

        const orderSchema = z.object({
            name: z.string().min(2, 'Name is required'),
            phone: z.string().min(10, 'Phone number is required'),
            address: z.string().min(10, 'Address is required'),
            ordernote: z.string().optional(),
            userId: z.string().optional(),
            paymentMethod: z.string().default('COD'),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative(),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema),
            paymentDetails: paymentDetailsSchema
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validatedData = validate.data

        console.log('Creating order with data:', validatedData)

        // Generate a unique order ID for COD
        const order_id = 'COD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()

        const newOrder = await OrderModel.create({
            user: validatedData.userId,
            name: validatedData.name,
            phone: validatedData.phone,
            address: validatedData.address,
            ordernote: validatedData.ordernote,
            products: validatedData.products,
            discount: validatedData.discount,
            couponDiscountAmount: validatedData.couponDiscountAmount,
            totalAmount: validatedData.totalAmount,
            subtotal: validatedData.subtotal,
            payment_id: validatedData.paymentDetails ? `PAY-${Date.now()}` : null,
            order_id: order_id,
            status: validatedData.paymentDetails ? 'paid' : 'pending',
            paymentMethod: validatedData.paymentMethod,
            paymentDetails: validatedData.paymentDetails || null
        })

        // Track Purchase event with Facebook CAPI and TikTok Events API
        try {
            const productIds = validatedData.products.map(p => p.productId)
            
            // Generate same event_id for both platforms for deduplication
            const eventId = generateTikTokEventId()
            
            // Facebook CAPI tracking
            await trackPurchase(
                newOrder._id.toString(),
                validatedData.totalAmount,
                'BDT',
                productIds,
                {
                    phone: validatedData.phone,
                    firstName: validatedData.name.split(' ')[0],
                    lastName: validatedData.name.split(' ').slice(1).join(' ')
                },
                eventId
            )
            
            // TikTok Events API tracking
            await trackTikTokPurchase(
                order_id,
                validatedData.totalAmount,
                'BDT',
                productIds,
                {
                    phone: validatedData.phone,
                    firstName: validatedData.name.split(' ')[0],
                    lastName: validatedData.name.split(' ').slice(1).join(' ')
                },
                eventId
            )
        } catch (error) {
            console.error('Error tracking Purchase event:', error)
            // Don't fail the order if tracking fails
        }

        console.log('Order created successfully:', newOrder)

        return response(true, 200, validatedData.paymentDetails ? 'Order placed successfully with online payment.' : 'Order placed successfully with Cash on Delivery.', { order_id })

    } catch (error) {
        return catchError(error)
    }
}
