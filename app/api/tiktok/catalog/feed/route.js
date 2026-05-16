import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import MediaModel from "@/models/Media.model"
import CategoryModel from "@/models/Category.model"
import crypto from 'crypto'
import { rateLimit } from "@/lib/rateLimiter"

// Rate limiter: 50 requests per minute for feed
const limiter = rateLimit(50, 60000, 'tiktok-feed')

// Optional security token - set in environment variable
const FEED_TOKEN = process.env.TIKTOK_FEED_TOKEN || null

// Cache duration in seconds
const CACHE_DURATION = 3600

/**
 * Clean description by removing HTML tags and formatting for TikTok Catalog
 * @param {string} description - Raw description
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
    if (!description) return ''
    
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '')
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // Limit to 5000 characters (TikTok limit)
    if (cleaned.length > 5000) {
        cleaned = cleaned.substring(0, 4997) + '...'
    }
    
    return cleaned
}

/**
 * Optimize image URL using Cloudinary transformations (2026 standards)
 * Ensures 1:1 aspect ratio, auto-format, auto-quality, lightweight images
 * @param {string} imageUrl - Original image URL
 * @returns {string} Optimized image URL
 */
function optimizeImageUrl(imageUrl) {
  if (!imageUrl) return ''

  try {
    // Check if already a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      // TikTok 2026 standards: 1:1 aspect ratio, 800x800, auto-format, auto-quality
      // Use f_auto for WebP/Avif, q_auto for optimal quality, c_fill for 1:1 aspect ratio
      const transformations = 'w_800,h_800,c_fill,f_auto,q_auto,fl_progressive'
      
      // Insert transformations before the file extension
      if (imageUrl.includes('/upload/')) {
        return imageUrl.replace('/upload/', `/upload/${transformations}/`)
      }
      return imageUrl
    }

    // For non-Cloudinary images, return as-is (or implement CDN transformation)
    return imageUrl
  } catch (error) {
    return imageUrl
  }
}

