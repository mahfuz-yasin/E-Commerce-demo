'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useFetch from '@/hooks/useFetch'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const CategoriesSection = () => {
    const { data: categoriesData } = useFetch('/api/category/get-category', 'GET')
    const [categories, setCategories] = useState([])

    useEffect(() => {
        if (categoriesData && categoriesData.success) {
            setCategories(categoriesData.data)
        }
    }, [categoriesData])

    return (
        <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
                640: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                },
                1024: {
                    slidesPerView: 5,
                    spaceBetween: 24,
                },
                1280: {
                    slidesPerView: 6,
                    spaceBetween: 24,
                },
            }}
            pagination={{
                clickable: true,
            }}
            navigation={true}
            className="categories-swiper"
        >
            {categories.map((category) => (
                <SwiperSlide key={category._id}>
                    <Link
                        href={`/category/${category.slug}`}
                        className='group block h-full'
                    >
                        <div className='bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full'>
                            <h3 className='text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm mb-3'>
                                {category.name}
                            </h3>
                            <div className='aspect-square rounded-lg bg-gray-50 overflow-hidden'>
                                {category.image ? (
                                    <Image
                                        src={category.image.secure_url || category.image}
                                        alt={category.name}
                                        width={200}
                                        height={200}
                                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                        <span className='text-4xl'>📦</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}

export default CategoriesSection
