import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import PageBuilderModel from "@/models/PageBuilder.model";

// GET all pages (admin)
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const pageType = searchParams.get('pageType')
        
        const query = pageType ? { pageType } : {}
        
        const pages = await PageBuilderModel.find(query)
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
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const page = await PageBuilderModel.create(payload)

        return response(true, 201, 'Page created successfully', page)
    } catch (error) {
        return catchError(error)
    }
}
