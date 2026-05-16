import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import OrderModel from "@/models/Order.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"
import ProductModel from "@/models/Product.model"

/**
 * Sync TikTok Shop orders to local MongoDB
 * Prevents stock count conflicts between TikTok Shop and alhilalpanjabi.com
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { tiktokOrderId, products, customer, totalAmount, currency, tiktokLiveId } = body

    if (!tiktokOrderId || !products || !customer) {
      return response(false, 400, 'Missing required fields: tiktokOrderId, products, customer')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.syncTikTokShop) {
      return response(false, 400, 'TikTok Shop sync is disabled')
    }

    // Check if order already synced
    const existingOrder = await OrderModel.findOne({ tiktokOrderId })
    if (existingOrder) {
      return response(false, 409, 'Order already synced')
    }

    // Process products and update stock
    const processedProducts = []
    for (const product of products) {
      const dbProduct = await ProductModel.findById(product.productId)
      if (dbProduct) {
        // Update stock count
        if (dbProduct.stock !== undefined) {
          dbProduct.stock = Math.max(0, dbProduct.stock - product.quantity)
          await dbProduct.save()
        }
        processedProducts.push({
          productId: product.productId,
          variantId: product.variantId,
          name: product.name,
          qty: product.quantity,
          mrp: product.price,
          sellingPrice: product.price
        })
      }
    }

    // Create order in local MongoDB
    const newOrder = await OrderModel.create({
      user: null, // TikTok Shop orders are guest orders
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      ordernote: `TikTok Shop Order - ${tiktokOrderId}`,
      products: processedProducts,
      discount: 0,
      couponDiscountAmount: 0,
      totalAmount: totalAmount,
      subtotal: totalAmount,
      payment_id: `TIKTOK-${tiktokOrderId}`,
      order_id: tiktokOrderId,
      status: 'paid',
      paymentMethod: 'TIKTOK_SHOP',
      paymentDetails: null,
      tiktokOrderId: tiktokOrderId,
      tiktokLiveId: tiktokLiveId || null,
      source: 'TIKTOK_SHOP'
    })

    return response(true, 200, 'TikTok Shop order synced successfully', { orderId: newOrder._id })
  } catch (error) {
    console.error('Error syncing TikTok Shop order:', error)
    return response(false, 500, error.message || 'Failed to sync TikTok Shop order')
  }
}

/**
 * Fetch TikTok Shop orders from TikTok API
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.syncTikTokShop) {
      return response(false, 400, 'TikTok Shop sync is disabled')
    }

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const endpoint = `/shop/order/list/`
    const data = {
      advertiser_id: config.adAccountId,
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      page_size: Math.min(limit, 100),
      page: 1
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch TikTok Shop orders')
    }

    return response(true, 200, 'TikTok Shop orders fetched successfully', result.data)
  } catch (error) {
    console.error('Error fetching TikTok Shop orders:', error)
    return response(false, 500, error.message || 'Failed to fetch TikTok Shop orders')
  }
}
