import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import PageBuilderModel from "@/models/PageBuilder.model";

// GET all pages (admin)
export async function GET(request) {
    try {
        await connectDB()
        
        const pages = await PageBuilderModel.find()
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Pages fetched successfully', pages)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new page (admin)
export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const page = await PageBuilderModel.create(payload)

        return response(true, 201, 'Page created successfully', page)
    } catch (error) {
        return catchError(error)
    }
}
