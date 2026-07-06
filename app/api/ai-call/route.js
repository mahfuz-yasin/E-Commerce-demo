import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import { makeOrderConfirmationCall, getCallStatus } from "@/lib/aiOrderCall"

// POST: Trigger AI call for an order
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { orderId } = await request.json()
        if (!orderId) return response(false, 400, 'orderId is required.')

        const order = await OrderModel.findById(orderId)
        if (!order) return response(false, 404, 'Order not found.')

        if (order.aiCallStatus === 'completed') {
            return response(false, 400, 'AI call already completed for this order.')
        }

        const result = await makeOrderConfirmationCall(order)

        if (result.success) {
            order.aiCallStatus = 'initiated'
            order.aiCallId = result.callId
            order.aiCallInitiatedAt = new Date()
            await order.save()
        }

        return response(result.success, 200, result.message, { callId: result.callId })
    } catch (error) {
        return catchError(error)
    }
}

// GET: Check call status
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        const { searchParams } = new URL(request.url)
        const callId = searchParams.get('callId')
        if (!callId) return response(false, 400, 'callId is required.')

        const status = await getCallStatus(callId)
        return response(true, 200, 'Call status fetched.', status)
    } catch (error) {
        return catchError(error)
    }
}
