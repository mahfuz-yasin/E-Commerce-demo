import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";


export async function GET() {
    try {

        await connectDB()

        // Get all variants to extract sizes
        const allVariants = await ProductVariantModel.find({ deletedAt: null }).select('size').lean()

        // Extract unique sizes from all variants
        const uniqueSizes = new Set()
        const validSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']

        allVariants.forEach(variant => {
            if (Array.isArray(variant.size)) {
                // New format: array of sizes
                variant.size.forEach(s => uniqueSizes.add(s))
            } else if (typeof variant.size === 'string') {
                // Old format: string like "SMLXL" - parse using valid sizes
                let remaining = variant.size
                // Sort valid sizes by length (descending) to match longer sizes first (XL before L)
                const sortedSizes = [...validSizes].sort((a, b) => b.length - a.length)
                for (const size of sortedSizes) {
                    while (remaining.includes(size)) {
                        uniqueSizes.add(size)
                        remaining = remaining.replace(size, '')
                    }
                }
            }
        })

        const sizes = Array.from(uniqueSizes)

        if (!sizes.length) {
            return response(false, 404, 'Size not found.')
        }

        return response(true, 200, 'Size found.', sizes)

    } catch (error) {
        return catchError(error)
    }
}