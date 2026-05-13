import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const colorsSchema = z.array(z.object({
            name: z.string().min(1, 'Color name is required'),
            hex: z.string().min(1, 'Color hex is required'),
            isCustom: z.boolean().optional()
        })).min(1, 'At least one color is required')

        const schema = zSchema.pick({
            _id: true,
            product: true,
            sku: true,
            size: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            media: true
        }).extend({
            colors: colorsSchema
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const validatedData = validate.data

        const getProductVariant = await ProductVariantModel.findOne({ deletedAt: null, _id: validatedData._id })
        if (!getProductVariant) {
            return response(false, 404, 'Data not found.')
        }

        getProductVariant.product = validatedData.product
        getProductVariant.colors = validatedData.colors
        getProductVariant.size = validatedData.size
        getProductVariant.sku = validatedData.sku
        getProductVariant.mrp = validatedData.mrp
        getProductVariant.sellingPrice = validatedData.sellingPrice
        getProductVariant.discountPercentage = validatedData.discountPercentage
        getProductVariant.media = validatedData.media
        await getProductVariant.save()

        return response(true, 200, 'Product variant updated successfully.')

    } catch (error) {
        return catchError(error)
    }
}