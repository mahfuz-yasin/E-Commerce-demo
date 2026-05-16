'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import DirectOrderModal from './DirectOrderModal'
import WhatsAppOrderModal from './WhatsAppOrderModal'
import { useDispatch } from 'react-redux'
import { addIntoCart } from '@/store/reducer/cartReducer'
import { trackGA4AddToCart } from "@/lib/ga4-server"
import { showToast } from '@/lib/showToast'
import OptimizedImage from '@/components/ui/OptimizedImage'

const ProductBox = ({ product }) => {
    const dispatch = useDispatch()
    const [showOverlay, setShowOverlay] = useState(false)
    const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)

    const handleAddToCart = () => {
        const cartProduct = {
            productId: product._id,
            variantId: product.variants && product.variants.length > 0 ? product.variants[0]._id : null,
            name: product.name,
            url: product.slug,
            size: product.variants && product.variants.length > 0 ? product.variants[0].size : null,
            colors: product.variants && product.variants.length > 0 ? product.variants[0].colors : null,
            mrp: product.sellingPrice,
            sellingPrice: product.sellingPrice,
            media: product.media && product.media.length > 0 ? product.media[0].secure_url : null,
            qty: 1
        }

        dispatch(addIntoCart(cartProduct))

        // Track GA4 add_to_cart event
        try {
            trackGA4AddToCart(cartProduct, 1)
        } catch (error) {
            console.error('GA4 add_to_cart tracking failed:', error)
        }

        showToast('success', 'Product added into cart.')
    }

    const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)

    return (
        <>
            <div className='group rounded-lg hover:shadow-xl border overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-white'>
                {/* Image Container with Smooth Hover Overlay */}
                <div
                    className='relative w-full aspect-[3/4] overflow-hidden'
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                    onTouchStart={() => setShowOverlay(true)}
                >
                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className='absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10'>
                            -{discount}%
                        </div>
                    )}
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className='block w-full h-full' aria-label={`View ${product?.name}`}>
                        <OptimizedImage
                            src={product?.media[0]?.secure_url}
                            alt={product?.media[0]?.alt || product?.name || 'Product image'}
                            title={product?.media[0]?.title || product?.name}
                            className={`object-cover object-top transition-transform duration-500 ${showOverlay ? 'scale-110' : 'scale-100'}`}
                            quality={80}
                            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                            fill
                            loading="lazy"
                        />
                    </Link>

                    {/* Smooth Hover Overlay */}
                    <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <h3 className='text-white text-center px-4 font-semibold text-sm md:text-base line-clamp-2'>{product?.name}</h3>
                        <div className='flex items-center gap-2'>
                            <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                <Button className='bg-white text-black hover:bg-gray-100 rounded-full px-3 py-2 text-xs md:text-sm transition-transform hover:scale-105'>Details</Button>
                            </Link>
                            <Button onClick={handleAddToCart} className='bg-white text-black hover:bg-gray-100 rounded-full px-3 py-2 text-xs md:text-sm transition-transform hover:scale-105'>Add to Cart</Button>
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-4 border-t">
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className='block'>
                        <h4 className='font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors duration-200 min-h-[2.5rem]'>{product?.name}</h4>
                    </Link>

                    <div className='flex items-center gap-2 mt-2'>
                        <span className='font-bold text-sm md:text-base text-gray-900'>{product?.sellingPrice?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                        {product?.mrp > product?.sellingPrice && (
                            <span className='line-through text-gray-400 text-xs md:text-sm'>{product?.mrp?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                        )}
                    </div>

                    {/* Order Now - Full Width */}
                    <Button
                        onClick={() => setIsDirectModalOpen(true)}
                        className='w-full mt-3 bg-black hover:bg-gray-800 rounded-full py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all duration-200 hover:shadow-md'
                    >
                        অর্ডার করুন
                    </Button>

                    {/* WhatsApp Order - Full Width */}
                    <Button
                        onClick={() => setIsWhatsAppModalOpen(true)}
                        className='w-full mt-2 bg-green-600 hover:bg-green-700 rounded-full py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all duration-200 hover:shadow-md'
                    >
                        ওয়াটসঅ্যাপে অর্ডার করুন
                    </Button>
                </div>
            </div>

            {/* Direct Order Modal - rendered outside card via portal */}
            {typeof window !== 'undefined' && createPortal(
                <DirectOrderModal
                    isOpen={isDirectModalOpen}
                    onClose={() => setIsDirectModalOpen(false)}
                    product={product}
                    variant={product.variantId || product}
                    selectedSize={product.size}
                />,
                document.body
            )}

            {/* WhatsApp Order Modal - rendered outside card via portal */}
            {typeof window !== 'undefined' && createPortal(
                <WhatsAppOrderModal
                    isOpen={isWhatsAppModalOpen}
                    onClose={() => setIsWhatsAppModalOpen(false)}
                    product={product}
                    variant={product.variantId || product}
                    selectedSize={product.size}
                />,
                document.body
            )}
        </>
    )
}

export default ProductBox