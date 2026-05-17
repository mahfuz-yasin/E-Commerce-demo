/**
 * ProductClient - Client Component
 * Handles all client-side interactivity: state, effects, event handlers
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { addIntoCart } from '@/store/reducer/cartReducer'
import { showToast } from '@/lib/showToast'
import { sanitizeHTML } from '@/lib/xssSanitizer'
import { encode } from 'entities'

// Icons
import { IoStar } from "react-icons/io5"
import { HiMinus, HiPlus } from "react-icons/hi2"

// Components
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import OptimizedImage from '@/components/ui/OptimizedImage'
import ProductReview from '@/components/Application/Website/ProductReveiw'
import DirectOrderModal from '@/components/Application/Website/DirectOrderModal'
import WhatsAppOrderModal from '@/components/Application/Website/WhatsAppOrderModal'

// Routes
import { WEBSITE_CART, WEBSITE_SHOP } from '@/routes/WebsiteRoute'

// Tracking (browser-only)
const trackViewContent = async (...args) => {
  if (typeof window === 'undefined') return
  try {
    const { viewContent } = await import('@/lib/facebookPixel')
    viewContent(...args)
  } catch (e) { /* silent fail */ }
}

const ProductClient = ({ product, variant, colors, sizes, reviewCount }) => {
  const dispatch = useDispatch()
  const cartStore = useSelector(store => store?.cartStore || { products: [], count: 0 })

  // State
  const [activeThumb, setActiveThumb] = useState(null)
  const [qty, setQty] = useState(1)
  const [selectedSizes, setSelectedSizes] = useState([])
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Derived values
  const allMedia = variant?.media?.length > 0 
    ? variant.media 
    : product?.media || []
  
  const displayPrice = variant?.sellingPrice || product?.sellingPrice || 0
  const displayMrp = variant?.mrp || product?.mrp || 0
  const discount = displayMrp > displayPrice 
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) 
    : 0

  // Initialize active thumbnail
  useEffect(() => {
    if (allMedia.length > 0 && !activeThumb) {
      setActiveThumb(allMedia[0]?.secure_url)
    }
  }, [allMedia, activeThumb])

  // Browser-only tracking
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const timer = setTimeout(() => {
      trackViewContent(
        product?._id,
        product?.name,
        displayPrice,
        'BDT'
      )
    }, 100)
    
    return () => clearTimeout(timer)
  }, [product?._id, product?.name, displayPrice])

  // Check if product is in cart
  const isInCart = useCallback(() => {
    if (!cartStore.products?.length) return false
    return cartStore.products.some(p => 
      p.productId === product?._id && 
      p.variantId === variant?._id
    )
  }, [cartStore.products, product?._id, variant?._id])

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !variant) {
      showToast('error', 'Product information is incomplete')
      return
    }

    setIsLoading(true)

    try {
      const cartProduct = {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        url: product.slug,
        size: selectedSizes.length > 0 ? selectedSizes[0] : (variant.size || null),
        colors: variant.colors || [],
        mrp: displayMrp,
        sellingPrice: displayPrice,
        media: allMedia[0]?.secure_url || null,
        qty: qty
      }

      dispatch(addIntoCart(cartProduct))
      showToast('success', 'Product added to cart!')
      
    } catch (error) {
      console.error('Add to cart error:', error)
      showToast('error', 'Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle quantity change
  const handleQtyChange = (delta) => {
    setQty(prev => {
      const newQty = prev + delta
      return newQty < 1 ? 1 : newQty > 10 ? 10 : newQty
    })
  }

  // Toggle size selection
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  // If no product data
  if (!product || !variant) {
    return (
      <div className='flex justify-center items-center py-20 min-h-[400px]'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-gray-700 mb-4'>Product Not Available</h1>
          <Link href='/shop' className='text-amber-600 hover:underline'>
            Browse other products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      {/* Breadcrumb */}
      <nav className='text-sm mb-6'>
        <Link href='/' className='text-gray-500 hover:text-gray-700'>Home</Link>
        <span className='mx-2 text-gray-400'>/</span>
        <Link href={WEBSITE_SHOP} className='text-gray-500 hover:text-gray-700'>Shop</Link>
        <span className='mx-2 text-gray-400'>/</span>
        <span className='text-gray-900 font-medium'>{product.name}</span>
      </nav>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'>
        {/* Product Images */}
        <div className='space-y-4'>
          {/* Main Image */}
          <div className='relative aspect-square bg-gray-100 rounded-lg overflow-hidden'>
            {activeThumb ? (
              <OptimizedImage
                src={activeThumb}
                alt={product.name}
                fill
                className='object-cover'
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className='flex items-center justify-center h-full text-gray-400'>
                No Image
              </div>
            )}
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className='absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold'>
                -{discount}%
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {allMedia.length > 1 && (
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setActiveThumb(media.secure_url)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    activeThumb === media.secure_url 
                      ? 'border-amber-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <OptimizedImage
                    src={media.secure_url}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='80px'
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-6'>
          {/* Title & Rating */}
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
              {product.name}
            </h1>
            <div className='flex items-center gap-2 mb-4'>
              <div className='flex text-amber-500'>
                {[...Array(5)].map((_, i) => (
                  <IoStar key={i} className={i < 4 ? 'fill-current' : 'text-gray-300'} />
                ))}
              </div>
              <span className='text-sm text-gray-500'>({reviewCount} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className='flex items-baseline gap-3'>
            <span className='text-3xl font-bold text-gray-900'>
              ৳{displayPrice.toLocaleString()}
            </span>
            {displayMrp > displayPrice && (
              <>
                <span className='text-xl text-gray-400 line-through'>
                  ৳{displayMrp.toLocaleString()}
                </span>
                <span className='text-green-600 font-medium'>
                  Save ৳{(displayMrp - displayPrice).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className='text-gray-600'>{product.shortDescription}</p>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div>
              <h3 className='text-sm font-medium text-gray-900 mb-3'>Select Size</h3>
              <div className='flex flex-wrap gap-2'>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedSizes.includes(size)
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <h3 className='text-sm font-medium text-gray-900 mb-3'>Available Colors</h3>
              <div className='flex flex-wrap gap-2'>
                {colors.map((color, index) => (
                  <span 
                    key={index}
                    className='px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700'
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className='flex flex-wrap items-center gap-4 pt-4 border-t'>
            {/* Quantity Selector */}
            <div className='flex items-center border rounded-lg'>
              <button
                onClick={() => handleQtyChange(-1)}
                className='px-4 py-2 hover:bg-gray-100 transition-colors'
                disabled={qty <= 1}
              >
                <HiMinus className='w-4 h-4' />
              </button>
              <span className='px-4 py-2 font-medium min-w-[3rem] text-center'>{qty}</span>
              <button
                onClick={() => handleQtyChange(1)}
                className='px-4 py-2 hover:bg-gray-100 transition-colors'
                disabled={qty >= 10}
              >
                <HiPlus className='w-4 h-4' />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isLoading}
              className='flex-1 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50'
            >
              {isLoading ? (
                <ButtonLoading text='Adding...' loading={true} />
              ) : (
                'Add to Cart'
              )}
            </Button>

            {/* View Cart Link */}
            {isInCart() && (
              <Link 
                href={WEBSITE_CART}
                className='px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                View Cart
              </Link>
            )}
          </div>

          {/* Direct Order Buttons */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4'>
            <Button
              onClick={() => setIsDirectModalOpen(true)}
              className='bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium'
            >
              অর্ডার করুন (Direct Order)
            </Button>
            <Button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className='bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium'
            >
              ওয়াটসঅ্যাপে অর্ডার
            </Button>
          </div>

          {/* Stock Status */}
          <div className='flex items-center gap-2 text-sm'>
            <span className={`w-2 h-2 rounded-full ${variant.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {variant.stock > 0 ? `In Stock (${variant.stock} available)` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className='mt-12 pt-8 border-t'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Product Description</h2>
          <div 
            className='prose max-w-none text-gray-600'
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(encode(product.description)) }}
          />
        </div>
      )}

      {/* Reviews Section */}
      <div className='mt-12 pt-8 border-t'>
        <ProductReview productId={product._id} />
      </div>

      {/* Modals */}
      {typeof window !== 'undefined' && (
        <>
          <DirectOrderModal
            isOpen={isDirectModalOpen}
            onClose={() => setIsDirectModalOpen(false)}
            product={product}
            variant={variant}
            selectedSize={selectedSizes[0] || variant.size}
          />
          <WhatsAppOrderModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            product={product}
            variant={variant}
            selectedSize={selectedSizes[0] || variant.size}
          />
        </>
      )}
    </div>
  )
}

export default ProductClient
