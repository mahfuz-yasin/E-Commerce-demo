import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function GET(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        // Get product count
        const productCount = await ProductModel.countDocuments({ deletedAt: null })
        const variantCount = await ProductVariantModel.countDocuments({ deletedAt: null })
        
        return response(true, 200, 'Sync status retrieved successfully.', {
            lastSync: config.lastCatalogSync || null,
            productCount: productCount + variantCount,
            catalogId: config.catalogId || null,
            catalogStatus: config.catalogStatus || 'inactive'
        })

    } catch (error) {
        return catchError(error)
    }
}
