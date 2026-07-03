/**
 * ProductServer - Server Component
 * Fetches product data server-side and passes to client component
 * Uses direct DB connection to avoid Vercel auth issues with internal API calls
 */

import React from 'react'
import ProductClient from './ProductClient'
import { connectDB } from '@/lib/databaseConnection'

export async function generateMetadata({ params }) {
  const { slug } = await params
  
  // Safe static metadata - no DB calls
  return {
    title: `Product | E-Online Fashion Panjabi`,
    description: 'Shop premium quality ethnic wear for men at E-Online Fashion Panjabi.',
  }
}

async function getProductData(slug, color, size) {
  try {
    console.log('[ProductServer] Direct DB fetch for slug:', slug)

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('[ProductServer] MONGODB_URI not set!')
      return { error: true, message: 'Server configuration error.' }
    }

    // Connect to database
    await connectDB()
    console.log('[ProductServer] Database connected')
    
    // Dynamic imports to prevent module initialization errors
    // Media model must be imported first to ensure it's registered for populate
    const { default: MediaModel } = await import('@/models/Media.model')
    const { default: ProductModel } = await import('@/models/Product.model')
    const { default: ProductVariantModel } = await import('@/models/ProductVariant.model')
    const { default: ReviewModel } = await import('@/models/Review.model')

    const filter = { deletedAt: null, slug }

    // get product 
    const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean()

    if (!getProduct) {
      console.log('[ProductServer] Product not found:', slug)
      return { error: true, status: 404, message: 'Product not found.' }
    }

    console.log('[ProductServer] Product found:', getProduct.name)

    // get product variant 
    const variantFilter = { product: getProduct._id }

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

    // Get all variants and extract unique color names
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

    // Extract unique sizes from all variants
    const allVariants = await ProductVariantModel.find({ product: getProduct._id }).select('size').lean()
    const uniqueSizes = new Set()
    const validSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']

    allVariants.forEach(variant => {
      if (Array.isArray(variant.size)) {
        variant.size.forEach(s => uniqueSizes.add(s))
      } else if (typeof variant.size === 'string') {
        let remaining = variant.size
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

    // get review count
    const review = await ReviewModel.countDocuments({ product: getProduct._id })

    const productData = {
      product: getProduct,
      variant: selectedVariant,
      colors: getColor,
      sizes: getSize.length ? getSize.map(item => item.size) : [],
      reviewCount: review
    }

    console.log('[ProductServer] Success:', getProduct.name)
    return { error: false, data: productData }
    
  } catch (error) {
    console.error('[ProductServer] Error:', error.message, error.stack)
    return { error: true, message: error.message || 'Failed to load product' }
  }
}

const ProductServer = async ({ params, searchParams }) => {
  const { slug } = await params
  const { color, size } = await searchParams

  // Fetch product data
  const productResult = await getProductData(slug, color, size)

  // If error, show error UI
  if (productResult.error) {
    return (
      <div className='flex flex-col justify-center items-center py-20 min-h-[400px]'>
        <h1 className='text-2xl font-semibold text-gray-700 mb-4'>
          {productResult.status === 404 ? 'Product Not Found' : 'Error Loading Product'}
        </h1>
        <p className='text-gray-500 mb-6'>{productResult.message}</p>
        <a 
          href='/shop' 
          className='px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors'
        >
          Browse Products
        </a>
      </div>
    )
  }

  const { product, variant, colors, sizes, reviewCount } = productResult.data

  // Validate required data
  if (!product || !variant) {
    return (
      <div className='flex flex-col justify-center items-center py-20 min-h-[400px]'>
        <h1 className='text-2xl font-semibold text-gray-700 mb-4'>Product Information Incomplete</h1>
        <p className='text-gray-500 mb-6'>This product is missing required information.</p>
        <a 
          href='/shop' 
          className='px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors'
        >
          Browse Products
        </a>
      </div>
    )
  }

  // Pass data to client component
  return (
    <ProductClient 
      product={product}
      variant={variant}
      colors={colors || []}
      sizes={sizes || []}
      reviewCount={reviewCount || 0}
    />
  )
}

export default ProductServer
