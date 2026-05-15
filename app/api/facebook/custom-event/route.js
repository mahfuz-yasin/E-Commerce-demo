import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { sendFacebookEvent } from "@/lib/facebook-capi"
import FacebookConfigModel from "@/models/FacebookConfig.model"

export async function POST(request) {
    try {
        await connectDB()

        const payload = await request.json()
        const { eventName } = payload

        if (!eventName) {
            return response(false, 400, 'Event name is required')
        }

        const config = await FacebookConfigModel.getConfig()
        
        if (config.capiStatus !== 'active') {
            return response(false, 400, 'CAPI is not enabled')
        }

        // Send custom event to Facebook CAPI
        const result = await sendFacebookEvent(eventName, {}, {})

        return response(true, 200, 'Custom event sent successfully.', result)

    } catch (error) {
        return catchError(error)
    }
}