export async function GET(request) {
    try {
        // Apply rate limiting
        const rateLimitResult = await limiter(request)
        if (!rateLimitResult.success) {
            return response(false, 429, 'Rate limit exceeded')
        }

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')
        const token = searchParams.get('token')

        // Validate format
        if (!['json', 'xml'].includes(format)) {
            return response(false, 400, 'Invalid format. Use "json" or "xml".')
        }

        // Validate token if configured
        if (FEED_TOKEN && token !== FEED_TOKEN) {
            return response(false, 403, 'Unauthorized. Invalid or missing token.')
        }

        // Validate pagination
        if (limit > 1000) {
            return response(false, 400, 'Limit cannot exceed 1000.')
        }

        await connectDB()

        // Get products with variants
        const products = await ProductModel.find({ deletedAt: null })
            .populate('category')
            .populate('media')
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()

        // Get variants for each product
        const productIds = products.map(p => p._id)
        const variants = await ProductVariantModel.find({ 
            product: { $in: productIds },
            deletedAt: null 
        })
            .populate('media')
            .lean()

        // Group variants by product
        const variantsByProduct = {}
        variants.forEach(variant => {
            if (!variantsByProduct[variant.product]) {
                variantsByProduct[variant.product] = []
            }
            variantsByProduct[variant.product].push(variant)
        })

        // Generate feed data
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
        const feedData = {
            catalog_id: 'alhilalpanjabi-tiktok-catalog',
            title: 'Al Hilal Panjabi TikTok Catalog',
            description: 'Complete product catalog for TikTok Commerce',
            link: baseUrl,
            updated_at: new Date().toISOString(),
            items: []
        }

        for (const product of products) {
            const productVariants = variantsByProduct[product._id] || []
            const primaryImage = product.media && product.media.length > 0 
                ? await MediaModel.findById(product.media[0]).lean() 
                : null
            const primaryImageUrl = getOptimizedImageUrl(primaryImage?.secure_url || '')
            
            // Additional images
            const additionalImages = []
            if (product.media && product.media.length > 1) {
                for (let i = 1; i < product.media.length; i++) {
                    const img = await MediaModel.findById(product.media[i]).lean()
                    if (img) additionalImages.push(getOptimizedImageUrl(img.secure_url))
                }
            }

            // Main product item (if no variants or for the parent)
            if (productVariants.length === 0) {
                feedData.items.push({
                    id: product._id.toString(),
                    title: product.name,
                    description: cleanDescription(product.shortDescription || product.description || ''),
                    link: `${baseUrl}/product/${product.slug}`,
                    image_link: primaryImageUrl,
                    additional_image_link: additionalImages,
                    price: product.sellingPrice.toFixed(2),
                    sale_price: product.discountPercentage > 0 ? product.sellingPrice.toFixed(2) : undefined,
                    availability: product.stock > 0 ? 'in stock' : 'out of stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    product_type: product.category?.name || 'Panjabi',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    // TikTok 2026 specific attributes
                    gender: 'male',
                    age_group: 'adult',
                    pattern: 'clothing',
                    material: product.material || 'cotton',
                    color: product.color || 'traditional'
                })
            }

            // Variant items
            for (const variant of productVariants) {
                const variantImage = variant.media && variant.media.length > 0
                    ? await MediaModel.findById(variant.media[0]).lean()
                    : primaryImage
                
                const variantImageUrl = getOptimizedImageUrl(variantImage?.secure_url || primaryImageUrl)
                
                // Variant additional images
                const variantAdditionalImages = []
                if (variant.media && variant.media.length > 1) {
                    for (let i = 1; i < variant.media.length; i++) {
                        const img = await MediaModel.findById(variant.media[i]).lean()
                        if (img) variantAdditionalImages.push(getOptimizedImageUrl(img.secure_url))
                    }
                }

                feedData.items.push({
                    id: variant._id.toString(),
                    title: `${product.name} - ${variant.name}`,
                    description: cleanDescription(product.shortDescription || product.description || ''),
                    link: `${baseUrl}/product/${product.slug}?variant=${variant._id}`,
                    image_link: variantImageUrl,
                    additional_image_link: variantAdditionalImages,
                    price: variant.sellingPrice.toFixed(2),
                    sale_price: variant.discountPercentage > 0 ? variant.sellingPrice.toFixed(2) : undefined,
                    availability: variant.stock > 0 ? 'in stock' : 'out of stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    product_type: product.category?.name || 'Panjabi',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    // TikTok 2026 specific attributes
                    gender: 'male',
                    age_group: 'adult',
                    pattern: 'clothing',
                    material: variant.material || product.material || 'cotton',
                    color: variant.color || product.color || 'traditional',
                    size: variant.size || 'standard'
                })
            }
        }

        // Generate ETag for cache validation
        const feedString = JSON.stringify(feedData)
        const etag = crypto.createHash('md5').update(feedString).digest('hex')

        const headers = new Headers()
        headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`)
        headers.set('ETag', `"${etag}"`)
        
        if (format === 'json') {
            headers.set('Content-Type', 'application/json')
            return new Response(JSON.stringify(feedData), { headers })
        } else {
            headers.set('Content-Type', 'application/xml')
            const xml = generateXMLFeed(feedData.items)
            return new Response(xml, { headers })
        }

    } catch (error) {
        return catchError(error)
    }
}

function generateXMLFeed(items) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Al Hilal Panjabi TikTok Products</title>
    <link>${baseUrl}</link>
    <description>Product catalog for TikTok Commerce</description>
`

    items.forEach(item => {
        xml += `
    <item>
      <g:id>${escapeXML(item.id)}</g:id>
      <g:title>${escapeXML(item.title)}</g:title>
      <g:description>${escapeXML(item.description || '')}</g:description>
      <g:link>${escapeXML(item.link)}</g:link>
      <g:image_link>${escapeXML(item.image_link)}</g:image_link>
      <g:brand>Al Hilal Panjabi</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${escapeXML(item.availability)}</g:availability>
      <g:price>${escapeXML(item.price)} BDT</g:price>
      <g:google_product_category>${escapeXML(item.google_product_category)}</g:google_product_category>
      <g:product_type>${escapeXML(item.product_type)}</g:product_type>`

        if (item.sale_price) {
            xml += `
      <g:sale_price>${escapeXML(item.sale_price)} BDT</g:sale_price>`
        }

        xml += `
    </item>`
    })

    xml += `
  </channel>
</rss>`

    return xml
}

function escapeXML(str) {
    if (!str) return ''
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
