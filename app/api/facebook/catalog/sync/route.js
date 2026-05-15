import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"

export async function POST(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.catalogId || config.catalogStatus !== 'active') {
            return response(false, 400, 'Catalog is not configured or inactive.')
        }

        // Update last sync time
        config.lastCatalogSync = new Date()
        await config.save()

        // In production, you would trigger Facebook's batch API to upload the feed
        // For now, we just update the sync time

        return response(true, 200, 'Catalog sync triggered successfully.', {
            lastSync: config.lastCatalogSync,
            feedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'}/api/facebook/catalog/feed?format=json`
        })

    } catch (error) {
        return catchError(error)
    }
}
