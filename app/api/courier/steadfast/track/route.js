import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { getConsignmentDetails, checkDeliveryStatus } from "@/lib/steadfastCourier";
import OrderModel from "@/models/Order.model";

/**
 * POST /api/courier/steadfast/track
 * Track a Steadfast consignment and update order status
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

        // Check if assigned to Steadfast
        if (!order.courierInfo?.trackingCode) {
            return response(false, 400, 'Order not assigned to any courier.')
        }

        const trackingCode = order.courierInfo.trackingCode
        
        // Get consignment details from Steadfast
        const detailsResult = await getConsignmentDetails(trackingCode)
        
        // Get delivery status
        const statusResult = await checkDeliveryStatus(trackingCode)
        
        if (!detailsResult.success && !statusResult.success) {
            return response(false, 500, `Failed to track consignment: ${detailsResult.message || statusResult.message}`)
        }

        // Map Steadfast status to our status
        const steadfastStatus = statusResult.data?.status || detailsResult.data?.status || 'pending'
        const mappedStatus = mapSteadfastStatus(steadfastStatus)
        
        // Update order with latest tracking info
        const updatedOrder = await OrderModel.findOneAndUpdate(
            { order_id: orderId },
            {
                $set: {
                    'courierInfo.status': mappedStatus,
                    'courierInfo.updatedAt': new Date(),
                    status: mappedStatus === 'delivered' ? 'delivered' : order.status
                }
            },
            { new: true }
        )

        return response(true, 200, 'Tracking information retrieved.', {
            order: updatedOrder,
            tracking: {
                details: detailsResult.data,
                status: statusResult.data
            }
        })

    } catch (error) {
        console.error('[API Steadfast Track] Error:', error)
        return catchError(error, 'Failed to track Steadfast consignment')
    }
}

/**
 * Map Steadfast status to internal status
 */
function mapSteadfastStatus(steadfastStatus) {
    const statusMap = {
        'pending': 'pending',
        'pickup_assigned': 'picked_up',
        'picked_up': 'picked_up',
        'in_transit': 'in_transit',
        'at_hub': 'in_transit',
        'out_for_delivery': 'in_transit',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'returned': 'returned',
        'hold': 'pending'
    }
    
    return statusMap[steadfastStatus?.toLowerCase()] || 'pending'
}
