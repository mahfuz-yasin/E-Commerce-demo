'use client'
import React, { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import PageRenderer from '@/components/PageRenderer/PageRenderer'

const DynamicPage = ({ params }) => {
    const { data: pageData } = useFetch(`/api/pagebuilder/${params.slug}`, 'GET')
    const [page, setPage] = useState(null)

    useEffect(() => {
        if (pageData && pageData.success) {
            setPage(pageData.data)
        }
    }, [pageData])

    if (!page) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div>
            <PageRenderer page={page} />
        </div>
    )
}

export default DynamicPage
