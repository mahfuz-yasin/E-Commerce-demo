import React from 'react'
import ProductDetails from './ProductDetails'
import { headers } from 'next/headers'
import { trackGA4ViewItem } from '@/lib/ga4-server'
import { cookies } from 'next/headers'

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
    const { slug } = await params
    const { color, size } = await searchParams

    // Get the base URL from headers for server component
    const headersList = await headers()
    const host = headersList.get('host') || 'alhilalpanjabi.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    let url = `${baseUrl}/api/product/details/${slug}`

    if (color && size) {
        url += `?color=${color}&size=${size}`
    }

    const response = await fetch(url, {
        cache: 'no-store'
    })

    if (!response.ok) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Data not found.</h1>
            </div>
        )
    }

    const getProduct = await response.json()

    if (!getProduct.success) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Data not found.</h1>
            </div>
        )
    }

    // Track GA4 view_item event (server-side)
    const displayProduct = getProduct?.data?.variant || getProduct?.data?.product
    if (displayProduct) {
        const cookieStore = await cookies()
        const clientId = cookieStore.get('ga4_client_id')?.value
        const userId = cookieStore.get('user_id')?.value

        try {
            await trackGA4ViewItem(displayProduct, clientId, userId)
        } catch (error) {
            console.error('GA4 view_item tracking failed:', error)
        }
    }

    return (
        <ProductDetails
            product={getProduct?.data?.product}
            variant={getProduct?.data?.variant}
            colors={getProduct?.data?.colors}
            sizes={getProduct?.data?.sizes}
            reviewCount={getProduct?.data?.reviewCount}
        />
    )
}

export default ProductPage