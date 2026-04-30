import React from 'react'
import ProductDetails from './ProductDetails'
import { headers } from 'next/headers'

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
    } else {

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

}

export default ProductPage