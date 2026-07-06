import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import InventoryPurchaseModel from "@/models/InventoryPurchase.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : new Date(new Date().setDate(1))
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : new Date()
        const platform = searchParams.get('platform') // facebook | tiktok | all

        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate }, deletedAt: null }

        // Orders by platform
        const orderQuery = { ...dateFilter }
        if (platform && platform !== 'all') {
            orderQuery['adSource.platform'] = platform
        }

        const orders = await OrderModel.find(orderQuery).select(
            'totalAmount subtotal discount couponDiscountAmount shippingCharge status adSource fbPurchaseEventSent products'
        )

        const deliveredOrders = orders.filter(o => o.status === 'delivered')
        const cancelledOrders = orders.filter(o => o.status === 'cancelled')
        const pendingOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status))

        const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        const totalShipping = deliveredOrders.reduce((sum, o) => sum + (o.shippingCharge || 0), 0)
        const totalCancelledRevenue = cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0)

        // Purchase cost in date range
        const purchases = await InventoryPurchaseModel.find({
            purchaseDate: { $gte: startDate, $lte: endDate },
            deletedAt: null,
        }).select('totalAmount')

        const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0)

        // By ads platform breakdown
        const platformBreakdown = {}
        for (const order of orders) {
            const plt = order.adSource?.platform || 'organic'
            if (!platformBreakdown[plt]) {
                platformBreakdown[plt] = { orders: 0, revenue: 0, cancelled: 0 }
            }
            platformBreakdown[plt].orders++
            if (order.status === 'delivered') platformBreakdown[plt].revenue += order.totalAmount
            if (order.status === 'cancelled') platformBreakdown[plt].cancelled++
        }

        const grossProfit = totalRevenue - totalPurchaseCost
        const netProfit = grossProfit - totalShipping

        return response(true, 200, 'Profit/Loss report generated.', {
            period: { startDate, endDate },
            summary: {
                totalOrders: orders.length,
                deliveredOrders: deliveredOrders.length,
                cancelledOrders: cancelledOrders.length,
                pendingOrders: pendingOrders.length,
                totalRevenue,
                totalShipping,
                totalCancelledRevenue,
                totalPurchaseCost,
                grossProfit,
                netProfit,
                cancelRate: orders.length > 0 ? ((cancelledOrders.length / orders.length) * 100).toFixed(2) + '%' : '0%',
            },
            platformBreakdown,
        })
    } catch (error) {
        return catchError(error)
    }
}
