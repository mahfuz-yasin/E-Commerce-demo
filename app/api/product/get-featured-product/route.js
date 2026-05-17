import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";

export async function GET() {
    try {
        await connectDB()

        const getProduct = await ProductModel.find({ deletedAt: null }).populate('media').limit(8).lean()

        return response(true, 200, 'Products found.', getProduct || [])

    } catch (error) {
        console.error('Error fetching featured products:', error)
        return response(false, 500, 'Failed to fetch products')
    }
}