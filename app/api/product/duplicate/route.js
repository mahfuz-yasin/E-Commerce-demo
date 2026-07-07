import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        const { id } = await request.json()
        const original = await ProductModel.findById(id).lean()
        if (!original) return response(false, 404, 'Product not found.')

        const { _id, slug, createdAt, updatedAt, ...rest } = original
        const newSlug = `${slug || 'product'}-copy-${Date.now()}`
        const newProduct = await ProductModel.create({ ...rest, slug: newSlug, name: `${original.name} (Copy)` })

        // Duplicate variants
        const variants = await ProductVariantModel.find({ product: _id, deletedAt: null }).lean()
        if (variants.length > 0) {
            await ProductVariantModel.insertMany(
                variants.map(({ _id: vid, createdAt: vca, updatedAt: vua, ...v }) => ({ ...v, product: newProduct._id }))
            )
        }

        return response(true, 201, 'Product duplicated.', { _id: newProduct._id })
    } catch (error) {
        return catchError(error)
    }
}
