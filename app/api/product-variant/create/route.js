import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function POST(request) {
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

        const variantData = validate.data

        const newProductVariant = new ProductVariantModel({
            product: variantData.product,
            colors: variantData.colors,
            size: variantData.size,
            sku: variantData.sku,
            mrp: variantData.mrp,
            sellingPrice: variantData.sellingPrice,
            discountPercentage: variantData.discountPercentage,
            media: variantData.media,
        })

        await newProductVariant.save()

        return response(true, 200, 'Product Variant added successfully.')

    } catch (error) {
        return catchError(error)
    }
}