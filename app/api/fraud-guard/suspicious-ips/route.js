import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import BlockedCustomerModel from "@/models/BlockedCustomer.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        // Find IPs with 3+ orders (suspicious)
        const suspiciousIPs = await OrderModel.aggregate([
            { $match: { ipAddress: { $ne: null }, deletedAt: null } },
            { $group: { _id: '$ipAddress', count: { $sum: 1 }, phones: { $addToSet: '$phone' }, lastSeen: { $max: '$createdAt' } } },
            { $match: { count: { $gte: 3 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ])

        // Check which IPs are already blocked
        const blockedIPs = await BlockedCustomerModel.find({ ipAddress: { $in: suspiciousIPs.map(i => i._id) } }).select('ipAddress').lean()
        const blockedIPSet = new Set(blockedIPs.map(b => b.ipAddress))

        const result = suspiciousIPs.map(ip => ({
            ipAddress: ip._id,
            orderCount: ip.count,
            phones: ip.phones.filter(Boolean),
            lastSeen: ip.lastSeen,
            isBlocked: blockedIPSet.has(ip._id),
        }))

        return response(true, 200, 'Suspicious IPs.', result)
    } catch (error) {
        return catchError(error)
    }
}
