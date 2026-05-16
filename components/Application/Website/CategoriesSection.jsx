'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useFetch from '@/hooks/useFetch'

const CategoriesSection = () => {
    const { data: categoriesData } = useFetch('/api/category', 'GET')
    const [categories, setCategories] = useState([])

    useEffect(() => {
        if (categoriesData && categoriesData.success) {
            setCategories(categoriesData.data)
        }
    }, [categoriesData])

    return (
        <>
            {categories.map((category) => (
                <Link 
                    key={category._id} 
                    href={`/category/${category.slug}`}
                    className='group'
                >
                    <div className='bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full'>
                        <div className='aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden'>
                            {category.image ? (
                                <Image
                                    src={category.image}
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
                        <h3 className='text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm'>
                            {category.name}
                        </h3>
                    </div>
                </Link>
            ))}
        </>
    )
}

export default CategoriesSection
