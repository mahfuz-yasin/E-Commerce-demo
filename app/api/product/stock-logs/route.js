import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import StockLogModel from "@/models/StockLog.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        const { searchParams } = new URL(request.url)
        const action   = searchParams.get('action')   || ''
        const product  = searchParams.get('product')  || ''
        const page     = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const size     = Math.min(100, parseInt(searchParams.get('size') || '50'))
        const skip     = (page - 1) * size

        const match = {}
        if (action && action !== 'all') match.action = action
        if (product) {
            const mongoose = (await import('mongoose')).default
            if (mongoose.Types.ObjectId.isValid(product)) match.product = new mongoose.Types.ObjectId(product)
        }

        const [logs, total] = await Promise.all([
            StockLogModel.find(match)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(size)
                .populate('product', 'name')
                .lean(),
            StockLogModel.countDocuments(match)
        ])

        return response(true, 200, 'Stock logs.', { logs, total, page, size })
    } catch (error) {
        return catchError(error)
    }
}
