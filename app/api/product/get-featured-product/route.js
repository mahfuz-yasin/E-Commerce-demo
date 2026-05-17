import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";

export async function GET() {
    try {
        await connectDB()

        const getProduct = await ProductModel.find({ deletedAt: null }).limit(8).lean()

        if (!getProduct || getProduct.length === 0) {
            return response(true, 200, 'No products found.', [])
        }

        return response(true, 200, 'Products found.', getProduct)

    } catch (error) {
        return catchError(error)
    }
}