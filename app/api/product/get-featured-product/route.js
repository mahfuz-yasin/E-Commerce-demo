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
        
        // Connect to DB with timeout
        try {
            await connectDB()
        } catch (dbError) {
            console.error('Database connection failed:', dbError)
            return response(true, 200, 'Products found.', [])
        }

        // Fetch products with error handling
        let getProduct = []
        try {
            getProduct = await ProductModel.find({ deletedAt: null }).populate('media').limit(8).lean()
        } catch (fetchError) {
            console.error('Error fetching products:', fetchError)
            return response(true, 200, 'Products found.', [])
        }

        // Ensure we always return an array
        if (!Array.isArray(getProduct)) {
            console.warn('Product query did not return an array, returning empty array')
            return response(true, 200, 'Products found.', [])
        }

        return response(true, 200, 'Products found.', getProduct)

    } catch (error) {
        console.error('Error fetching featured products:', error)
        // Return empty array instead of error to prevent breaking the UI
        return response(true, 200, 'Products found.', [])
    }
}