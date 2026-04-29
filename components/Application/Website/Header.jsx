'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import logo from '@/public/assets/images/logo-black.png'
import { IoIosSearch } from "react-icons/io";
import Cart from './Cart'
import { VscAccount } from "react-icons/vsc";
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { IoMdClose } from "react-icons/io";
import { HiMiniBars3 } from "react-icons/hi2";
import Search from './Search'

const Header = () => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    // মেনু বন্ধ করার ফাংশন
    const closeMenu = () => setIsMobileMenu(false);

    return (
        <div className='bg-white border-b lg:px-32 px-4 sticky top-0 z-[100]'>
            <div className='flex justify-between items-center lg:py-5 py-3'>
                
                {/* Brand Logo Section */}
                <Link 
                    href={WEBSITE_HOME} 
                    className="group focus:outline-none transition-all duration-300"
                    onClick={closeMenu}
                    aria-label="Al-Hilal Panjabi Home"
                >
                    <div className="relative">
                        <Image 
                            src={logo} 
                            alt="Al-Hilal Panjabi" 
                            width={300} 
                            height={200} 
                            className="w-32 h-auto md:w-40 md:h-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                        />
                        <span className="block h-0.5 max-w-0 group-hover:max-w-full transition-all duration-500 bg-amber-600 mt-1"></span>
                    </div>
                </Link>

                <div className='flex items-center gap-4 lg:gap-20'>
                    {/* Mobile Navigation Menu */}
                    <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 bg-white fixed z-50 top-0 w-full h-screen transition-all duration-500 ease-in-out ${isMobileMenu ? 'left-0' : '-left-full'}`}>
                        <div className='lg:hidden flex justify-between items-center bg-gray-50 py-4 border-b px-5'>
                            <Image src={logo} width={120} height={50} alt='logo' />
                            <button onClick={closeMenu} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                                <IoMdClose size={28} className='text-gray-600' />
                            </button>
                        </div>

                        <ul className='lg:flex justify-between items-center lg:gap-8 gap-1 px-5 lg:px-0 mt-5 lg:mt-0'>
                            {[
                                { label: 'Home', href: WEBSITE_HOME },
                                { label: 'All', href: WEBSITE_SHOP },
                                { label: 'Premium', href: `${WEBSITE_SHOP}?category=t-premium` },
                                { label: 'Crash', href: `${WEBSITE_SHOP}?category=crash` },
                                { label: 'Oversized', href: `${WEBSITE_SHOP}?category=overshized` },
                                { label: 'About', href: '/about-us' },
                            ].map((item) => (
                                <li key={item.label} className='border-b lg:border-none'>
                                    <Link 
                                        href={item.href} 
                                        onClick={closeMenu} 
                                        className='block py-4 lg:py-0 text-gray-700 font-medium hover:text-amber-600 transition-colors duration-300'
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Action Section: Icons & Mobile Slogan */}
                    <div className='flex flex-col items-end'>
                        {/* Icons Container */}
                        <div className='flex items-center gap-5 md:gap-7'>
                            <button 
                                type='button' 
                                onClick={() => { setShowSearch(!showSearch); closeMenu(); }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <IoIosSearch className='text-gray-600 hover:text-amber-600' size={24} />
                            </button>

                            <div className="relative hover:scale-110 transition-transform">
                                <Cart />
                            </div>

                            {!auth ? (
                                <Link href={WEBSITE_LOGIN} onClick={closeMenu} className="p-1 hover:bg-gray-100 rounded-full transition-all">
                                    <VscAccount className='text-gray-600 hover:text-amber-600' size={24} />
                                </Link>
                            ) : (
                                <Link href={USER_DASHBOARD} onClick={closeMenu} className="ring-2 ring-transparent hover:ring-amber-500 rounded-full transition-all">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                    </Avatar>
                                </Link>
                            )}

                            <button 
                                type='button' 
                                className='lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-all' 
                                onClick={() => setIsMobileMenu(true)}
                            >
                                <HiMiniBars3 size={26} className='text-gray-700' />
                            </button>
                        </div>

                        {/* --- Gorgeous Mobile Slogan with Effective Top Line --- */}
                        <div className='lg:hidden block mt-2 text-right select-none animate-in fade-in slide-in-from-right-4 duration-700'>
                            {/* স্লোগানের উপরে একটি প্রিমিয়াম গ্রেডিয়েন্ট লাইন */}
                            <div className='flex justify-end mb-1.5'>
                                <div className='h-[1px] w-24 bg-gradient-to-l from-amber-500 via-amber-200 to-transparent rounded-full opacity-80'></div>
                            </div>

                            <div className="flex flex-col">
                                <span className='text-[10px] font-bold tracking-[0.06em] uppercase bg-gradient-to-l from-amber-800 via-amber-600 to-gray-500 bg-clip-text text-transparent leading-none'>
                                    Trusted company for wholesale and retail 
                                </span>
                                <span className='text-[9px] font-medium text-gray-400 italic mt-1 opacity-90'>
                                    for all type of Punjabi and paijamas
                                </span>
                            </div>
                            
                            {/* স্লোগানের নিচে ছোট একটি সিগনেচার লাইন */}
                            <div className='flex justify-end mt-1'>
                                <div className='h-[1.5px] w-10 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Component */}
            <Search isShow={showSearch} />
        </div>
    )
}

export default Header