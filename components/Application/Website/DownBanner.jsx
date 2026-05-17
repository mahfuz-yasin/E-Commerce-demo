'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

// Import default banner images for Zero Loading UI
import banner1 from '@/public/assets/images/banner1.avif'
import banner2 from '@/public/assets/images/banner2.avif'

// Default banners as fallback (Zero Loading UI)
const defaultBanners = [
    {
        _id: 'default-1',
        imageUrl: banner1,
        title: 'Special Offer',
        link: '#',
        isActive: true
    },
    {
        _id: 'default-2',
        imageUrl: banner2,
        title: 'New Collection',
        link: '#',
        isActive: true
    }
]

const DownBanner = () => {
    const [banners, setBanners] = useState(defaultBanners)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/admin/downbanner')
            if (response.data.success && response.data.data && response.data.data.length > 0) {
                // Filter active banners and take first 2
                const activeBanners = response.data.data
                    .filter(b => b.isActive)
                    .slice(0, 2)
                if (activeBanners.length > 0) {
                    setBanners(activeBanners)
                }
            }
        } catch (error) {
            console.error('Error fetching down banners:', error)
            // Keep default banners on error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='w-full bg-white py-4'>
            <div className='container mx-auto px-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {banners.map((banner) => (
                        <Link
                            key={banner._id}
                            href={banner.link || '#'}
                            className='relative group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300'
                        >
                            <div className='aspect-[16/9] md:aspect-[21/9] relative'>
                                <Image
                                    src={banner.imageUrl || banner1}
                                    alt={banner.title || 'Banner'}
                                    fill
                                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                                    sizes='(max-width: 768px) 100vw, 50vw'
                                />
                                {banner.title && (
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4'>
                                        <h3 className='text-white font-semibold text-lg md:text-xl'>
                                            {banner.title}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DownBanner
