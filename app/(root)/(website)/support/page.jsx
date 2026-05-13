'use client'
import React, { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'

const Support = () => {
  const { data: contentData } = useFetch('/api/content/support', 'GET')
  const [content, setContent] = useState(null)

  useEffect(() => {
    if (contentData && contentData.success) {
      setContent(contentData.data)
    }
  }, [contentData])

  if (!content) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
    </div>
  )
}

export default Support
