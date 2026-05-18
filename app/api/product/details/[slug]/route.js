import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";

// Note: Models imported dynamically to prevent Server Component initialization errors

export async function GET(request, { params }) {
    try {
        console.log('[API /product/details] Request received:', request.url)
        
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.error('[API /product/details] MONGODB_URI not set!')
            return response(false, 500, 'Server configuration error.')
        }

        console.log('[API /product/details] Connecting to database...')
        await connectDB()
        console.log('[API /product/details] Database connected')
        
        // Dynamic imports to prevent module initialization errors
        const { default: ProductModel } = await import('@/models/Product.model')
        const { default: ProductVariantModel } = await import('@/models/ProductVariant.model')
        const { default: ReviewModel } = await import('@/models/Review.model')

        const getParams = await params
        const slug = getParams.slug

        const searchParams = request.nextUrl.searchParams
        const size = searchParams.get('size')
        const color = searchParams.get('color')


        const filter = {
            deletedAt: null
        }

        if (!slug) {
            return response(false, 404, 'Product not found.')
        }

        filter.slug = slug

        // get product 
        const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean()

        if (!getProduct) {
            return response(false, 404, 'Product not found.')
        }

        // get product variant 
        const variantFilter = {
            product: getProduct._id
        }

        if (size) {
            variantFilter.size = { $in: size.split(',') }
        }
        if (color) {
            variantFilter.colors = { $elemMatch: { name: color } }
        }

        const variant = await ProductVariantModel.findOne(variantFilter).populate('media', 'secure_url').lean()

        // If no variant found with specific filters, try to get any variant for this product
        let selectedVariant = variant
        if (!selectedVariant) {
            selectedVariant = await ProductVariantModel.findOne({ product: getProduct._id }).populate('media', 'secure_url').lean()
        }

        // If still no variant, use product data as fallback
        if (!selectedVariant) {
            selectedVariant = {
                _id: getProduct._id,
                product: getProduct._id,
                name: getProduct.name,
                size: getProduct.size || ['M'],
                colors: getProduct.colors || [{ name: 'Default', code: '#000000' }],
                mrp: getProduct.mrp,
                sellingPrice: getProduct.sellingPrice,
                media: getProduct.media || [],
                stock: getProduct.stock || 0
            }
        }

        // get color and size 

        // Get all variants and extract unique color names from colors array
        const allVariantsForColors = await ProductVariantModel.find({ product: getProduct._id }).select('colors').lean()
        const uniqueColors = new Set()
        allVariantsForColors.forEach(variant => {
            if (Array.isArray(variant.colors)) {
                variant.colors.forEach(c => {
                    if (c.name) uniqueColors.add(c.name)
                })
            }
        })
        const getColor = Array.from(uniqueColors)

        // Handle both old format (string) and new format (array) for sizes
        // First get all variants to process sizes
        const allVariants = await ProductVariantModel.find({ product: getProduct._id }).select('size').lean()

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

        const getSize = Array.from(uniqueSizes).map(size => ({ size }))


        // get review  

        const review = await ReviewModel.countDocuments({ product: getProduct._id })


        const productData = {
            product: getProduct,
            variant: selectedVariant,
            colors: getColor,
            sizes: getSize.length ? getSize.map(item => item.size) : [],
            reviewCount: review
        }

        console.log('[API /product/details] Success:', getProduct.name)
        return response(true, 200, 'Product data found.', productData)

    } catch (error) {
        console.error('[API /product/details] Error:', error.message, error.stack)
        return catchError(error, 'Failed to fetch product details')
    }
}