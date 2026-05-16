'use client'
import { useEffect } from 'react'
import Script from 'next/script'

const GoogleDynamicRemarketing = ({ productId, productName, productPrice, productCategory, pageType = 'home' }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const remarketingData = {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
        dynx_itemid: productId,
        dynx_itemname: productName,
        dynx_totalvalue: productPrice,
        dynx_itemcategory: productCategory
      }

      switch (pageType) {
        case 'home':
          window.gtag('event', 'page_view', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'home'
          })
          break
        case 'search':
          window.gtag('event', 'page_view', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'searchresults'
          })
          break
        case 'product':
          window.gtag('event', 'view_item', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'product',
            ...remarketingData
          })
          break
        case 'cart':
          window.gtag('event', 'add_to_cart', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'cart',
            ...remarketingData
          })
          break
        case 'purchase':
          window.gtag('event', 'purchase', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'purchase',
            ...remarketingData
          })
          break
        default:
          window.gtag('event', 'page_view', {
            send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '',
            ecomm_pagetype: 'other'
          })
      }
    }
  }, [productId, productName, productPrice, productCategory, pageType])

  return null
}

export default GoogleDynamicRemarketing
