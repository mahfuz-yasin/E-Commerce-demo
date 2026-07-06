import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductVariantModel from "@/models/ProductVariant.model"
import ProductModel from "@/models/Product.model"
import OrderModel from "@/models/Order.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const lowStockOnly = searchParams.get('lowStock') === 'true'
        const threshold = parseInt(searchParams.get('threshold') || '10')

        // Get all variants with product info
        const matchQuery = { deletedAt: null }
        if (lowStockOnly) {
            matchQuery.stock = { $lte: threshold }
        }

        const variants = await ProductVariantModel.find(matchQuery)
            .populate({
                path: 'product',
                select: 'name slug category',
                match: search ? { name: { $regex: search, $options: 'i' } } : {}
            })
            .lean()

        const filtered = variants.filter(v => v.product !== null)

        // Calculate sold units from delivered orders
        const soldMap = {}
        const deliveredOrders = await OrderModel.find({ status: 'delivered', deletedAt: null })
            .select('products')
            .lean()

        for (const order of deliveredOrders) {
            for (const p of order.products || []) {
                const vid = p.variantId?.toString()
                if (vid) soldMap[vid] = (soldMap[vid] || 0) + p.qty
            }
        }

        const stockData = filtered.map(v => {
            const sold = soldMap[v._id?.toString()] || 0
            const stock = v.stock ?? 0
            return {
                _id: v._id,
                productName: v.product?.name,
                productSlug: v.product?.slug,
                sku: v.sku,
                colors: v.colors?.map(c => c.name).join(', '),
                sizes: v.size?.join(', '),
                mrp: v.mrp,
                sellingPrice: v.sellingPrice,
                stock,
                sold,
                status: stock === 0 ? 'out_of_stock' : stock <= threshold ? 'low_stock' : 'in_stock',
            }
        })

        const summary = {
            total: stockData.length,
            inStock: stockData.filter(s => s.status === 'in_stock').length,
            lowStock: stockData.filter(s => s.status === 'low_stock').length,
            outOfStock: stockData.filter(s => s.status === 'out_of_stock').length,
        }

        return response(true, 200, 'Stock report generated.', { data: stockData, summary })
    } catch (error) {
        return catchError(error)
    }
}
