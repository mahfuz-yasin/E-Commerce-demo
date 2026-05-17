import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import SettingsModel from "@/models/Settings.model"

export async function GET() {
    try {
        await connectDB()

        const aboutPage = await SettingsModel.findOne({
            type: 'page',
            key: 'about-us'
        }).lean()

        if (!aboutPage) {
            return response(false, 404, 'About page not found')
        }

        return response(true, 200, 'About page fetched successfully', aboutPage)
    } catch (error) {
        return catchError(error)
    }
}
