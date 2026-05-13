import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import PageBuilderModel from "@/models/PageBuilder.model";

export async function GET(request, { params }) {
    try {
        await connectDB()
        
        const page = await PageBuilderModel.findOne({ 
            slug: params.slug,
            isActive: true,
            isPublished: true
        }).lean()

        if (!page) {
            return response(false, 404, 'Page not found')
        }

        return response(true, 200, 'Page fetched successfully', page)
    } catch (error) {
        return catchError(error)
    }
}
