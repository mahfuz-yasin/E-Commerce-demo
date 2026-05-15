import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import MediaModel from "@/models/Media.model"
import CategoryModel from "@/models/Category.model"
import crypto from 'crypto'

// Optional security token - set in environment variable
const FEED_TOKEN = process.env.FACEBOOK_FEED_TOKEN || null

// Cache duration in seconds
const CACHE_DURATION = 3600

export async function GET(request) {
    try {
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
        const feedData = {
            id: `https://alhilalpanjabi.com`,
            title: 'Al Hilal Panjabi Product Catalog',
            description: 'Complete product catalog for Al Hilal Panjabi',
            link: 'https://alhilalpanjabi.com',
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
                feedData.items.push({
                    id: product._id.toString(),
                    title: product.name,
                    description: product.shortDescription || '',
                    link: `https://alhilalpanjabi.com/product/${product.slug}`,
                    image_link: primaryImageUrl,
                    additional_image_link: additionalImages,
                    price: `${product.sellingPrice} BDT`,
                    sale_price: product.discountPercentage > 0 ? `${product.sellingPrice} BDT` : undefined,
                    availability: 'in stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    product_type: product.category?.name || 'Panjabi',
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

                feedData.items.push({
                    id: variant._id.toString(),
                    title: `${product.name} - ${variant.colors?.map(c => c.name).join(', ') || ''}`,
                    description: product.shortDescription || '',
                    link: `https://alhilalpanjabi.com/product/${product.slug}`,
                    image_link: variantImageUrl,
                    additional_image_link: variantAdditionalImages.length > 0 ? variantAdditionalImages : undefined,
                    price: `${variant.sellingPrice} BDT`,
                    sale_price: variant.discountPercentage > 0 ? `${variant.sellingPrice} BDT` : undefined,
                    availability: variant.stock > 0 ? 'in stock' : 'out of stock',
                    brand: 'Al Hilal Panjabi',
                    condition: 'new',
                    google_product_category: 'Apparel & Accessories > Clothing',
                    product_type: product.category?.name || 'Panjabi',
                    item_group_id: product._id.toString()
                })
            }
        }

        // Generate ETag
        const etag = crypto.createHash('md5').update(JSON.stringify(feedData)).digest('hex')
        const lastModified = new Date().toUTCString()

        if (format === 'json') {
            return new Response(JSON.stringify(feedData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': `public, max-age=${CACHE_DURATION}`,
                    'ETag': etag,
                    'Last-Modified': lastModified
                }
            })
        } else {
            // Generate XML (RSS 2.0 format)
            const xml = generateXMLFeed(feedData)
            return new Response(xml, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': `public, max-age=${CACHE_DURATION}`,
                    'ETag': etag,
                    'Last-Modified': lastModified
                }
            })
        }

    } catch (error) {
        return catchError(error)
    }
}

function generateXMLFeed(feedData) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXML(feedData.title)}</title>
    <link>${escapeXML(feedData.link)}</link>
    <description>${escapeXML(feedData.description)}</description>
    <lastBuildDate>${feedData.updated_at}</lastBuildDate>
`

    for (const item of feedData.items) {
        xml += `    <item>
      <g:id>${escapeXML(item.id)}</g:id>
      <g:title>${escapeXML(item.title)}</g:title>
      <g:description>${escapeXML(item.description)}</g:description>
      <g:link>${escapeXML(item.link)}</g:link>
      <g:image_link>${escapeXML(item.image_link)}</g:link>`

        if (item.additional_image_link && item.additional_image_link.length > 0) {
            item.additional_image_link.forEach(img => {
                xml += `
      <g:additional_image_link>${escapeXML(img)}</g:additional_image_link>`
            })
        }

        xml += `
      <g:price>${escapeXML(item.price)}</g:price>`

        if (item.sale_price) {
            xml += `
      <g:sale_price>${escapeXML(item.sale_price)}</g:sale_price>`
        }

        xml += `
      <g:availability>${escapeXML(item.availability)}</g:availability>
      <g:brand>${escapeXML(item.brand)}</g:brand>
      <g:condition>${escapeXML(item.condition)}</g:condition>
      <g:google_product_category>${escapeXML(item.google_product_category)}</g:google_product_category>
      <g:product_type>${escapeXML(item.product_type)}</g:product_type>`

        if (item.item_group_id) {
            xml += `
      <g:item_group_id>${escapeXML(item.item_group_id)}</g:item_group_id>`
        }

        xml += `
    </item>
`
    }

    xml += `  </channel>
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
