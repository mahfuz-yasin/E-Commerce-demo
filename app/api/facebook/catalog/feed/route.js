import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import MediaModel from "@/models/Media.model"
import CategoryModel from "@/models/Category.model"
import crypto from 'crypto'
import { rateLimit } from "@/lib/rateLimiter"

// Rate limiter: 50 requests per minute for feed
const limiter = rateLimit(50, 60000, 'facebook-feed')

// Optional security token - set in environment variable
const FEED_TOKEN = process.env.FACEBOOK_FEED_TOKEN || null

// Cache duration in seconds
const CACHE_DURATION = 3600

// Exchange rates (can be updated from API or database)
const EXCHANGE_RATES = {
    BDT: 1,
    USD: 0.0091,
    EUR: 0.0084,
    GBP: 0.0072
}

/**
 * Clean description by removing HTML tags and formatting for Meta Catalog SEO
 * @param {string} description - Raw description
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
    if (!description) return ''
    
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '')
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // Limit to 5000 characters (Meta limit)
    if (cleaned.length > 5000) {
        cleaned = cleaned.substring(0, 4997) + '...'
    }
    
    return cleaned
}

/**
 * Get multi-currency pricing
 * @param {number} priceBDT - Price in BDT
 * @returns {object} Multi-currency pricing
 */
function getMultiCurrencyPricing(priceBDT) {
    return {
        BDT: priceBDT,
        USD: (priceBDT * EXCHANGE_RATES.USD).toFixed(2),
        EUR: (priceBDT * EXCHANGE_RATES.EUR).toFixed(2),
        GBP: (priceBDT * EXCHANGE_RATES.GBP).toFixed(2)
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
            id: baseUrl,
            title: 'Al Hilal Panjabi Product Catalog',
            description: 'Complete product catalog for Al Hilal Panjabi',
            link: baseUrl,
            updated_at: new Date().toISOString(),
            items: []
        }

        for (const product of products) {
            const productVariants = variantsByProduct[product._id] || []
            const primaryImage = product.media && product.media.length > 0 
                ? await MediaModel.findById(product.media[0]).lean() 
                : null
            const primaryImageUrl = primaryImage?.secure_url || ''
            
            // Additional images
            const additionalImages = []
            if (product.media && product.media.length > 1) {
                for (let i = 1; i < product.media.length; i++) {
                    const img = await MediaModel.findById(product.media[i]).lean()
                    if (img) additionalImages.push(img.secure_url)
                }
            }

            // Main product item (if no variants or for the parent)
            if (productVariants.length === 0) {
                const pricing = getMultiCurrencyPricing(product.sellingPrice)
                feedData.items.push({
                    id: product._id.toString(),
                    title: product.name,
                    description: cleanDescription(product.shortDescription || product.description || ''),
                    link: `${baseUrl}/product/${product.slug}`,
                    image_link: primaryImageUrl,
                    additional_image_link: additionalImages,
                    price: `${pricing.BDT} BDT`,
                    // Multi-currency override tags
                    price_usd: `${pricing.USD} USD`,
                    price_eur: `${pricing.EUR} EUR`,
                    price_gbp: `${pricing.GBP} GBP`,
                    sale_price: product.discountPercentage > 0 ? `${product.sellingPrice} BDT` : undefined,
                    availability: 'in stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    product_type: product.category?.name || 'Panjabi',
                    // Variant parameters for DPA
                    gender: 'male',
                    item_group_id: undefined
                })
            }

            // Variant items
            for (const variant of productVariants) {
                const variantImage = variant.media && variant.media.length > 0
                    ? await MediaModel.findById(variant.media[0]).lean()
                    : primaryImage
                
                const variantImageUrl = variantImage?.secure_url || primaryImageUrl
                
                // Variant additional images
                const variantAdditionalImages = []
                if (variant.media && variant.media.length > 1) {
                    for (let i = 1; i < variant.media.length; i++) {
                        const img = await MediaModel.findById(variant.media[i]).lean()
                        if (img) variantAdditionalImages.push(img.secure_url)
                    }
                }

                // Extract variant parameters
                const variantParams = {
                    size: variant.size || undefined,
                    color: variant.color || undefined,
                    material: variant.material || undefined
                }

                const pricing = getMultiCurrencyPricing(variant.sellingPrice)

                feedData.items.push({
                    id: variant._id.toString(),
                    title: `${product.name} - ${variant.name}`,
                    description: cleanDescription(product.shortDescription || product.description || ''),
                    link: `${baseUrl}/product/${product.slug}?variant=${variant._id}`,
                    image_link: variantImageUrl,
                    additional_image_link: variantAdditionalImages,
                    price: `${pricing.BDT} BDT`,
                    // Multi-currency override tags
                    price_usd: `${pricing.USD} USD`,
                    price_eur: `${pricing.EUR} EUR`,
                    price_gbp: `${pricing.GBP} GBP`,
                    sale_price: variant.discountPercentage > 0 ? `${variant.sellingPrice} BDT` : undefined,
                    availability: 'in stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    product_type: product.category?.name || 'Panjabi',
                    // Variant parameters for DPA
                    gender: 'male',
                    size: variantParams.size,
                    color: variantParams.color,
                    material: variantParams.material,
                    item_group_id: product._id.toString()
                })
            }
        }

        const headers = new Headers()
        headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
        
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
    <title>Al Hilal Panjabi Products</title>
    <link>${baseUrl}</link>
    <description>Product catalog for Facebook</description>
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
      <g:price>${escapeXML(item.price)}</g:price>
      <g:google_product_category>${escapeXML(item.google_product_category)}</g:google_product_category>
      <g:product_type>${escapeXML(item.product_type)}</g:product_type>`

        // Multi-currency override tags
        if (item.price_usd) {
            xml += `
      <g:price_usd>${escapeXML(item.price_usd)}</g:price_usd>`
        }
        if (item.price_eur) {
            xml += `
      <g:price_eur>${escapeXML(item.price_eur)}</g:price_eur>`
        }
        if (item.price_gbp) {
            xml += `
      <g:price_gbp>${escapeXML(item.price_gbp)}</g:price_gbp>`
        }

        // Variant parameters for DPA
        if (item.gender) {
            xml += `
      <g:gender>${escapeXML(item.gender)}</g:gender>`
        }
        if (item.size) {
            xml += `
      <g:size>${escapeXML(item.size)}</g:size>`
        }
        if (item.color) {
            xml += `
      <g:color>${escapeXML(item.color)}</g:color>`
        }
        if (item.material) {
            xml += `
      <g:material>${escapeXML(item.material)}</g:material>`
        }

        if (item.item_group_id) {
            xml += `
      <g:item_group_id>${escapeXML(item.item_group_id)}</g:item_group_id>`
        }

        if (item.sale_price) {
            xml += `
      <g:sale_price>${escapeXML(item.sale_price)}</g:sale_price>`
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
