import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
// Temporarily disabled tracking components for debugging
// import FacebookPixel from '@/components/FacebookPixel'
// import TikTokPixel from '@/components/TikTokPixel'
// import MessengerChat from '@/components/MessengerChat'
import React from 'react'
import { Kumbh_Sans } from 'next/font/google'

const kumbh = Kumbh_Sans({
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    subsets: ['latin']
})

const layout = ({ children }) => {
    return (
        <div className={kumbh.className}>
            {/* Temporarily disabled tracking components for debugging */}
            {/* <FacebookPixel />
            <TikTokPixel /> */}
            <Header />
            <main>
                {children}
            </main>
            <Footer />
            {/* <MessengerChat /> */}
        </div>
    )
}

export default layout