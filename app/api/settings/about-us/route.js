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
            return response(true, 200, 'About page not found, using default content', null)
        }

        return response(true, 200, 'About page fetched successfully', aboutPage)
    } catch (error) {
        console.error('Error fetching about page:', error)
        return response(true, 200, 'Error fetching about page', null)
    }
}
