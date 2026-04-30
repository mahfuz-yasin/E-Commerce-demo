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
        })

        await newProduct.save()

        return response(true, 200, 'Product added successfully.')

    } catch (error) {
        return catchError(error)
    }
}