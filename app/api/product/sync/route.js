import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        // Find order items that don't match any product name
        const pipeline = [
            { $match: { deletedAt: null } },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.name',
                    count: { $sum: 1 },
                    source: { $first: { $ifNull: ['$adSource.platform', 'manual'] } },
                }
            },
            { $sort: { count: -1 } },
            { $limit: 100 }
        ]

        const orderItems = await OrderModel.aggregate(pipeline)
        const products = await ProductModel.find({ deletedAt: null }).select('name slug').lean()
        const productNames = new Set(products.map(p => p.name?.toLowerCase().trim()))

        const needsMapping = []
        const mapped = []

        for (const item of orderItems) {
            const itemName = (item._id || '').toLowerCase().trim()
            const matchedProduct = products.find(p =>
                p.name?.toLowerCase().trim() === itemName ||
                p.slug?.toLowerCase().includes(itemName.replace(/\s+/g, '-'))
            )
            if (matchedProduct) {
                mapped.push({ name: item._id, count: item.count, productId: matchedProduct._id, source: item.source })
            } else {
                const suggested = products.find(p => p.name?.toLowerCase().includes(itemName.slice(0, 5)))
                needsMapping.push({
                    _id: item._id,
                    name: item._id,
                    count: item.count,
                    source: item.source,
                    suggestedProductId: suggested?._id || null,
                    suggestedName: suggested?.name || null,
                })
            }
        }

        return response(true, 200, 'Sync data.', { needsMapping, mapped })
    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        return response(true, 200, 'Sync noted.')
    } catch (error) {
        return catchError(error)
    }
}
