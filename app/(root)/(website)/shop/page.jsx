'use client'
import Filter from '@/components/Application/Website/Filter'
import Sorting from '@/components/Application/Website/Sorting'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
const breadcrumb = {
    title: 'Shop',
    links: [
        { label: 'Shop', href: WEBSITE_SHOP }
    ]
}
const Shop = () => {
    const searchParams = useSearchParams().toString()
    const [limit, setLimit] = useState(9)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const windowSize = useWindowSize()


    const fetchProduct = async (pageParam) => {
        try {
            const url = `/api/shop?page=${pageParam}&limit=${limit}&sort=${sorting}&${searchParams}`
            console.log('Fetching products from:', url)
            const { data: getProduct } = await axios.get(url)
            console.log('Shop API response:', getProduct)

            if (!getProduct.success) {
                return { products: [], nextPage: undefined }
            }

            return getProduct.data || { products: [], nextPage: undefined }
        } catch (err) {
            console.error('Error fetching products:', err)
            return { products: [], nextPage: undefined }
        }
    }

    const { error, data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['products', limit, sorting, searchParams],
        queryFn: async ({ pageParam }) => await fetchProduct(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage?.nextPage ?? undefined
        }
    })


    return (
        <div >
            <WebsiteBreadcrumb props={breadcrumb} />
            <section className='lg:flex lg:px-32 px-4 my-20'>
                {windowSize.width > 1024 ?

                    <div className='w-72 me-4'>
                        <div className='sticky top-0 bg-gray-50 p-4 rounded'>
                            <Filter />
                        </div>
                    </div>
                    :

                    <Sheet open={isMobileFilter} onOpenChange={() => setIsMobileFilter(false)}>
                        <SheetContent side='left' className="block">
                            <SheetHeader className="border-b">
                                <SheetTitle>Filter </SheetTitle>
                            </SheetHeader>
                            <div className='p-4 overflow-auto h-[calc(100vh-80px)]'>
                                <Filter />
                            </div>
                        </SheetContent>
                    </Sheet>

                }


                <div className='lg:w-[calc(100%-18rem)]'>
                    <Sorting
                        limit={limit}
                        setLimit={setLimit}
                        sorting={sorting}
                        setSorting={setSorting}
                        mobileFilterOpen={isMobileFilter}
                        setMobileFilterOpen={setIsMobileFilter}
                    />

                    {isFetching && <div className='p-3 font-semibold text-center'>Loading...</div>}
                    {error && <div className='p-3 font-semibold text-center text-red-500'>
                        Error: {error.message || 'Failed to load products'}
                    </div>}

                    <div className='grid lg:grid-cols-3 grid-cols-2 lg:gap-10 gap-5 mt-10'>
                        {data && data.pages?.filter(Boolean).map((page, i) => (
                            page?.products?.filter(Boolean).map(product => (
                                <ProductBox key={`${product._id}-${i}`} product={product} />
                            ))
                        ))}
                    </div>

                    {/* No products found message */}
                    {data && data.pages?.filter(Boolean).every(page => !page?.products || page.products.length === 0) && !isFetching && (
                        <div className='text-center py-10'>
                            <p className='text-gray-500 text-lg'>No products found.</p>
                        </div>
                    )}

                    {/* load more button  */}

                    <div className='flex justify-center mt-10'>
                        {hasNextPage ?
                            <ButtonLoading type="button" loading={isFetching} text="Load More" onClick={fetchNextPage} />
                            :
                            <>
                                {!isFetching && <span>No more data to load.</span>}
                            </>
                        }
                    </div>

                </div>


            </section>
        </div>
    )
}

export default Shop