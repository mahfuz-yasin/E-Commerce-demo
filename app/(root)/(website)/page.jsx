'use client'
import nextDynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import banner1 from '@/public/assets/images/banner1.avif'
import banner2 from '@/public/assets/images/banner2.avif'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import advertisingBanner from '@/public/assets/images/advertising-banner.avif'
import { WEBSITE_SHOP, WEBSITE_RETURN_POLICY, WEBSITE_SHIPPING_POLICY, WEBSITE_SUPPORT, WEBSITE_MEMBERSHIP } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import useFetch from '@/hooks/useFetch'


import { GiReturnArrow } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { TbRosetteDiscountFilled } from "react-icons/tb";

// Icon mapping
const iconMap = {
    GiReturnArrow: GiReturnArrow,
    FaShippingFast: FaShippingFast,
    BiSupport: BiSupport,
    TbRosetteDiscountFilled: TbRosetteDiscountFilled
};

export const dynamic = 'force-dynamic'

const HeroSlider = nextDynamic(() => import('@/components/Application/Website/HeroSlider'), { ssr: false })
const Testimonial = nextDynamic(() => import('@/components/Application/Website/Testimonial'), { ssr: false })

const Home = () => {
    const { data: featuresData } = useFetch('/api/features', 'GET')
    const [features, setFeatures] = useState([])

    useEffect(() => {
        if (featuresData && featuresData.success) {
            setFeatures(featuresData.data)
        }
    }, [featuresData])

    // Color mapping for gradients
    const colorMap = {
        blue: { from: 'blue-50', to: 'blue-600', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' },
        green: { from: 'green-50', to: 'green-600', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500' },
        purple: { from: 'purple-50', to: 'purple-600', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-500' },
        orange: { from: 'orange-50', to: 'orange-600', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500' },
        red: { from: 'red-50', to: 'red-600', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' },
        pink: { from: 'pink-50', to: 'pink-600', text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-500' },
        indigo: { from: 'indigo-50', to: 'indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-500' },
        teal: { from: 'teal-50', to: 'teal-600', text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-500' }
    }

    // If no features data, use default features
    const defaultFeatures = [
        {
            title: '৭ দিনের রিটার্ন পলিসি',
            description: 'ঝুঁকিহীন কেনাকাটা, সহজ রিটার্ন সুবিধাসহ',
            icon: 'GiReturnArrow',
            color: 'blue',
            link: WEBSITE_RETURN_POLICY,
            buttonText: 'বিস্তারিত দেখুন'
        },
        {
            title: 'ফ্রি শিপিং',
            description: 'কোনো অতিরিক্ত খরচ ছাড়াই, আপনি যা দেখেন তা-ই প্রদান',
            icon: 'FaShippingFast',
            color: 'green',
            link: WEBSITE_SHIPPING_POLICY,
            buttonText: 'বিস্তারিত দেখুন'
        },
        {
            title: '২৪/৭ সাপোর্ট',
            description: 'যেকোনো সময় আমরা আপনার পাশে আছি',
            icon: 'BiSupport',
            color: 'purple',
            link: WEBSITE_SUPPORT,
            buttonText: 'সাপোর্ট নিন'
        },
        {
            title: 'মেম্বার ডিসকাউন্ট',
            description: 'আমাদের বিশ্বস্ত গ্রাহকদের জন্য বিশেষ অফার',
            icon: 'TbRosetteDiscountFilled',
            color: 'orange',
            link: WEBSITE_MEMBERSHIP,
            buttonText: 'মেম্বারশিপ নিন'
        }
    ]

    const displayFeatures = features.length > 0 ? features : defaultFeatures

    return (
        <>
            {/* Hero Slider Section */}
            <section className='w-full'>
                <HeroSlider />
            </section>

            {/* Promo Banners Section */}
            <section className='lg:px-32 px-4 sm:py-16 py-8'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-10'>
                    <div className='border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                        <Link href={WEBSITE_SHOP} className='block'>
                            <Image
                                src={banner1}
                                alt='Premium Panjabi Collection'
                                className='w-full h-auto object-cover transition-transform duration-500 hover:scale-105'
                                priority
                                quality={100}
                                sizes='(max-width: 640px) 100vw, 50vw'
                            />
                        </Link>
                    </div>
                    <div className='border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                        <Link href={WEBSITE_SHOP} className='block'>
                            <Image
                                src={banner2}
                                alt='New Arrivals Collection'
                                className='w-full h-auto object-cover transition-transform duration-500 hover:scale-105'
                                priority
                                quality={100}
                                sizes='(max-width: 640px) 100vw, 50vw'
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
                        src={advertisingBanner}
                        alt='Special Offers - Al Hilal Panjabi'
                        className='w-full h-auto object-cover'
                        priority
                        quality={100}
                        sizes='100vw'
                    />
                </div>
            </section>

            {/* Testimonials Section */}
            <Testimonial />

            {/* Features/Trust Badges Section */}
            <section className='lg:px-32 px-4 py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-8'>
                    {displayFeatures.map((feature) => {
                        const IconComponent = iconMap[feature.icon]

                        // Get color classes based on feature.color
                        const getColorClasses = (color) => {
                            switch (color) {
                                case 'blue':
                                    return {
                                        from: 'from-blue-50',
                                        to: 'from-blue-500 to-blue-600',
                                        text: 'text-blue-600',
                                        bg: 'bg-blue-50',
                                        border: 'border-blue-500'
                                    }
                                case 'green':
                                    return {
                                        from: 'from-green-50',
                                        to: 'from-green-500 to-green-600',
                                        text: 'text-green-600',
                                        bg: 'bg-green-50',
                                        border: 'border-green-500'
                                    }
                                case 'purple':
                                    return {
                                        from: 'from-purple-50',
                                        to: 'from-purple-500 to-purple-600',
                                        text: 'text-purple-600',
                                        bg: 'bg-purple-50',
                                        border: 'border-purple-500'
                                    }
                                case 'orange':
                                    return {
                                        from: 'from-orange-50',
                                        to: 'from-orange-500 to-orange-600',
                                        text: 'text-orange-600',
                                        bg: 'bg-orange-50',
                                        border: 'border-orange-500'
                                    }
                                case 'red':
                                    return {
                                        from: 'from-red-50',
                                        to: 'from-red-500 to-red-600',
                                        text: 'text-red-600',
                                        bg: 'bg-red-50',
                                        border: 'border-red-500'
                                    }
                                case 'pink':
                                    return {
                                        from: 'from-pink-50',
                                        to: 'from-pink-500 to-pink-600',
                                        text: 'text-pink-600',
                                        bg: 'bg-pink-50',
                                        border: 'border-pink-500'
                                    }
                                case 'indigo':
                                    return {
                                        from: 'from-indigo-50',
                                        to: 'from-indigo-500 to-indigo-600',
                                        text: 'text-indigo-600',
                                        bg: 'bg-indigo-50',
                                        border: 'border-indigo-500'
                                    }
                                case 'teal':
                                    return {
                                        from: 'from-teal-50',
                                        to: 'from-teal-500 to-teal-600',
                                        text: 'text-teal-600',
                                        bg: 'bg-teal-50',
                                        border: 'border-teal-500'
                                    }
                                default:
                                    return {
                                        from: 'from-blue-50',
                                        to: 'from-blue-500 to-blue-600',
                                        text: 'text-blue-600',
                                        bg: 'bg-blue-50',
                                        border: 'border-blue-500'
                                    }
                            }
                        }

                        const colors = getColorClasses(feature.color)

                        return (
                            <div key={feature._id || feature.icon} className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden'>
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className='relative z-10'>
                                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${colors.to} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        {IconComponent && <IconComponent size={32} className='text-white' />}
                                    </div>
                                    <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:${colors.text} transition-colors`}>{feature.title}</h3>
                                    <p className='text-gray-600 mb-4'>{feature.description}</p>
                                    <Button asChild variant="outline" size="sm" className={`w-full hover:${colors.bg} hover:${colors.border} hover:${colors.text} transition-colors`}>
                                        <Link href={feature.link}>{feature.buttonText}</Link>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

        </>
    )
}

export default Home