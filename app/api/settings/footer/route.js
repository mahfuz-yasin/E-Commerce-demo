import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SettingsModel from "@/models/Settings.model";

export async function GET(request) {
    try {
        await connectDB()
        
        const footer = await SettingsModel.findOne({ 
            type: 'footer',
            key: 'main_footer',
            isActive: true
        }).lean()

        return response(true, 200, 'Footer fetched successfully', footer)
    } catch (error) {
        return catchError(error)
    }
}
