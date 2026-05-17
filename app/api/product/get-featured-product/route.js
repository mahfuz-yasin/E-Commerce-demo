import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";

export async function GET() {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning empty products array')
            return response(true, 200, 'Products found.', [])
        }
        
        await connectDB()

        const getProduct = await ProductModel.find({ deletedAt: null }).populate('media').limit(8).lean()

        return response(true, 200, 'Products found.', getProduct || [])

    } catch (error) {
        console.error('Error fetching featured products:', error)
        // Return empty array instead of error to prevent breaking the UI
        return response(true, 200, 'Products found.', [])
    }
}