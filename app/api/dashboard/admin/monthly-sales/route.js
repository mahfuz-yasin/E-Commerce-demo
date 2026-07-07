import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }
        await connectDB()

        const now = new Date()
        // Last 12 months
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

        const monthlySales = await OrderModel.aggregate([
            {
                $match: {
                    deletedAt: null,
                    createdAt: { $gte: yearAgo },
                }
            },
            {
                $group: {
                    _id: {
                        year:  { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    revenue:  { $sum: '$totalAmount' },
                    adsCost:  { $sum: { $ifNull: ['$adsCost', 0] } },
                    orders:   { $sum: 1 },
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const monthly = monthlySales.map(m => ({
            month:   `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
            revenue: Math.round(m.revenue  || 0),
            adsCost: Math.round(m.adsCost  || 0),
            orders:  m.orders || 0,
        }))

        return response(true, 200, 'Data found', { monthly })

    } catch (error) {
        return catchError(error)
    }
}