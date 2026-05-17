'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useFetch from '@/hooks/useFetch'

const CategoriesSection = () => {
    const { data: categoriesData } = useFetch('/api/category/get-category', 'GET')
    const [categories, setCategories] = useState([])
    const scrollContainerRef = useRef(null)

    useEffect(() => {
        if (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) {
            setCategories(categoriesData.data)
        }
    }, [categoriesData])

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.5
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (!categories || categories.length === 0) {
        return (
            <div className='relative group'>
                <div className='flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory'
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                    ref={scrollContainerRef}
                >
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {/* Default categories */}
                    {['Panjabi', 'Kurta', 'Waistcoat', 'Sherwani'].map((name, index) => (
                        <Link
                            key={index}
                            href='/shop'
                            className='flex-shrink-0 w-[calc(25%-12px)] min-w-[80px] max-w-[120px] snap-start group/card'
                        >
                            <div className='bg-white rounded-xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-amber-300 h-full'>
                                <div className='aspect-square rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden mb-2 flex items-center justify-center'>
                                    <span className='text-2xl'>📦</span>
                                </div>
                                <h3 className='text-center font-semibold text-gray-800 group-hover/card:text-amber-600 transition-colors text-xs line-clamp-2'>
                                    {name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={() => scroll('left')}
                    className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-amber-50'
                    aria-label='Scroll left'
                >
                    <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                    </svg>
                </button>
                <button
                    onClick={() => scroll('right')}
                    className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-amber-50'
                    aria-label='Scroll right'
                >
                    <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                </button>

                {/* Scroll indicators */}
                <div className='flex justify-center gap-1 mt-2'>
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className='w-1.5 h-1.5 rounded-full bg-gray-300'
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='relative group'>
            <div className='flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory'
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                ref={scrollContainerRef}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {categories.map((category) => (
                    <Link
                        key={category._id}
                        href={`/category/${category.slug}`}
                        className='flex-shrink-0 w-[calc(25%-12px)] min-w-[80px] max-w-[120px] snap-start group/card'
                    >
                        <div className='bg-white rounded-xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-amber-300 h-full'>
                            <div className='aspect-square rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden mb-2'>
                                {category.image ? (
                                    <Image
                                        src={category.image.secure_url || category.image}
                                        alt={category.name}
                                        width={100}
                                        height={100}
                                        className='w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                        <span className='text-2xl'>📦</span>
                                    </div>
                                )}
                            </div>
                            <h3 className='text-center font-semibold text-gray-800 group-hover/card:text-amber-600 transition-colors text-xs line-clamp-2'>
                                {category.name}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Navigation buttons */}
            <button
                onClick={() => scroll('left')}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-amber-50'
                aria-label='Scroll left'
            >
                <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
            </button>
            <button
                onClick={() => scroll('right')}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-amber-50'
                aria-label='Scroll right'
            >
                <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
            </button>

            {/* Scroll indicators */}
            <div className='flex justify-center gap-1 mt-2'>
                {categories.map((_, index) => (
                    <div
                        key={index}
                        className='w-1.5 h-1.5 rounded-full bg-gray-300'
                    />
                ))}
            </div>
        </div>
    )
}

export default CategoriesSection
