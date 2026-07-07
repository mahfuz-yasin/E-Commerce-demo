import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()

        const [totalProducts, variants] = await Promise.all([
            ProductModel.countDocuments({ deletedAt: null }),
            ProductVariantModel.find({ deletedAt: null }).select('stock mrp sellingPrice').lean(),
        ])

        let totalStock = 0, outOfStock = 0, lowStock = 0
        let totalCostValue = 0, totalSellValue = 0

        for (const v of variants) {
            const s = v.stock ?? 0
            totalStock += s
            if (s === 0) outOfStock++
            else if (s <= 5) lowStock++
            totalCostValue += (v.mrp || 0) * s
            totalSellValue += (v.sellingPrice || v.mrp || 0) * s
        }

        const activeProducts = totalProducts // all non-deleted = active
        const potentialProfit = totalSellValue - totalCostValue

        return response(true, 200, 'Product summary.', {
            totalProducts,
            activeProducts,
            outOfStock,
            lowStock,
            totalStock,
            totalCostValue,
            totalSellValue,
            potentialProfit,
        })
    } catch (error) {
        return catchError(error)
    }
}
