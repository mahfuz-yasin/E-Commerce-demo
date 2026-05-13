import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductModel from "@/models/Product.model"
import { encode } from "entities"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const colorSchema = z.array(z.object({
            name: z.string().min(1, 'Color name is required'),
            hex: z.string().min(1, 'Color hex is required'),
            isCustom: z.boolean().optional()
        })).min(1, 'At least one color is required')

        const schema = zSchema.pick({
            name: true,
            slug: true,
            category: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            shortDescription: true,
            longDescription: true,
            media: true
        }).extend({
            colors: colorSchema
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const productData = validate.data

        const newProduct = new ProductModel({
            name: productData.name,
            slug: productData.slug,
            category: productData.category,
            mrp: productData.mrp,
            sellingPrice: productData.sellingPrice,
            discountPercentage: productData.discountPercentage,
            shortDescription: encode(productData.shortDescription),
            longDescription: productData.longDescription,
            media: productData.media,
            colors: productData.colors,
        })

        await newProduct.save()

        return response(true, 200, 'Product added successfully.')

    } catch (error) {
        return catchError(error)
    }
}