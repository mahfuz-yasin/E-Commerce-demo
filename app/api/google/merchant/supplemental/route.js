import { connectDB } from "@/lib/databaseConnection"
import ProductModel from "@/models/Product.model"
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const CACHE_DURATION = 3600 // 1 hour
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'

/**
 * Generate Supplemental Feed for Google Shopping
 * Used for custom labels (inventory, promotion)
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const feedType = searchParams.get('type') || 'inventory' // inventory, promotion

    const products = await ProductModel.find({ status: 'active' })
      .populate('category')
      .lean()

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
    xml += '<channel>\n'
    xml += `<title>Al Hilal Panjabi ${feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed</title>\n`
    xml += `<link>${BASE_URL}</link>\n`

    for (const product of products) {
      xml += '<item>\n'
      xml += `<g:id>${product._id.toString()}</g:id>\n`
      
      if (feedType === 'inventory') {
        xml += `<g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>\n`
        xml += `<g:custom_label_0>inventory_${product.stock > 0 ? 'available' : 'unavailable'}</g:custom_label_0>\n`
      } else if (feedType === 'promotion') {
        if (product.discountPercentage > 0) {
          xml += `<g:sale_price>${product.sellingPrice.toFixed(2)} BDT</g:sale_price>\n`
          xml += `<g:custom_label_0>promotion_active</g:custom_label_0>\n`
          xml += `<g:custom_label_1>discount_${product.discountPercentage}%</g:custom_label_1>\n`
        }
      }
      
      xml += '</item>\n'
    }

    xml += '</channel>\n'
    xml += '</rss>'

    const etag = crypto.createHash('md5').update(xml).digest('hex')

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
    console.error('Error generating supplemental feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
