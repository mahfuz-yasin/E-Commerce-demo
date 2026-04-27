'use client'
import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import slider1 from '@/public/assets/images/slider-1.avif'
import slider2 from '@/public/assets/images/slider-2.avif'
import slider3 from '@/public/assets/images/slider-3.avif'
import slider4 from '@/public/assets/images/slider-4.avif'
import Image from 'next/image';
import { LuChevronRight } from "react-icons/lu";
import { LuChevronLeft } from "react-icons/lu";


const ArrowNext = (props) => {
    const { onClick } = props
    return (
        <button 
            onClick={onClick} 
            type='button' 
            className='hidden sm:flex w-10 h-10 sm:w-14 sm:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg right-4 sm:right-8 lg:right-10 transition-all duration-300 hover:scale-110'
            aria-label='Next slide'
        >
            <LuChevronRight size={22} className='text-gray-700' />
        </button>
    )
}
const ArrowPrev = (props) => {
    const { onClick } = props
    return (
        <button 
            onClick={onClick} 
            type='button' 
            className='hidden sm:flex w-10 h-10 sm:w-14 sm:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg left-4 sm:left-8 lg:left-10 transition-all duration-300 hover:scale-110'
            aria-label='Previous slide'
        >
            <LuChevronLeft size={22} className='text-gray-700' />
        </button>
    )
}

const MainSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        nextArrow: <ArrowNext />,
        prevArrow: <ArrowPrev />,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        cssEase: 'ease-in-out',
        responsive: [
            {
                breakpoint: 640,
                settings: {
                    dots: true,
                    arrows: false,
                    fade: false
                }
            }
        ]
    }
    const slides = [
        { src: slider1, alt: 'Premium Panjabi Collection - Al Hilal' },
        { src: slider2, alt: 'Eid Special Collection - Al Hilal' },
        { src: slider3, alt: 'Wedding Collection Panjabi' },
        { src: slider4, alt: 'Festive Wear Collection' }
    ]

    return (
        <div className='relative w-full'>
            <Slider {...settings} className='main-slider'>
                {slides.map((slide, index) => (
                    <div key={index} className='relative w-full'>
                        <div className='relative aspect-[16/7] sm:aspect-[16/6] lg:aspect-[16/5] w-full overflow-hidden'>
                            <Image 
                                src={slide.src}
                                alt={slide.alt}
                                className='w-full h-full object-cover object-center'
                                priority={index === 0}
                                quality={100}
                                sizes='100vw'
                                fill
                                unoptimized={false}
                            />
                        </div>
                    </div>
                ))}
            </Slider>
            
            <style jsx global>{`
                .main-slider .slick-dots {
                    bottom: 16px;
                }
                .main-slider .slick-dots li button:before {
                    color: white;
                    font-size: 10px;
                    opacity: 0.6;
                }
                .main-slider .slick-dots li.slick-active button:before {
                    color: #f59e0b;
                    opacity: 1;
                }
            `}</style>
        </div>
    )
}

export default MainSlider