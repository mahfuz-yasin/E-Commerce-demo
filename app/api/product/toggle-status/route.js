import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        const { id } = await request.json()
        const product = await ProductModel.findById(id).select('isActive')
        if (!product) return response(false, 404, 'Product not found.')

        product.isActive = !product.isActive
        await product.save()

        return response(true, 200, `Product ${product.isActive ? 'activated' : 'deactivated'}.`, { isActive: product.isActive })
    } catch (error) {
        return catchError(error)
    }
}
