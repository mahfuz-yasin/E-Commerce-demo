import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import ProductModel from "@/models/Product.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET products for DPA
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const catalogId = searchParams.get('catalogId')
        const category = searchParams.get('category')
        const inStock = searchParams.get('inStock')
        
        let query = {}
        if (category) {
            query.category = category
        }
        if (inStock === 'true') {
            query.stock = { $gt: 0 }
        }
        
        const products = await ProductModel.find(query)
            .select('name price stock images description category variants')
            .lean()

        // Transform to Facebook catalog format
        const catalogProducts = products.map(product => ({
            id: product._id.toString(),
            title: product.name,
            description: product.description,
            availability: product.stock > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            price: product.price,
            link: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}`,
            image_link: product.images?.[0] || '',
            brand: 'Al Hilal Panjabi',
            category: product.category
        }))

        return response(true, 200, 'Products fetched successfully', catalogProducts)
    } catch (error) {
        return catchError(error)
    }
}

// POST sync products to Facebook catalog
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const { catalogId, productIds } = payload
        
        if (!catalogId) {
            return response(false, 400, 'Catalog ID is required')
        }
        
        let query = {}
        if (productIds && productIds.length > 0) {
            query._id = { $in: productIds }
        }
        
        const products = await ProductModel.find(query)
            .select('name price stock images description category variants slug')
            .lean()

        // Transform to Facebook catalog format
        const catalogProducts = products.map(product => ({
            id: product._id.toString(),
            title: product.name,
            description: product.description,
            availability: product.stock > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            price: product.price,
            link: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.slug}`,
            image_link: product.images?.[0] || '',
            brand: 'Al Hilal Panjabi',
            category: product.category
        }))

        // Sync to Facebook
        const fbConfig = await FacebookConfigModel.getConfig()
        if (fbConfig.catalogStatus === 'active' && fbConfig.catalogId) {
            const syncResult = await metaMarketingAPI.syncProductsToCatalog({
                catalogId: fbConfig.catalogId,
                products: catalogProducts,
                accessToken: fbConfig.adAccountAccessToken || fbConfig.capiAccessToken
            })
            
            if (syncResult.success) {
                // Update last sync time
                fbConfig.lastCatalogSync = new Date()
                await fbConfig.save()
                
                return response(true, 200, 'Products synced successfully', {
                    synced: catalogProducts.length,
                    batchId: syncResult.data.batchId
                })
            } else {
                return response(false, 500, syncResult.message || 'Failed to sync products')
            }
        } else {
            return response(false, 400, 'Facebook catalog is not configured')
        }
    } catch (error) {
        return catchError(error)
    }
}
