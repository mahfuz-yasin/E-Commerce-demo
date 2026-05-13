import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import { z } from "zod";

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
            orderSource: z.enum(['direct', 'whatsapp']).default('direct'),
            paymentMethod: z.string().optional(),
            paymentDetails: paymentDetailsSchema,
            products: z.array(productSchema)
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validatedData = validate.data

        // Calculate totals from single product
        const product = validatedData.products[0]
        const subtotal = product.mrp * product.qty
        const discount = (product.mrp - product.sellingPrice) * product.qty
        const totalAmount = product.sellingPrice * product.qty

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
        return catchError(error)
    }
}
