import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { createConsignment, prepareConsignmentData } from "@/lib/steadfastCourier";
import OrderModel from "@/models/Order.model";

/**
 * POST /api/courier/steadfast/create
 * Create a new consignment in Steadfast courier
 */
export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return response(false, 400, 'Order ID is required.')
        }

        // Get order details
        const order = await OrderModel.findOne({ order_id: orderId }).lean()
        
        if (!order) {
            return response(false, 404, 'Order not found.')
        }

        // Check if already assigned to courier
        if (order.courierInfo?.courierName) {
            return response(false, 400, `Order already assigned to ${order.courierInfo.courierName}. Tracking: ${order.courierInfo.trackingCode}`)
        }

        // Prepare consignment data
        const consignmentData = prepareConsignmentData(order)
        
        // Create consignment in Steadfast
        const result = await createConsignment(consignmentData)
        
        if (!result.success) {
            return response(false, 500, `Failed to create consignment: ${result.message}`)
        }

        // Extract tracking info from Steadfast response
        const steadfastData = result.data
        
        // Update order with courier info
        const updatedOrder = await OrderModel.findOneAndUpdate(
            { order_id: orderId },
            {
                $set: {
                    'courierInfo': {
                        courierName: 'steadfast',
                        trackingCode: steadfastData.consignment?.tracking_code || steadfastData.tracking_code,
                        consignmentId: steadfastData.consignment?.consignment_id || steadfastData.consignment_id,
                        status: 'pending',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    status: 'processing' // Update order status to processing
                }
            },
            { new: true }
        )

        return response(true, 200, 'Consignment created successfully in Steadfast.', {
            order: updatedOrder,
            steadfast: steadfastData
        })

    } catch (error) {
        console.error('[API Steadfast Create] Error:', error)
        return catchError(error, 'Failed to create Steadfast consignment')
    }
}
