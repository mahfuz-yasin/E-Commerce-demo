import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FraudSettingsModel from "@/models/FraudSettings.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        let settings = await FraudSettingsModel.findOne().lean()
        if (!settings) {
            settings = await FraudSettingsModel.create({})
        }
        return response(true, 200, 'Fraud settings fetched.', settings)
    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const body = await request.json()
        const settings = await FraudSettingsModel.findOneAndUpdate(
            {},
            { $set: body },
            { upsert: true, new: true, runValidators: true }
        )
        return response(true, 200, 'Fraud settings updated.', settings)
    } catch (error) {
        return catchError(error)
    }
}
