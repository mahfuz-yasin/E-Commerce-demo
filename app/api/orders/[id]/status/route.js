import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import { sendFacebookEventImmediate } from "@/lib/facebook-capi"
import FacebookConfigModel from "@/models/FacebookConfig.model"

export async function PUT(request, { params }) {
    try {
        const { id } = params
        const { status, reason } = await request.json()

        await connectDB()

        const order = await OrderModel.findById(id)
        if (!order) {
            return response(false, 404, 'Order not found')
        }

        const previousStatus = order.status
        order.status = status
        await order.save()

        // Trigger offline conversion event for cancelled orders if Facebook CAPI is enabled
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            await handleOfflineConversion(order, reason)
        }

        return response(true, 200, 'Order status updated successfully', { order, previousStatus })
    } catch (error) {
        return catchError(error)
    }
}

/**
 * Handle offline conversion event for cancelled orders
 * @param {object} order - Order document
 * @param {string} reason - Cancellation reason
 */
async function handleOfflineConversion(order, reason) {
    try {
        const config = await FacebookConfigModel.getConfig()

        if (!config.offlineSyncEnabled || config.capiStatus !== 'active') {
            return
        }

        // Prepare user data for advanced matching
        const userData = {
            phone: order.phone,
            firstName: order.name.split(' ')[0],
            lastName: order.name.split(' ').slice(1).join(' ') || ''
        }

        // Prepare product IDs
        const productIds = order.products.map(p => p.productId.toString())

        // Send offline conversion event with negative value
        const result = await sendFacebookEventImmediate(
            'OfflineConversion',
            {
                content_ids: productIds,
                content_type: 'product',
                transaction_id: order.order_id + '_CANCELLED',
                value: -order.totalAmount, // Negative value for cancellation
                currency: 'BDT',
                num_items: order.products.reduce((sum, p) => sum + p.qty, 0),
                custom_data: {
                    status: 'cancelled',
                    reason: reason || 'Order cancelled',
                    original_order_id: order.order_id,
                    original_value: order.totalAmount
                }
            },
            userData,
            null,
            {
                actionSource: 'offline'
            }
        )

        console.log('Offline conversion event sent for cancelled order:', result)
    } catch (error) {
        console.error('Error sending offline conversion event:', error)
    }
}
