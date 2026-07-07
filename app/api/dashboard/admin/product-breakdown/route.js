import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"

function getDateRange(filter) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    switch (filter) {
        case 'today':      return { $gte: today, $lt: tomorrow }
        case 'yesterday':  { const y = new Date(today); y.setDate(y.getDate()-1); return { $gte: y, $lt: today } }
        case 'this_week':  { const ws = new Date(today); ws.setDate(today.getDate()-today.getDay()); return { $gte: ws, $lt: tomorrow } }
        case 'this_month': return { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lt: tomorrow }
        case 'this_year':  return { $gte: new Date(now.getFullYear(), 0, 1), $lt: tomorrow }
        default:           return null
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        const { searchParams } = new URL(request.url)
        const filter = searchParams.get('filter') || 'this_month'
        const limit  = parseInt(searchParams.get('limit') || '20')
        const dateRange = getDateRange(filter)

        const matchQuery = { deletedAt: null }
        if (dateRange) matchQuery.createdAt = dateRange

        const pipeline = [
            { $match: matchQuery },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.name',
                    total:           { $sum: 1 },
                    new:             { $sum: { $cond: [{ $eq: ['$status', 'pending']          }, 1, 0] } },
                    confirmed:       { $sum: { $cond: [{ $eq: ['$status', 'confirmed']        }, 1, 0] } },
                    in_courier:      { $sum: { $cond: [{ $eq: ['$status', 'shipped']          }, 1, 0] } },
                    delivered:       { $sum: { $cond: [{ $eq: ['$status', 'delivered']        }, 1, 0] } },
                    cancelled:       { $sum: { $cond: [{ $eq: ['$status', 'cancelled']        }, 1, 0] } },
                    hold:            { $sum: { $cond: [{ $eq: ['$status', 'hold']             }, 1, 0] } },
                    returned:        { $sum: { $cond: [{ $eq: ['$status', 'returned']         }, 1, 0] } },
                }
            },
            { $sort: { total: -1 } },
            { $limit: limit }
        ]

        const rows = await OrderModel.aggregate(pipeline)

        return response(true, 200, 'Product breakdown.', { rows, filter })
    } catch (error) {
        return catchError(error)
    }
}
