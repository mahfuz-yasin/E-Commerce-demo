import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"

function getDateRange(filter, startDate, endDate) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    switch (filter) {
        case 'today':
            return { $gte: today, $lt: tomorrow }
        case 'yesterday': {
            const yd = new Date(today); yd.setDate(yd.getDate() - 1)
            return { $gte: yd, $lt: today }
        }
        case 'this_week': {
            const day = today.getDay()
            const weekStart = new Date(today); weekStart.setDate(today.getDate() - day)
            return { $gte: weekStart, $lt: tomorrow }
        }
        case 'this_month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            return { $gte: monthStart, $lt: tomorrow }
        }
        case 'this_year': {
            const yearStart = new Date(now.getFullYear(), 0, 1)
            return { $gte: yearStart, $lt: tomorrow }
        }
        case 'custom': {
            if (startDate && endDate) {
                const end = new Date(endDate); end.setHours(23, 59, 59, 999)
                return { $gte: new Date(startDate), $lte: end }
            }
            return null
        }
        default:
            return null // all time
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()

        const { searchParams } = new URL(request.url)
        const filter = searchParams.get('filter') || 'all'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const dateRange = getDateRange(filter, startDate, endDate)

        const matchQuery = { deletedAt: null }
        if (dateRange) matchQuery.createdAt = dateRange

        // Aggregate all status counts + amounts in one pass
        const pipeline = [
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                }
            }
        ]

        const statusGroups = await OrderModel.aggregate(pipeline)

        // Build map
        const statusMap = {}
        let totalOrders = 0, totalAmount = 0
        for (const g of statusGroups) {
            statusMap[g._id] = { count: g.count, amount: g.totalAmount }
            totalOrders += g.count
            totalAmount += g.totalAmount
        }

        const get = (key) => statusMap[key] || { count: 0, amount: 0 }

        // "incomplete" = pending + processing + unverified + hold + ship_later
        const incompleteCount = (
            get('pending').count + get('processing').count + get('unverified').count +
            get('hold').count + get('ship_later').count
        )
        const incompleteAmount = (
            get('pending').amount + get('processing').amount + get('unverified').amount +
            get('hold').amount + get('ship_later').amount
        )

        const pct = (n) => totalOrders > 0 ? ((n / totalOrders) * 100).toFixed(1) : '0.0'

        return response(true, 200, 'Live stats.', {
            filter,
            total:           { count: totalOrders,                    amount: totalAmount },
            processing:      { ...get('processing'),                  pct: pct(get('processing').count) },
            pending:         { ...get('pending'),                     pct: pct(get('pending').count) },
            confirmed:       { ...get('confirmed'),                   pct: pct(get('confirmed').count), amount: get('confirmed').amount },
            shipped:         { ...get('shipped'),                     pct: pct(get('shipped').count) },
            cancelled:       { ...get('cancelled'),                   pct: pct(get('cancelled').count) },
            delivered:       { ...get('delivered'),                   pct: pct(get('delivered').count), amount: get('delivered').amount },
            unverified:      { ...get('unverified'),                  pct: pct(get('unverified').count) },
            hold:            { ...get('hold'),                        pct: pct(get('hold').count) },
            ship_later:      { ...get('ship_later'),                  pct: pct(get('ship_later').count) },
            partial_delivery:{ ...get('partial_delivery'),            pct: pct(get('partial_delivery').count) },
            returned:        { ...get('returned'),                    pct: pct(get('returned').count) },
            lost:            { ...get('lost'),                        pct: pct(get('lost').count) },
            incomplete:      { count: incompleteCount, amount: incompleteAmount, pct: pct(incompleteCount) },
        })
    } catch (error) {
        return catchError(error)
    }
}
