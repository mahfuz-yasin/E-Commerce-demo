'use client'
import nextDynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import banner1 from '@/public/assets/images/banner1.avif'
import banner2 from '@/public/assets/images/banner2.avif'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import advertisingBanner from '@/public/assets/images/advertising-banner.avif'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'


import { GiReturnArrow } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { TbRosetteDiscountFilled } from "react-icons/tb";

export const dynamic = 'force-dynamic'

const MainSlider = nextDynamic(() => import('@/components/Application/Website/MainSlider'), { ssr: false })
const Testimonial = nextDynamic(() => import('@/components/Application/Website/Testimonial'), { ssr: false })

const Home = () => {
    return (
        <>
            {/* Main Slider Section */}
            <section className='w-full'>
                <MainSlider />
            </section>

            {/* Promo Banners Section */}
            <section className='lg:px-32 px-4 sm:py-16 py-8'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-10'>
                    <div className='border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                        <Link href={WEBSITE_SHOP} className='block'>
                            <Image
                                src={banner1.src}
                                width={banner1.width}
                                height={banner1.height}
                                alt='Premium Panjabi Collection'
                                className='w-full h-auto object-cover transition-transform duration-500 hover:scale-105'
                                priority
                            />
                        </Link>
                    </div>
                    <div className='border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                        <Link href={WEBSITE_SHOP} className='block'>
                            <Image
                                src={banner2.src}
                                width={banner2.width}
                                height={banner2.height}
                                alt='New Arrivals Collection'
                                className='w-full h-auto object-cover transition-transform duration-500 hover:scale-105'
                                priority
                            />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <FeaturedProduct />

            {/* Advertising Banner Section */}
            <section className='lg:px-32 px-4 sm:py-16 py-8'>
                <div className='w-full overflow-hidden rounded-lg shadow-sm'>
                    <Image
                        src={advertisingBanner.src}
                        height={advertisingBanner.height}
                        width={advertisingBanner.width}
                        alt='Special Offers - Al Hilal Panjabi'
                        className='w-full h-auto object-cover'
                        priority
                    />
                </div>
            </section>

            {/* Testimonials Section */}
            <Testimonial />

            {/* Features/Trust Badges Section */}
            <section className='lg:px-32 px-4 border-t py-10 sm:py-16 bg-gray-50/50'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <GiReturnArrow size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>7-Days Returns</h3>
                        <p>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <FaShippingFast size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Free Shipping</h3>
                        <p>No extra costs, just the price you see.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <BiSupport size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>24/7 Support</h3>
                        <p>24/7 support, alway here just for you.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <TbRosetteDiscountFilled size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Member Discounts</h3>
                        <p>Special offers for our loyal customers.</p>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Home