'use client'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { IoStar } from "react-icons/io5";
import { WEBSITE_CART, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { decode, encode } from "entities";
import { HiMinus, HiPlus } from "react-icons/hi2";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { useDispatch, useSelector } from "react-redux";
import { addIntoCart } from "@/store/reducer/cartReducer";
import { showToast } from "@/lib/showToast";
import { Button } from "@/components/ui/button";
import loadingSvg from '@/public/assets/images/loading.svg'
import ProductReveiw from "@/components/Application/Website/ProductReveiw";
import DirectOrderModal from "@/components/Application/Website/DirectOrderModal";
import WhatsAppOrderModal from "@/components/Application/Website/WhatsAppOrderModal";
import OptimizedImage from "@/components/ui/OptimizedImage";
import ImageZoom from "@/components/ui/ImageZoom";
import { trackViewContent, trackAddToCart } from "@/components/FacebookPixel";
const ProductDetails = ({ product, variant, colors, sizes, reviewCount }) => {

    const dispatch = useDispatch()
    const cartStore = useSelector(store => store?.cartStore || { products: [], count: 0 })

    const [activeThumb, setActiveThumb] = useState()
    const [qty, setQty] = useState(1)
    const [isAddedIntoCart, setIsAddedIntoCart] = useState(false)
    const [isProductLoading, setIsProductLoading] = useState(false)
    const [selectedSizes, setSelectedSizes] = useState([])
    const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
    useEffect(() => {
        setActiveThumb(variant?.media[0]?.secure_url)
        // Don't auto-select sizes - let user choose manually
        setSelectedSizes([])
    }, [variant])

    // Track ViewContent event
    useEffect(() => {
        if (product && variant) {
            trackViewContent(
                product._id,
                product.name,
                variant.sellingPrice || product.sellingPrice,
                'BDT'
            )
        }
    }, [product, variant])

    useEffect(() => {
        if (cartStore.count > 0) {
            // Check if ALL selected sizes are already in cart
            const allSelectedInCart = selectedSizes.every(size => 
                cartStore.products.some(cartProduct => 
                    cartProduct.productId === product._id && 
                    cartProduct.variantId === variant._id &&
                    cartProduct.size === size
                )
            )
            
            // Show "Go To Cart" only if there are items in cart for this variant
            const anySizeInCart = cartStore.products.some(cartProduct => 
                cartProduct.productId === product._id && 
                cartProduct.variantId === variant._id
            )

            setIsAddedIntoCart(anySizeInCart && selectedSizes.length > 0 && allSelectedInCart)
        } else {
            setIsAddedIntoCart(false)
        }

        setIsProductLoading(false)

    }, [variant, selectedSizes, cartStore.products, cartStore.count, product._id, variant._id])

    const handleThumb = (thumbUrl) => {
        setActiveThumb(thumbUrl)
    }

    const handleQty = (actionType) => {
        if (actionType === 'inc') {
            setQty(prev => prev + 1)
        } else {
            if (qty !== 1) {
                setQty(prev => prev - 1)
            }
        }
    }

    const handleSizeSelection = (size) => {
        setSelectedSizes(prev => {
            if (prev.includes(size)) {
                return prev.filter(s => s !== size)
            } else {
                return [...prev, size]
            }
        })
    }

    const handleAddToCart = () => {
        if (selectedSizes.length === 0) {
            return showToast('error', 'Please select at least one size.')
        }

        // Track AddToCart event (track once for the first size)
        if (selectedSizes.length > 0) {
            trackAddToCart(
                product._id,
                product.name,
                variant.sellingPrice,
                qty,
                'BDT'
            )
        }

        // Add each selected size as a separate cart item
        selectedSizes.forEach(size => {
            const cartProduct = {
                productId: product._id,
                variantId: variant._id,
                name: product.name,
                url: product.slug,
                size: size,
                colors: variant.colors,
                mrp: variant.mrp,
                sellingPrice: variant.sellingPrice,
                media: variant?.media[0]?.secure_url,
                qty: qty
            }

            dispatch(addIntoCart(cartProduct))
        })

        setIsAddedIntoCart(true)
        showToast('success', 'Product added into cart.')
    }

    return (
        <div className="lg:px-32 px-4">

            {isProductLoading &&
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50">
                    <Image src={loadingSvg} width={80} height={80} alt="Loading" />
                </div>
            }

            <div className="my-10">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_SHOP}>Product</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={WEBSITE_PRODUCT_DETAILS(product?.slug)}>{product?.name} </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="md:flex justify-between items-start lg:gap-10 gap-5 mb-20">
                <div className="md:w-1/2 xl:flex xl:justify-center xl:gap-5 md:sticky md:top-0">
                    <div className="xl:order-last xl:mb-0 mb-5 xl:w-[calc(100%-144px)]">
                        <ImageZoom
                            src={activeThumb}
                            width={650}
                            height={650}
                            alt={product?.name || 'product'}
                            className="border rounded max-w-full"
                        />
                    </div>
                    <div className="flex xl:flex-col items-center xl:gap-5 gap-3 xl:w-36 overflow-auto xl:pb-0 pb-2 max-h-[600px]">
                        {variant?.media?.map((thumb) => (
                            <OptimizedImage
                                key={thumb._id}
                                src={thumb?.secure_url}
                                width={100}
                                height={100}
                                alt={`${product?.name} thumbnail`}
                                className={`md:max-w-full max-w-16 rounded cursor-pointer ${thumb.secure_url === activeThumb ? 'border-2 border-primary' : 'border'}`}
                                onClick={() => handleThumb(thumb.secure_url)}
                            />
                        ))}
                    </div>
                </div>

                <div className="md:w-1/2 md:mt-0 mt-5">
                    <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
                    <div className="flex items-center gap-1 mb-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <IoStar key={i} />
                        ))}
                        <span className="text-sm ps-2">({reviewCount} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-semibold">{variant.sellingPrice.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                        <span className="text-sm line-through text-gray-500">{variant.mrp.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>


                        <span className="bg-red-500 rounded-2xl px-3 py-1 text-white text-xs ms-5">-{variant.discountPercentage}%</span>


                    </div>

                    {/* Short Description */}
                    <div className="line-clamp-3 text-gray-700 mb-3">
                        {product.shortDescription ? decode(product.shortDescription) : decode(product.description)}
                    </div>

                    <div className="mt-5">
                        <p className="mb-2">
                            <span className="font-semibold">Colors: </span> {variant?.colors?.map(c => c.name).join(', ')}
                        </p>
                        <div className="flex gap-5">
                            {colors.map(color => (
                                <Link onClick={() => setIsProductLoading(true)} href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${color}&size=${variant.size}`}
                                    key={color}
                                    className={`border py-1 px-3 rounded-lg cursor-pointer hover:bg-primary hover:text-white ${variant?.colors?.some(c => c.name === color) ? 'bg-primary text-white' : ''}`}
                                >
                                    {color}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-5">
                        <p className="mb-2">
                            <span className="font-semibold">Size: </span> {selectedSizes.length > 0 ? selectedSizes.join(', ') : 'Select sizes'}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleSizeSelection(size)}
                                    className={`border py-1 px-3 rounded-lg cursor-pointer hover:bg-primary hover:text-white ${selectedSizes.includes(size) ? 'bg-primary text-white' : ''}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="font-bold mb-2">Quantity</p>
                        <div className="flex items-center h-10 border w-fit rounded-full">

                            <button type="button" className="h-full w-10 flex justify-center items-center" onClick={() => handleQty('desc')}>
                                <HiMinus />
                            </button>
                            <input type="text" value={qty} className="w-14 text-center border-none outline-offset-0" readOnly />
                            <button type="button" className="h-full w-10 flex justify-center items-center" onClick={() => handleQty('inc')}>
                                <HiPlus />
                            </button>

                        </div>
                    </div>


                    <div className="mt-5">
                        {!isAddedIntoCart ?
                            <ButtonLoading type="button" text="Add To Cart" loading={false} className="w-full rounded-full py-6 text-md cursor-pointer" onClick={handleAddToCart} />
                            :
                            <Button className="w-full rounded-full py-6 text-md cursor-pointer" type="button" asChild>
                                <Link href={WEBSITE_CART}>Go To Cart</Link>
                            </Button>
                        }

                        {/* Direct Order and WhatsApp Order Buttons */}
                        <div className="flex gap-3 mt-3">
                            <Button
                                onClick={() => setIsDirectModalOpen(true)}
                                className="flex-1 bg-black hover:bg-gray-800 rounded-full py-3 text-md cursor-pointer"
                            >
                                অর্ডার করুন
                            </Button>
                            <Button
                                onClick={() => setIsWhatsAppModalOpen(true)}
                                className="flex-1 bg-green-600 hover:bg-green-700 rounded-full py-3 text-md cursor-pointer"
                            >
                                ওয়াটসঅ্যাপে অর্ডার
                            </Button>
                        </div>

                    </div>

                </div>
            </div>


            <div className="mb-10">
                <div className="shadow rounded border">
                    <div className="p-3 bg-gray-50 border-b">
                        <h2 className="font-semibold text-2xl">Product Description</h2>
                    </div>
                    <div className="p-3">
                        {/* Display longDescription if available, otherwise fallback to old description */}
                        {product.longDescription && product.longDescription.length > 0 ? (
                            <div className="space-y-6">
                                {product.longDescription.map((section, index) => (
                                    <div key={index}>
                                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                                            {decode(section.header)}
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {decode(section.paragraph)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: encode(product.description) }}></div>
                        )}
                    </div>
                </div>
            </div>

            <ProductReveiw productId={product._id} />

            {/* Direct Order Modal */}
            <DirectOrderModal
                isOpen={isDirectModalOpen}
                onClose={() => setIsDirectModalOpen(false)}
                product={product}
                variant={variant}
                selectedSize={selectedSizes.length > 0 ? selectedSizes.join(', ') : null}
            />

            {/* WhatsApp Order Modal */}
            <WhatsAppOrderModal
                isOpen={isWhatsAppModalOpen}
                onClose={() => setIsWhatsAppModalOpen(false)}
                product={product}
                variant={variant}
                selectedSize={selectedSizes.length > 0 ? selectedSizes.join(', ') : null}
            />

        </div>
    )
}

export default ProductDetails