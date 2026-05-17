import React from 'react'
import { headers } from 'next/headers'
// import { trackGA4ViewItem } from '@/lib/ga4-server'
// import { cookies } from 'next/headers'

// Import ProductDetails normally - it's a client component
import ProductDetails from './ProductDetails'

export async function generateMetadata({ params }) {
  const { slug } = await params
  
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'alhilalpanjabi.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(`${baseUrl}/api/product/details/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found | Al-Hilal Panjabi',
      }
    }
    
    const getProduct = await response.json()
    
    if (!getProduct.success || !getProduct.data?.product) {
      return {
        title: 'Product Not Found | Al-Hilal Panjabi',
      }
    }
    
    const product = getProduct.data.product
    const variant = getProduct.data.variant
    const displayProduct = variant || product
    
    // Get primary image from API response (no DB call)
    let imageUrl = `${baseUrl}/logo.webp`
    if (displayProduct.media && displayProduct.media.length > 0) {
      // Use media directly from API response
      const media = displayProduct.media[0]
      if (typeof media === 'object' && media.secure_url) {
        imageUrl = media.secure_url
      } else if (typeof media === 'string') {
        // If media is just an ID, use placeholder
        imageUrl = `${baseUrl}/assets/images/panjabi-1.webp`
      }
    }
    
    const price = displayProduct.sellingPrice || product.sellingPrice
    const currency = 'BDT'
    
    return {
      title: `${product.name} | Al-Hilal Panjabi`,
      description: product.shortDescription || `Shop ${product.name} at Al-Hilal Panjabi. Premium quality ethnic wear for men.`,
      openGraph: {
        type: 'product',
        url: `${baseUrl}/product-details/${slug}`,
        title: product.name,
        description: product.shortDescription || `Shop ${product.name} at Al-Hilal Panjabi.`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        product: {
          price_amount: price,
          price_currency: currency,
          availability: displayProduct.stock > 0 ? 'in stock' : 'out of stock',
          brand: 'Al-Hilal Panjabi',
        },
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.shortDescription || `Shop ${product.name} at Al-Hilal Panjabi.`,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating product metadata:', error)
    return {
      title: 'Al-Hilal Panjabi',
    }
  }
}

const ProductPage = async ({ params, searchParams }) => {
    try {
        const { slug } = await params
        const { color, size } = await searchParams

        if (!slug) {
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Invalid product URL.</h1>
                </div>
            )
        }

        // Get the base URL from headers for server component
        const headersList = await headers()
        const host = headersList.get('host') || 'alhilalpanjabi.com'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const baseUrl = `${protocol}://${host}`

        let url = `${baseUrl}/api/product/details/${slug}`

        if (color && size) {
            url += `?color=${color}&size=${size}`
        }

        let response
        try {
            response = await fetch(url, {
                cache: 'no-store'
            })
        } catch (fetchError) {
            console.error('Error fetching product:', fetchError)
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Unable to load product.</h1>
                </div>
            )
        }

        if (!response.ok) {
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            )
        }

        let getProduct
        try {
            getProduct = await response.json()
        } catch (parseError) {
            console.error('Error parsing product data:', parseError)
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Error loading product data.</h1>
                </div>
            )
        }

        if (!getProduct || !getProduct.success || !getProduct.data) {
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            )
        }

        // Ensure we have valid data before rendering
        const productData = getProduct.data.product
        const variantData = getProduct.data.variant
        const colorsData = getProduct.data.colors || []
        const sizesData = getProduct.data.sizes || []
        const reviewCountData = getProduct.data.reviewCount || 0

        if (!productData || !variantData) {
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product information is incomplete.</h1>
                </div>
            )
        }

        return (
            <ProductDetails
                product={productData}
                variant={variantData}
                colors={colorsData}
                sizes={sizesData}
                reviewCount={reviewCountData}
            />
        )
    } catch (error) {
        console.error('=== CRITICAL ERROR IN PRODUCT PAGE ===', error)
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>An error occurred loading this product.</h1>
                <p className='text-gray-500 mt-4'>{error?.message || 'Unknown error'}</p>
            </div>
        )
    }
}

export default ProductPage