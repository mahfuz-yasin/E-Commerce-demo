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
            
            // Fetch related category products if the page has related categories
            const relatedCategories = pageData.data.relatedCategory
            if (relatedCategories && relatedCategories.length > 0) {
                // Fetch category data to get slugs
                fetch('/api/category?start=0&size=100&deleteType=SD')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.data) {
                            // Find categories by IDs and get their slugs
                            const categories = data.data.filter(cat => relatedCategories.includes(cat._id))
                            const categorySlugs = categories.map(cat => cat.slug).join(',')
                            
                            if (categorySlugs) {
                                // Fetch products from all related categories using slugs
                                fetch(`/api/shop?category=${categorySlugs}&limit=100`)
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.success && data.data) {
                                            setRelatedCategoryProducts(data.data.products || [])
                                        }
                                    })
                                    .catch(err => console.error('Error fetching related category products:', err))
                            }
                        }
                    })
                    .catch(err => console.error('Error fetching categories:', err))
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
