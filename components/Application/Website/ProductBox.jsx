import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
const ProductBox = ({ product }) => {

    return (
        <div className='rounded-lg hover:shadow-lg border overflow-hidden'>
            <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className='block relative w-full lg:h-[300px] sm:h-[250px] h-[150px]'>
                <Image
                    src={product?.media[0]?.secure_url || imgPlaceholder}
                    alt={product?.media[0]?.alt || product?.name}
                    title={product?.media[0]?.title || product?.name}
                    className='object-cover object-top'
                    quality={90}
                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
                    fill
                />
                <div className="p-3 border-t">
                    <h4>{product?.name}</h4>
                    <p className='flex gap-2 text-sm mt-2'>
                        <span className='line-through text-gray-400'>{product?.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        <span className='font-semibold'>{product?.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    </p>
                </div>
            </Link>
        </div>
    )
}

export default ProductBox