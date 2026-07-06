import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const search = searchParams.get('search') || ''

        const dateFilter = {}
        if (startDate) dateFilter.$gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            dateFilter.$lte = end
        }

        const matchStage = { deletedAt: null }
        if (Object.keys(dateFilter).length) matchStage.createdAt = dateFilter

        const pipeline = [
            { $match: matchStage },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    productName: { $first: '$products.name' },
                    totalQty: {
                        $sum: {
                            $cond: [{ $ne: ['$status', 'cancelled'] }, '$products.qty', 0]
                        }
                    },
                    cancelledQty: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'cancelled'] }, '$products.qty', 0]
                        }
                    },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'delivered'] },
                                { $multiply: ['$products.sellingPrice', '$products.qty'] },
                                0
                            ]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                }
            },
            {
                $addFields: {
                    successRate: {
                        $cond: [
                            { $gt: ['$totalOrders', 0] },
                            { $round: [{ $multiply: [{ $divide: ['$deliveredOrders', '$totalOrders'] }, 100] }, 0] },
                            0
                        ]
                    }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 100 }
        ]

        let results = await OrderModel.aggregate(pipeline)

        if (search) {
            results = results.filter(r => r.productName?.toLowerCase().includes(search.toLowerCase()))
        }

        return response(true, 200, 'Product report generated.', results)
    } catch (error) {
        return catchError(error)
    }
}
