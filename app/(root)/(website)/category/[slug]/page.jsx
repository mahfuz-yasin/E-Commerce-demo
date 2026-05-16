'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductBox from '@/components/Application/Website/ProductBox'
import useFetch from '@/hooks/useFetch'
import { Loader2 } from 'lucide-react'

const CategoryProducts = () => {
    const params = useParams()
    const { data: productsData, isLoading } = useFetch(`/api/shop?category=${params.slug}&limit=100`, 'GET')
    const [products, setProducts] = useState([])
    const [categoryName, setCategoryName] = useState('')

    useEffect(() => {
        if (productsData && productsData.success) {
            setProducts(productsData.data.products || [])
            setCategoryName(params.slug || 'Category')
        }
    }, [productsData, params.slug])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loader2 className='animate-spin text-4xl text-blue-600' />
            </div>
        )
    }

    return (
        <div className='lg:px-32 px-4 py-12'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>{categoryName || 'Category'}</h1>
                <p className='text-gray-600'>আমাদের {categoryName || 'Category'} এর সকল প্রোডাক্ট</p>
            </div>
            
            {products.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                    {products.map((product) => (
                        <ProductBox key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className='text-center py-16'>
                    <p className='text-gray-600'>এই ক্যাটাগরিতে কোনো প্রোডাক্ট নেই</p>
                </div>
            )}
        </div>
    )
}

export default CategoryProducts
