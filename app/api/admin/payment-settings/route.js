import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import PaymentSettingsModel from "@/models/PaymentSettings.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        let settings = await PaymentSettingsModel.findOne()
        if (!settings) settings = await PaymentSettingsModel.create({})
        return response(true, 200, 'Payment settings.', settings)
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
        let settings = await PaymentSettingsModel.findOne()
        if (!settings) {
            settings = await PaymentSettingsModel.create(body)
        } else {
            Object.assign(settings, body)
            await settings.save()
        }
        return response(true, 200, 'Settings saved.', settings)
    } catch (error) {
        return catchError(error)
    }
}
