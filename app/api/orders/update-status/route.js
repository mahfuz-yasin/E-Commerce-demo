import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import { sendFacebookEventImmediate, generateEventId } from "@/lib/facebook-capi";

export async function PUT(request) {
    try {

        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const { _id, status } = await request.json()

        if (!_id || !status) {
            return response(false, 400, 'Order id and status are required.')
        }

        const orderData = await OrderModel.findById(_id)

        if (!orderData) {
            return response(false, 404, 'Order not found.')
        }

        const previousStatus = orderData.status
        orderData.status = status
        await orderData.save()

        // Send Facebook Purchase Event only when order is confirmed (processing/shipped/delivered)
        // and only if not already sent and order came from facebook
        const confirmStatuses = ['processing', 'shipped', 'delivered']
        if (
            confirmStatuses.includes(status) &&
            !confirmStatuses.includes(previousStatus) &&
            !orderData.fbPurchaseEventSent
        ) {
            try {
                const eventId = generateEventId()
                await sendFacebookEventImmediate(
                    'Purchase',
                    {
                        currency: 'BDT',
                        value: orderData.totalAmount,
                        order_id: orderData.order_id,
                        content_ids: orderData.products.map(p => p.productId?.toString()),
                        content_type: 'product',
                        num_items: orderData.products.reduce((sum, p) => sum + p.qty, 0),
                    },
                    {
                        phone: orderData.phone,
                        externalId: orderData._id.toString(),
                        ipAddress: orderData.ipAddress,
                    },
                    eventId,
                    {
                        actionSource: 'website',
                        eventSourceUrl: process.env.NEXT_PUBLIC_BASE_URL,
                    }
                )

                orderData.fbPurchaseEventSent = true
                orderData.fbPurchaseEventSentAt = new Date()
                await orderData.save()
            } catch (fbErr) {
                console.error('FB Purchase Event failed:', fbErr.message)
            }
        }

        return response(true, 200, 'Order status updated successfully.', orderData)

    } catch (error) {
        return catchError(error)
    }
}