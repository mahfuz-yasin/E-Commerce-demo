import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ContentModel from "@/models/Content.model";

export async function GET(request, { params }) {
    try {
        await connectDB()
        
        const content = await ContentModel.findOne({ 
            slug: params.slug,
            isActive: true 
        }).lean()

        if (!content) {
            return response(false, 404, 'Content not found')
        }

        return response(true, 200, 'Content fetched successfully', content)
    } catch (error) {
        return catchError(error)
    }
}
