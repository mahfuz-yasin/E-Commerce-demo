/**
 * ProductServer - Server Component
 * Fetches product data server-side and passes to client component
 * NOTE: No database imports at top level - safe for Server Components
 */

import React from 'react'
import { headers } from 'next/headers'
import ProductClient from './ProductClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  
  // Safe static metadata - no DB calls
  return {
    title: `Product | Al-Hilal Panjabi`,
    description: 'Shop premium quality ethnic wear for men at Al-Hilal Panjabi.',
  }
}

async function getProductData(slug, color, size) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'alhilalpanjabi.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    let url = `${baseUrl}/api/product/details/${slug}`
    if (color && size) {
      url += `?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      return { error: true, status: response.status, message: 'Product not found' }
    }

    const data = await response.json()
    
    if (!data.success || !data.data) {
      return { error: true, message: 'Invalid product data' }
    }

    return { error: false, data: data.data }
    
  } catch (error) {
    console.error('Error fetching product:', error)
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
