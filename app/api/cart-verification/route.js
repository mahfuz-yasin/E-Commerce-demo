import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";
import ProductModel from "@/models/Product.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const verifiedCartData = await Promise.all(
            payload.map(async (cartItem) => {
                // First try to find as variant
                const variant = await ProductVariantModel.findById(cartItem.variantId).populate('product').populate('media', 'secure_url').lean()
                
                if (variant) {
                    return {
                        cartItemId: cartItem.cartItemId || Date.now() + Math.random().toString(36).substr(2, 9),
                        productId: variant.product._id,
                        variantId: variant._id,
                        name: variant.product.name,
                        url: variant.product.slug,
                        size: variant.size,
                        colors: variant.colors,
                        mrp: variant.mrp,
                        sellingPrice: variant.sellingPrice,
                        media: variant?.media[0]?.secure_url,
                        qty: cartItem.qty,
                    }
                }
                
                // If not found as variant, try to find as product (fallback for products without variants)
                const product = await ProductModel.findById(cartItem.variantId || cartItem.productId).populate('media', 'secure_url').lean()
                
                if (product) {
                    return {
                        cartItemId: cartItem.cartItemId || Date.now() + Math.random().toString(36).substr(2, 9),
                        productId: product._id,
                        variantId: product._id,
                        name: product.name,
                        url: product.slug,
                        size: cartItem.size || 'Default',
                        color: cartItem.color || 'Default',
                        mrp: product.mrp,
                        sellingPrice: product.sellingPrice,
                        media: product?.media[0]?.secure_url,
                        qty: cartItem.qty,
                    }
                }
                
                // If neither variant nor product found, return null
                return null
            })
        )

        // Filter out null values (items that couldn't be verified)
        const filteredCartData = verifiedCartData.filter(item => item !== null)

        return response(true, 200, 'Verified Cart Data.', filteredCartData)

    } catch (error) {
        return catchError(error)
    }
}