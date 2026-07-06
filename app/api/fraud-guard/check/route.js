import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import BlockedCustomerModel from "@/models/BlockedCustomer.model"
import OrderModel from "@/models/Order.model"

export async function POST(request) {
    try {
        await connectDB()
        const { phone, ipAddress } = await request.json()

        if (!phone && !ipAddress) {
            return response(false, 400, 'Phone or IP address is required.')
        }

        const result = {
            isBlocked: false,
            fraudScore: 0,
            flags: [],
            blockedRecord: null,
            history: null,
        }

        // Check if phone/IP is blocked
        const blockQuery = []
        if (phone) blockQuery.push({ phone, isActive: true, deletedAt: null })
        if (ipAddress) blockQuery.push({ ipAddress, isActive: true, deletedAt: null })

        const blockedRecord = await BlockedCustomerModel.findOne({ $or: blockQuery })

        if (blockedRecord) {
            result.isBlocked = true
            result.fraudScore = 100
            result.flags.push(...blockedRecord.blockType.map(t => `${t}_blocked`))
            result.blockedRecord = {
                _id: blockedRecord._id,
                reason: blockedRecord.reason,
                blockType: blockedRecord.blockType,
                fraudOrderCount: blockedRecord.fraudOrderCount,
                createdAt: blockedRecord.createdAt,
            }
            return response(true, 200, 'Customer is blocked.', result)
        }

        // Score calculation based on order history
        if (phone) {
            const allOrders = await OrderModel.find({ phone, deletedAt: null }).sort({ createdAt: -1 }).limit(20)
            const cancelledOrders = allOrders.filter(o => o.status === 'cancelled')
            const pendingOrders = allOrders.filter(o => o.status === 'pending')

            result.history = {
                totalOrders: allOrders.length,
                cancelledOrders: cancelledOrders.length,
                pendingOrders: pendingOrders.length,
                deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
            }

            const cancelRate = allOrders.length > 0 ? cancelledOrders.length / allOrders.length : 0

            if (cancelRate > 0.5 && allOrders.length >= 3) {
                result.fraudScore += 40
                result.flags.push('high_cancel_rate')
            }
            if (allOrders.length >= 5 && cancelledOrders.length >= 3) {
                result.fraudScore += 20
                result.flags.push('multiple_cancellations')
            }
            if (pendingOrders.length >= 3) {
                result.fraudScore += 15
                result.flags.push('multiple_pending')
            }
            // Check for same phone placing many orders in short time
            const recentOrders = allOrders.filter(o => {
                const diff = Date.now() - new Date(o.createdAt).getTime()
                return diff < 24 * 60 * 60 * 1000 // last 24 hours
            })
            if (recentOrders.length >= 5) {
                result.fraudScore += 25
                result.flags.push('suspicious_frequency')
            }
        }

        // IP-based check
        if (ipAddress) {
            const ipOrders = await OrderModel.find({ ipAddress, deletedAt: null }).limit(10)
            const ipCancelled = ipOrders.filter(o => o.status === 'cancelled')
            if (ipCancelled.length >= 3) {
                result.fraudScore += 20
                result.flags.push('ip_high_cancel')
            }
        }

        result.fraudScore = Math.min(result.fraudScore, 99)

        return response(true, 200, 'Fraud check complete.', result)

    } catch (error) {
        return catchError(error)
    }
}
