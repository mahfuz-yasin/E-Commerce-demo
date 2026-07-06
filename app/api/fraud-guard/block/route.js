import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import BlockedCustomerModel from "@/models/BlockedCustomer.model"
import OrderModel from "@/models/Order.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { phone, ipAddress, reason, notes } = await request.json()

        if (!phone && !ipAddress) {
            return response(false, 400, 'Phone or IP address is required.')
        }

        const blockType = []
        if (phone) blockType.push('phone')
        if (ipAddress) blockType.push('ip')

        // Get order history for context
        const history = phone ? await OrderModel.find({ phone, deletedAt: null }).countDocuments() : 0
        const cancelled = phone ? await OrderModel.countDocuments({ phone, status: 'cancelled', deletedAt: null }) : 0

        const existing = await BlockedCustomerModel.findOne({
            $or: [
                ...(phone ? [{ phone }] : []),
                ...(ipAddress ? [{ ipAddress }] : []),
            ]
        })

        if (existing) {
            existing.isActive = true
            existing.blockType = [...new Set([...existing.blockType, ...blockType])]
            if (phone) existing.phone = phone
            if (ipAddress) existing.ipAddress = ipAddress
            existing.reason = reason || existing.reason
            existing.notes = notes || existing.notes
            existing.fraudOrderCount += 1
            existing.totalOrderCount = history
            existing.cancelledOrderCount = cancelled
            existing.blockedBy = auth.userId
            existing.deletedAt = null
            await existing.save()
            return response(true, 200, 'Block record updated.', existing)
        }

        const blocked = await new BlockedCustomerModel({
            phone: phone || null,
            ipAddress: ipAddress || null,
            blockType,
            reason: reason || 'Fraud / Fake order',
            notes: notes || null,
            totalOrderCount: history,
            cancelledOrderCount: cancelled,
            blockedBy: auth.userId,
        }).save()

        return response(true, 201, 'Customer blocked successfully.', blocked)

    } catch (error) {
        return catchError(error)
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''

        const query = { deletedAt: null, isActive: true }
        if (search) {
            query.$or = [
                { phone: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } },
                { reason: { $regex: search, $options: 'i' } },
            ]
        }

        const total = await BlockedCustomerModel.countDocuments(query)
        const data = await BlockedCustomerModel.find(query)
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)
            .populate('blockedBy', 'name email')

        return response(true, 200, 'Blocked customers fetched.', {
            data,
            total,
            page,
            hasMore: (page + 1) * limit < total,
        })

    } catch (error) {
        return catchError(error)
    }
}
