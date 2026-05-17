'use client'
import axios from 'axios';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductBox from './ProductBox';
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Default products for instant loading with local images
const defaultProducts = [
    {
        _id: 'default-1',
        name: 'Premium Panjabi',
        slug: 'premium-panjabi',
        mrp: 1500,
        sellingPrice: 1200,
        media: [{ secure_url: '/assets/images/panjabi-1.webp', alt: 'Premium Panjabi' }]
    },
    {
        _id: 'default-2',
        name: 'Classic Panjabi',
        slug: 'classic-panjabi',
        mrp: 1800,
        sellingPrice: 1500,
        media: [{ secure_url: '/assets/images/panjabi-2.webp', alt: 'Classic Panjabi' }]
    },
    {
        _id: 'default-3',
        name: 'Designer Panjabi',
        slug: 'designer-panjabi',
        mrp: 2000,
        sellingPrice: 1700,
        media: [{ secure_url: '/assets/images/panjabi-3.webp', alt: 'Designer Panjabi' }]
    },
    {
        _id: 'default-4',
        name: 'Elegant Panjabi',
        slug: 'elegant-panjabi',
        mrp: 2200,
        sellingPrice: 1900,
        media: [{ secure_url: '/assets/images/panjabi-4.webp', alt: 'Elegant Panjabi' }]
    },
    {
        _id: 'default-5',
        name: 'Royal Panjabi',
        slug: 'royal-panjabi',
        mrp: 2500,
        sellingPrice: 2100,
        media: [{ secure_url: '/assets/images/panjabi-5.webp', alt: 'Royal Panjabi' }]
    },
    {
        _id: 'default-6',
        name: 'Traditional Panjabi',
        slug: 'traditional-panjabi',
        mrp: 1700,
        sellingPrice: 1400,
        media: [{ secure_url: '/assets/images/panjabi-6.webp', alt: 'Traditional Panjabi' }]
    },
    {
        _id: 'default-7',
        name: 'Modern Panjabi',
        slug: 'modern-panjabi',
        mrp: 1900,
        sellingPrice: 1600,
        media: [{ secure_url: '/assets/images/panjabi-7.webp', alt: 'Modern Panjabi' }]
    },
    {
        _id: 'default-8',
        name: 'Stylish Panjabi',
        slug: 'stylish-panjabi',
        mrp: 2100,
        sellingPrice: 1800,
        media: [{ secure_url: '/assets/images/panjabi-8.webp', alt: 'Stylish Panjabi' }]
    },
    {
        _id: 'default-9',
        name: 'Festive Panjabi',
        slug: 'festive-panjabi',
        mrp: 2800,
        sellingPrice: 2400,
        media: [{ secure_url: '/assets/images/panjabi-9.webp', alt: 'Festive Panjabi' }]
    },
    {
        _id: 'default-10',
        name: 'Wedding Panjabi',
        slug: 'wedding-panjabi',
        mrp: 3500,
        sellingPrice: 2900,
        media: [{ secure_url: '/assets/images/panjabi-10.webp', alt: 'Wedding Panjabi' }]
    }
]

const FeaturedProduct = () => {
    const [productData, setProductData] = useState({ success: true, data: defaultProducts })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = '/api/product/get-featured-product'
                console.log('Fetching featured products from:', url)
                const response = await axios.get(url)
                if (response.data.success && Array.isArray(response.data.data)) {
                    setProductData(response.data)
                }
            } catch (error) {
                console.error('Error fetching featured products:', error)
                // Keep default products on error
                setProductData({ success: true, data: defaultProducts })
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

                {productData.success && productData.data.map((product, index) => (
                    <ScrollReveal key={product._id} direction='up' delay={index * 0.05}>
                        <ProductBox product={product} />
                    </ScrollReveal>
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