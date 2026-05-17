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
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
import ScrollReveal from '@/components/ui/ScrollReveal'

const breadcrumb = {
    title: 'Shop',
    links: [
        { label: 'Shop', href: WEBSITE_SHOP }
    ]
}

const ShopContent = () => {
    const searchParams = useSearchParams()
    const searchParamsString = searchParams.toString()
    const [limit, setLimit] = useState(9)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const windowSize = useWindowSize()

    const fetchProduct = async (pageParam) => {
        try {
            const url = `/api/shop?page=${pageParam}&limit=${limit}&sort=${sorting}&${searchParamsString}`
            const { data: getProduct } = await axios.get(url)

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
        queryKey: ['products', limit, sorting, searchParamsString],
        queryFn: async ({ pageParam }) => await fetchProduct(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage?.nextPage ?? undefined
        }
    })

    return (
        <div>
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
                                <SheetTitle>Filter</SheetTitle>
                                <SheetDescription></SheetDescription>
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
                        {data && data.pages?.filter(Boolean).map((page, pageIndex) => (
                            page?.products?.filter(Boolean).map((product, productIndex) => (
                                <ScrollReveal 
                                    key={`${product._id}-${pageIndex}`} 
                                    direction='up' 
                                    delay={(pageIndex * 9 + productIndex) * 0.03}
                                >
                                    <ProductBox product={product} />
                                </ScrollReveal>
                            ))
                        ))}
                    </div>

                    {data && data.pages?.filter(Boolean).every(page => !page?.products || page.products.length === 0) && !isFetching && (
                        <div className='text-center py-10'>
                            <p className='text-gray-500 text-lg'>No products found.</p>
                        </div>
                    )}

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

export default ShopContent
