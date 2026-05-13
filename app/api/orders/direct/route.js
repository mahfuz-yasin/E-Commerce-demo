import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import { z } from "zod";

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

        const orderSchema = z.object({
            name: z.string().min(2, 'Name is required'),
            phone: z.string().min(10, 'Phone number is required'),
            address: z.string().min(10, 'Address is required'),
            ordernote: z.string().optional(),
            userId: z.string().optional(),
            orderSource: z.enum(['direct', 'whatsapp']).default('direct'),
            paymentMethod: z.string().optional(),
            paymentDetails: paymentDetailsSchema,
            products: z.array(productSchema).min(1, 'At least one product is required')
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

        // Calculate totals from single product
        const product = validatedData.products[0]
        if (!product) {
            return response(false, 400, 'Product data is missing', {})
        }

        const subtotal = (product.mrp || 0) * (product.qty || 1)
        const discount = ((product.mrp || 0) - (product.sellingPrice || 0)) * (product.qty || 1)
        const totalAmount = (product.sellingPrice || 0) * (product.qty || 1)

        // Generate a unique order ID
        const order_id = 'DIRECT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()

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
            totalAmount: totalAmount,
            subtotal: subtotal,
            payment_id: hasOnlinePayment ? `PAY-${Date.now()}` : null,
            order_id: order_id,
            status: hasOnlinePayment ? 'paid' : 'pending',
            paymentMethod: validatedData.paymentMethod || 'COD',
            paymentDetails: validatedData.paymentDetails || null,
            orderSource: validatedData.orderSource
        })

        console.log('Direct order created successfully:', newOrder)

        return response(true, 200, 'Order placed successfully.', { order_id })

    } catch (error) {
        console.error('Direct order error:', error)
        console.error('Error stack:', error.stack)
        return catchError(error, 'Failed to create order. Please try again.')
    }
}
