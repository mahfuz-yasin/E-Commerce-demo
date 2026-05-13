import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SettingsModel from "@/models/Settings.model";

// GET all settings (admin)
export async function GET(request) {
    try {
        await connectDB()
        
        const settings = await SettingsModel.find()
            .sort({ type: 1, order: 1 })
            .lean()

        return response(true, 200, 'Settings fetched successfully', settings)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new setting (admin)
export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const setting = await SettingsModel.create(payload)

        return response(true, 201, 'Setting created successfully', setting)
    } catch (error) {
        return catchError(error)
    }
}
