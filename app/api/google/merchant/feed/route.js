import { connectDB } from "@/lib/databaseConnection"
import ProductModel from "@/models/Product.model"
import MediaModel from "@/models/Media.model"
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const CACHE_DURATION = 3600 // 1 hour
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
const CLOUDINARY_FOLDER = 'google-catalog'

/**
 * Optimize image URL for Google Shopping
 * @param {string} imageUrl - Original image URL
 * @returns {string} Optimized Cloudinary URL
 */
function optimizeImageUrl(imageUrl) {
  if (!imageUrl) return `${BASE_URL}/logo.webp`
  
  if (imageUrl.includes('cloudinary.com')) {
    // Extract public ID and add transformations
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    if (uploadIndex !== -1) {
      const publicId = urlParts.slice(uploadIndex + 1).join('/').replace(/\.[^/.]+$/, '')
      const cloudName = urlParts[uploadIndex - 1].split('.')[0]
      return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_800,w_800,q_auto,f_auto/${publicId}.jpg`
    }
  }
  
  return imageUrl
}

/**
 * Clean description for Google Shopping
 * @param {string} description - Original description
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
  if (!description) return ''
  return description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, 5000) // Max 5000 characters
}

/**
 * Generate XML feed for Google Shopping
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch products with variants
    const products = await ProductModel.find({ status: 'active' })
      .populate('category')
      .populate('media')
      .populate('variants')
      .skip(offset)
      .limit(limit)
      .lean()

    const totalProducts = await ProductModel.countDocuments({ status: 'active' })

    // Generate XML feed
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    xml += '<channel>\n'
    xml += `<title>Al Hilal Panjabi Products</title>\n`
    xml += `<link>${BASE_URL}</link>\n`
    xml += `<description>Panjabi and traditional wear from Al Hilal Panjabi</description>\n`
    xml += `<atom:link href="${BASE_URL}/api/google/merchant/feed" rel="self" type="application/rss+xml" />\n`

    for (const product of products) {
      const productVariants = product.variants && product.variants.length > 0 ? product.variants : []
      
      // Main product item (if no variants or for the parent)
      if (productVariants.length === 0) {
        xml += generateProductItem(product, null, BASE_URL)
      } else {
        // Variant items
        for (const variant of productVariants) {
          xml += generateProductItem(product, variant, BASE_URL)
        }
      }
    }

    xml += '</channel>\n'
    xml += '</rss>'

    // Generate ETag
    const etag = crypto.createHash('md5').update(xml).digest('hex')

    // Check If-None-Match header
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    const headers = new Headers()
    headers.set('Content-Type', 'application/xml; charset=utf-8')
    headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`)
    headers.set('ETag', etag)
    headers.set('Last-Modified', new Date().toUTCString())

    return new NextResponse(xml, { headers })
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}

/**
 * Generate product item XML
 */
function generateProductItem(product, variant, baseUrl) {
  const displayProduct = variant || product
  const isVariant = !!variant
  
  let xml = '<item>\n'
  
  // Basic fields
  xml += `<g:id>${product._id.toString()}${isVariant ? '-' + variant._id.toString() : ''}</g:id>\n`
  xml += `<g:title>${isVariant ? `${product.name} - ${variant.name}` : product.name}</g:title>\n`
  xml += `<g:description>${cleanDescription(product.shortDescription || product.description || '')}</g:description>\n`
  xml += `<g:link>${baseUrl}/product/${product.slug}${isVariant ? '?variant=' + variant._id : ''}</g:link>\n`
  
  // Images
  const primaryImage = displayProduct.media && displayProduct.media.length > 0
    ? (typeof displayProduct.media[0] === 'object' ? displayProduct.media[0] : null)
    : null
  
  const primaryImageUrl = primaryImage?.secure_url || product.media?.[0]?.secure_url || `${baseUrl}/logo.webp`
  xml += `<g:image_link>${optimizeImageUrl(primaryImageUrl)}</g:image_link>\n`
  
  // Additional images
  const additionalImages = displayProduct.media && displayProduct.media.length > 1
    ? displayProduct.media.slice(1)
    : []
  
  if (additionalImages.length > 0) {
    additionalImages.forEach(img => {
      const imgObj = typeof img === 'object' ? img : null
      if (imgObj?.secure_url) {
        xml += `<g:additional_image_link>${optimizeImageUrl(imgObj.secure_url)}</g:additional_image_link>\n`
      }
    })
  }
  
  // Price
  xml += `<g:price>${displayProduct.sellingPrice.toFixed(2)} BDT</g:price>\n`
  if (displayProduct.discountPercentage > 0) {
    xml += `<g:sale_price>${displayProduct.sellingPrice.toFixed(2)} BDT</g:sale_price>\n`
  }
  
  // Availability
  xml += `<g:availability>${displayProduct.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>\n`
  
  // Brand
  xml += `<g:brand>Al Hilal Panjabi</g:brand>\n`
  
  // Condition
  xml += `<g:condition>new</g:condition>\n`
  
  // Category
  xml += `<g:google_product_category>Apparel & Accessories > Clothing</g:google_product_category>\n`
  xml += `<g:product_type>${product.category?.name || 'Panjabi'}</g:product_type>\n`
  
  // GTIN (if available)
  if (displayProduct.gtin) {
    xml += `<g:gtin>${displayProduct.gtin}</g:gtin>\n`
  }
  
  // MPN (if available)
  if (displayProduct.mpn || displayProduct.sku) {
    xml += `<g:mpn>${displayProduct.mpn || displayProduct.sku}</g:mpn>\n`
  }
  
  // Item group ID for variants
  if (isVariant) {
    xml += `<g:item_group_id>${product._id.toString()}</g:item_group_id>\n`
  }
  
  // Shipping weight
  if (displayProduct.weight) {
    xml += `<g:shipping_weight>${displayProduct.weight} kg</g:shipping_weight>\n`
  }
  
  // Shipping
  xml += '<g:shipping>\n'
  xml += '<g:country>BD</g:country>\n'
  xml += '<g:service>Standard</g:service>\n'
  xml += '<g:price>100 BDT</g:price>\n'
  xml += '</g:shipping>\n'
  
  // Tax
  xml += '<g:tax>\n'
  xml += '<g:country>BD</g:country>\n'
  xml += '<g:tax_rate>0</g:tax_rate>\n'
  xml += '<g:tax_ship>yes</g:tax_ship>\n'
  xml += '</g:tax>\n'
  
  // Custom labels (optional)
  if (displayProduct.color) {
    xml += `<g:custom_label_0>${displayProduct.color}</g:custom_label_0>\n`
  }
  if (displayProduct.size) {
    xml += `<g:custom_label_1>${displayProduct.size}</g:custom_label_1>\n`
  }
  
  xml += '</item>\n'
  
  return xml
}
