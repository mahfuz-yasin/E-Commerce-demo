'use client'
import React, { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import PageRenderer from '@/components/PageRenderer/PageRenderer'
import ProductBox from '@/components/Application/Website/ProductBox'

const DynamicPage = ({ params }) => {
    const { data: pageData } = useFetch(`/api/pagebuilder/${params.slug}`, 'GET')
    const [page, setPage] = useState(null)
    const [relatedCategoryProducts, setRelatedCategoryProducts] = useState([])

    useEffect(() => {
        if (pageData && pageData.success) {
            setPage(pageData.data)
            
            // Fetch related category products if the page has a related category
            if (pageData.data.relatedCategory) {
                fetch(`/api/shop?category=${pageData.data.relatedCategory}&limit=100`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.data) {
                            setRelatedCategoryProducts(data.data)
                        }
                    })
                    .catch(err => console.error('Error fetching related category products:', err))
            }
        }
    }, [pageData])

    if (!page) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div>
            <PageRenderer page={page} />
            
            {/* Related Category Products Section */}
            {relatedCategoryProducts.length > 0 && (
                <div className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold text-center mb-8">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedCategoryProducts.map((product) => (
                            <ProductBox key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DynamicPage
