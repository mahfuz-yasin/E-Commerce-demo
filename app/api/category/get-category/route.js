import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";

import CategoryModel from "@/models/Category.model";
import MediaModel from "@/models/Media.model";

export async function GET() {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning empty categories array')
            return response(true, 200, 'Category found.', [])
        }
        
        await connectDB()

        const getCategory = await CategoryModel.find({ deletedAt: null }).populate('image').lean()

        if (!getCategory) {
            return response(true, 200, 'Category found.', [])
        }

        return response(true, 200, 'Category found.', getCategory)

    } catch (error) {
        console.error('Error fetching categories:', error)
        // Return empty array instead of error
        return response(true, 200, 'Category found.', [])
    }
}