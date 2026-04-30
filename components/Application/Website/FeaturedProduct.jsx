'use client'
import axios from 'axios';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductBox from './ProductBox';
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute';

const FeaturedProduct = () => {
    const [productData, setProductData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = '/api/product/get-featured-product'
                console.log('Fetching featured products from:', url)
                const { data } = await axios.get(url)
                console.log('Featured products response:', data)
                setProductData(data)
            } catch (error) {
                console.error('Error fetching featured products:', error)
                setProductData({ success: false, error: true })
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) return null
    if (!productData) return null
    return (
        <section className='lg:px-32 px-4 sm:py-16 py-10'>
            <div className='text-center mb-8 sm:mb-12'>
                <h2 className='sm:text-4xl text-3xl font-bold text-slate-900 mb-3'>
                    Featured <span className='text-amber-600'>Products</span>
                </h2>
                <div className='h-1 w-20 bg-amber-600 mx-auto rounded-full mb-4'></div>
                <p className='text-slate-500 text-sm sm:text-base max-w-2xl mx-auto'>
                    আমাদের জনপ্রিয় এবং ট্রেন্ডি পাঞ্জাবি কালেকশন থেকে আপনার পছন্দের পণ্য বাছাই করুন
                </p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6'>
                {!productData.success && (
                    <div className='col-span-full text-center py-10'>
                        <p className='text-slate-500 text-lg'>No featured products available at the moment.</p>
                    </div>
                )}

                {productData.success && productData.data.map((product) => (
                    <ProductBox key={product._id} product={product} />
                ))}
            </div>

            {productData.success && productData.data.length > 0 && (
                <div className='text-center mt-8 sm:mt-12'>
                    <Link
                        href={WEBSITE_SHOP}
                        className='inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-amber-600 transition-colors duration-300 font-medium'
                    >
                        View All Products
                        <IoIosArrowRoundForward size={20} />
                    </Link>
                </div>
            )}
        </section>
    )
}

export default FeaturedProduct