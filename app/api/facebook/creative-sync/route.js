import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import ProductModel from "@/models/Product.model"
import MediaModel from "@/models/Media.model"
import { updateCreative } from "@/lib/metaMarketingAPI"

export async function POST(request) {
    try {
        await connectDB()

        const body = await request.json()
        const { productId, creativeId } = body

        if (!productId || !creativeId) {
            return response(false, 400, 'Product ID and Creative ID are required')
        }

        const config = await FacebookConfigModel.getConfig()

        if (!config.advantageCreativeSync || !config.adCampaignManagerEnabled) {
            return response(false, 400, 'Advantage+ Creative Sync is not enabled')
        }

        // Get product details
        const product = await ProductModel.findById(productId).lean()
        if (!product) {
            return response(false, 404, 'Product not found')
        }

        // Get primary image
        const primaryImage = product.media && product.media.length > 0
            ? await MediaModel.findById(product.media[0]).lean()
            : null

        const imageUrl = primaryImage?.secure_url || ''

        // Prepare creative update data
        const creativeData = {
            object_story_spec: {
                link_data: {
                    image_hash: imageUrl, // Note: This would need to be uploaded to Facebook first
                    message: product.shortDescription || product.description || '',
                    name: product.name,
                    call_to_action: {
                        type: 'SHOP_NOW'
                    }
                }
            }
        }

        // Update the creative on Facebook
        const result = await updateCreative(creativeId, creativeData)

        return response(true, 200, 'Creative synced successfully', result)
    } catch (error) {
        return catchError(error)
    }
}
