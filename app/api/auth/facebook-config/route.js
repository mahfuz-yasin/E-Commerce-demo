import { connectDB } from "@/lib/databaseConnection"
import FacebookConfigModel from "@/models/FacebookConfig.model"

export async function GET() {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.appId || !config.appSecret) {
            return Response.json(
                { error: 'Facebook credentials not configured' },
                { status: 400 }
            )
        }

        return Response.json({
            clientId: config.appId,
            clientSecret: config.appSecret
        })
    } catch (error) {
        console.error('Error fetching Facebook config:', error)
        return Response.json(
            { error: 'Failed to fetch Facebook config' },
            { status: 500 }
        )
    }
}
