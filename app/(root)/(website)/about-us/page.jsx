'use client'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import React, { useEffect, useState } from 'react'

const breadcrumb = {
    title: 'About',
    links: [
   { label: 'About' },
 ]
}

const AboutUs = () => {
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/settings/about-us')
                const data = await response.json()
                if (data.success && data.data && data.data.content) {
                    setContent(data.data.content)
                }
            } catch (error) {
                console.error('Error fetching about content:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchContent()
    }, [])

    if (isLoading) {
        return (
            <div>
                <WebsiteBreadcrumb props={breadcrumb} />
                <div className='lg:px-40 px-5 py-20'>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
   <div>
     <WebsiteBreadcrumb props={breadcrumb} />
     <div className='lg:px-40 px-5 py-20'>
       {content ? (
         <div dangerouslySetInnerHTML={{ __html: content }} />
       ) : (
         <>
           <h1 className='text-xl font-semibold mb-3'>About Us</h1>
           <p>Welcome to E-store, your one-stop destination for quality, convenience, and innovation in online shopping.</p>
           <p>Founded with a mission to redefine the eCommerce experience, we are passionate about bringing you a carefully curated selection of products that meet your everyday needs—whether it's fashion, electronics, home essentials, beauty, or lifestyle goods. Our goal is to deliver not just products, but value, trust, and a seamless shopping journey.</p>
           <p className='mt-5'>What sets us apart is our commitment to:</p>
           <ul className='list-disc ps-10 mt-3'>
             <li> <b> Customer Satisfaction:</b> Your happiness is our priority. From browsing to checkout, we&apos;re here to make your shopping experience effortless and enjoyable.</li>

             <li>  <b> Quality & Affordability: </b>We partner directly with trusted suppliers and brands to offer high-quality products at competitive prices.</li>

             <li> <b>  Fast & Reliable Shipping: </b>We understand the excitement of online shopping, so we work hard to ensure your orders arrive on time.</li>

             <li>  <b> Secure Shopping: </b>Your data is safe with us. Our platform uses cutting-edge encryption and payment security technologies.</li>
           </ul>

           <p className='mt-3'>As a growing brand, we believe in constantly evolving—adding new products, improving our services, and listening to what our customers want. Whether you're shopping for yourself or finding the perfect gift, we&apos;re here to help you discover something you'll love.
           </p>
           <p className='mt-3'>
           Thank you for choosing E-store. Let&apos;s make shopping smarter, simpler, and more enjoyable—together.
           </p>
         </>
       )}
     </div>
   </div>
 )
}

export default AboutUs
