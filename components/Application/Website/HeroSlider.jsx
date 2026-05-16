'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

// Import existing static images (Zero Loading UI strategy)
import slider1 from '@/public/assets/images/slider-1.avif'
import slider2 from '@/public/assets/images/slider-2.avif'
import slider3 from '@/public/assets/images/slider-3.avif'
import slider4 from '@/public/assets/images/slider-4.avif'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

// Static slides as initial fallback (Zero Loading UI)
const staticSlides = [
    {
        _id: 'static-1',
        heading: 'Premium Panjabi Collection',
        description: 'Discover our exclusive range of traditional and modern panjabis crafted with premium fabrics for every occasion.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        imageSrc: slider1,
        alt: 'Premium Panjabi Collection - Al Hilal'
    },
    {
        _id: 'static-2',
        heading: 'Eid Special Collection',
        description: 'Celebrate in style with our curated Eid collection featuring elegant designs and comfortable fits.',
        buttonText: 'Explore Eid Collection',
        buttonLink: '/shop?category=eid-special',
        imageSrc: slider2,
        alt: 'Eid Special Collection - Al Hilal'
    },
    {
        _id: 'static-3',
        heading: 'Wedding Collection',
        description: 'Make your special day memorable with our premium wedding panjabis. Traditional elegance meets modern comfort.',
        buttonText: 'View Wedding Collection',
        buttonLink: '/shop?category=wedding',
        imageSrc: slider3,
        alt: 'Wedding Collection Panjabi'
    },
    {
        _id: 'static-4',
        heading: 'Festive Wear Collection',
        description: 'Embrace the festive spirit with our vibrant collection. Perfect for celebrations and special gatherings.',
        buttonText: 'Shop Festive Wear',
        buttonLink: '/shop?category=festive',
        imageSrc: slider4,
        alt: 'Festive Wear Collection'
    }
]

// Convert dynamic slide to format compatible with static slides
const formatDynamicSlide = (slide) => ({
    _id: slide._id,
    heading: slide.heading,
    description: slide.description,
    buttonText: slide.buttonText || 'Shop Now',
    buttonLink: slide.buttonLink || '/shop',
    imageUrl: slide.imageUrl, // URL for dynamic images
    alt: slide.heading,
    isDynamic: true
})

const HeroSlider = () => {
    // Start with static slides (Zero Loading UI)
    const [slides, setSlides] = useState(staticSlides)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isHydrated, setIsHydrated] = useState(false)

    // Dynamic hydration effect
    useEffect(() => {
        const fetchDynamicSlides = async () => {
            try {
                const response = await axios.get('/api/slider/active-slides', {
                    headers: { 'Cache-Control': 'no-cache' }
                })
                if (response.data.success && response.data.data && response.data.data.length > 0) {
                    // Replace with dynamic slides
                    const dynamicSlides = response.data.data.map(formatDynamicSlide)
                    setSlides(dynamicSlides)
                    setIsHydrated(true)
                }
                // If no dynamic slides, keep using static slides
            } catch (error) {
                console.log('Using static slides - API error or no dynamic slides:', error.message)
                // Keep using static slides on error
            }
        }

        // Fetch dynamic data after initial render
        fetchDynamicSlides()
    }, [])

    const handleSlideChange = (swiper) => {
        setCurrentSlide(swiper.realIndex)
    }

    // Check if slide uses static image import or dynamic URL
    const getSlideImage = (slide) => {
        if (slide.imageSrc) {
            // Static imported image
            return { src: slide.imageSrc, isStatic: true }
        }
        // Dynamic image URL
        return { src: slide.imageUrl, isStatic: false }
    }

    return (
        <div className='relative w-full'>
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet custom-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
                }}
                loop={slides.length > 1}
                onSlideChange={handleSlideChange}
                className='hero-slider w-full'
            >
                {slides.map((slide, index) => {
                    const imageData = getSlideImage(slide)
                    
                    return (
                        <SwiperSlide key={slide._id} className='relative w-full'>
                            <div className='relative aspect-[16/7] sm:aspect-[16/6] lg:aspect-[16/5] w-full overflow-hidden'>
                                {/* Background Image with next/image optimization */}
                                <Image
                                    src={imageData.src}
                                    alt={slide.alt || slide.heading}
                                    className='w-full h-full object-cover object-center'
                                    priority={index === 0}
                                    quality={90}
                                    sizes='100vw'
                                    fill
                                    placeholder="blur"
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzAvL0A9Ljo7Ujo4P0ZDS0dMTU5PUVVDWkRHQ11VT0tUVVZfW//2wBDAR..."
                                />
                                
                                {/* Dark Gradient Overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                                
                                {/* Content Overlay with Framer Motion Animations */}
                                <div className="absolute inset-0 flex items-center">
                                    <div className="container mx-auto px-4 sm:px-8 lg:px-16">
                                        <div className="max-w-2xl">
                                            <AnimatePresence mode="wait">
                                                {currentSlide === index && (
                                                    <>
                                                        {/* Heading with slide-up animation */}
                                                        <motion.h2
                                                            initial={{ opacity: 0, y: 40 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg"
                                                        >
                                                            {slide.heading}
                                                        </motion.h2>

                                                        {/* Description with slide-up animation */}
                                                        <motion.p
                                                            initial={{ opacity: 0, y: 40 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                            className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 leading-relaxed max-w-lg drop-shadow-md"
                                                        >
                                                            {slide.description}
                                                        </motion.p>

                                                        {/* CTA Button with slide-up animation */}
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 40 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                        >
                                                            <Link
                                                                href={slide.buttonLink}
                                                                className="inline-flex items-center px-5 sm:px-8 py-2.5 sm:py-3 bg-primary text-white text-sm sm:text-base font-semibold rounded-lg 
                                                                         hover:bg-primary/90 transition-all duration-300 
                                                                         hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                                            >
                                                                {slide.buttonText}
                                                            </Link>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    )
                })}
            </Swiper>

            {/* Hydration indicator (optional, for debugging) */}
            {isHydrated && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="sr-only">Dynamic content loaded</span>
                </div>
            )}
            
            {/* Custom Styles for Swiper Pagination */}
            <style jsx global>{`
                .hero-slider .swiper-pagination {
                    bottom: 16px !important;
                }
                .custom-bullet {
                    width: 10px;
                    height: 10px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    margin: 0 4px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .custom-bullet-active {
                    background: #f59e0b !important;
                    width: 24px;
                    border-radius: 12px;
                }
                @media (min-width: 640px) {
                    .custom-bullet {
                        width: 12px;
                        height: 12px;
                        margin: 0 6px;
                    }
                    .custom-bullet-active {
                        width: 30px;
                    }
                }
            `}</style>
        </div>
    )
}

export default HeroSlider
