'use client'
import React from 'react'
import Link from 'next/link'
import { IoLocationOutline, IoCallOutline, IoMailOutline } from "react-icons/io5"
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube } from "react-icons/fa"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'

const Footer = () => {
    // Glassmorphism effect classes - equal height cards
    const glassCard = "backdrop-blur-md bg-white/70 border border-white/40 shadow-lg rounded-2xl p-5 h-full flex flex-col";
    const glassIcon = "backdrop-blur-sm bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-700 border border-white/50";

    const socialLinks = [
        { platform: 'facebook', url: '#', icon: FaFacebookF, color: "hover:bg-blue-500 hover:text-white" },
        { platform: 'whatsapp', url: 'https://wa.me/8801810841539', icon: FaWhatsapp, color: "hover:bg-green-500 hover:text-white" },
        { platform: 'instagram', url: '#', icon: FaInstagram, color: "hover:bg-pink-500 hover:text-white" },
        { platform: 'youtube', url: '#', icon: FaYoutube, color: "hover:bg-red-500 hover:text-white" }
    ]

    const shopLinks = ['Premium Punjabi', 'Pyjama', 'T-shirt', 'Polo Shirt']
    const pageLinks = [
        { name: 'About Us', href: '/about-us' },
        { name: 'Contact Us', href: '/contact-us' },
        { name: 'Return Policy', href: '/return-policy' },
        { name: 'Shipping Policy', href: '/shipping-policy' },
        { name: 'Privacy Policy', href: '/privacy-policy' }
    ]
    const supportLinks = [
        { name: 'My Account', href: USER_DASHBOARD },
        { name: 'Our Story', href: '/about-us' },
        { name: 'Privacy', href: '/privacy-policy' },
        { name: 'Login', href: WEBSITE_LOGIN }
    ]

    return (
        <footer className='bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 border-t border-white/60 mt-20 font-sans relative overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
            </div>

            {/* Main Footer Content */}
            <div className='relative z-10 py-12 lg:px-16 px-4'>
                
                {/* Top Section - Brand & Social */}
                <ScrollReveal direction='up' delay={0}>
                    <div className={`${glassCard} mb-6 text-center`}>
                        <Link href={WEBSITE_HOME} className="inline-block group">
                            <Image src={logo} alt="Al-Hilal Panjabi" width={80} height={80} className="w-20 h-20 mx-auto mb-4" />
                        </Link>
                        <p className='text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-6'>
                            আল-হিলাল পাঞ্জাবি মানেই আভিজাত্য। আমরা পাইকারি ও খুচরা বিক্রয়কারী হিসেবে দেশের সেরা প্রিমিয়াম পাঞ্জাবি ও পায়জামা সরবরাহ করছি।
                        </p>
                        
                        {/* Social Icons */}
                        <div className='flex justify-center gap-3'>
                            {socialLinks.map((social, i) => {
                                const Icon = social.icon
                                return (
                                    <Link key={i} href={social.url} className={`p-3 rounded-xl bg-white/80 text-slate-600 ${social.color} transition-all duration-300 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md hover:scale-110`}>
                                        <Icon size={18} />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Middle Section - Cards Grid */}
                {/* Mobile: 2 columns (Shop & Pages side by side, Support & Contact below) */}
                {/* Tablet: 2 columns */}
                {/* Desktop: 4 columns */}
                <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch'>
                    
                    {/* Shop Card */}
                    <ScrollReveal direction='up' delay={0.1} className="h-full">
                        <div className={glassCard}>
                            <h4 className='text-slate-800 font-bold text-base mb-4 flex items-center gap-2'>
                                <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
                                Shop
                            </h4>
                            <ul className='space-y-2 flex-1'>
                                {shopLinks.map(link => (
                                    <li key={link}>
                                        <Link href={WEBSITE_SHOP} className='text-slate-600 hover:text-amber-600 transition-all text-sm flex items-center gap-2 group'>
                                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-all'></span>
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Pages Card */}
                    <ScrollReveal direction='up' delay={0.15} className="h-full">
                        <div className={glassCard}>
                            <h4 className='text-slate-800 font-bold text-base mb-4 flex items-center gap-2'>
                                <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
                                Pages
                            </h4>
                            <ul className='space-y-2 flex-1'>
                                {pageLinks.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className='text-slate-600 hover:text-amber-600 transition-all text-sm flex items-center gap-2 group'>
                                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-all'></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Support Card */}
                    <ScrollReveal direction='up' delay={0.2} className="h-full">
                        <div className={glassCard}>
                            <h4 className='text-slate-800 font-bold text-base mb-4 flex items-center gap-2'>
                                <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
                                Support
                            </h4>
                            <ul className='space-y-2 flex-1'>
                                {supportLinks.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className='text-slate-600 hover:text-amber-600 transition-all text-sm flex items-center gap-2 group'>
                                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-all'></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Showroom/Contact Card */}
                    <ScrollReveal direction='up' delay={0.25} className="h-full">
                        <div className={glassCard}>
                            <h4 className='text-slate-800 font-bold text-base mb-4 flex items-center gap-2'>
                                <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
                                Showroom
                            </h4>
                            <div className='space-y-3 flex-1'>
                                <div className='flex gap-3 items-start'>
                                    <div className={`p-2 rounded-lg ${glassIcon}`}>
                                        <IoLocationOutline size={16} />
                                    </div>
                                    <p className='text-xs text-slate-600 leading-snug'>
                                        Shop No.: 22, S.R. Shopping Mall (Under Ground), East Aganagor, South Keranigonj, Dhaka.
                                    </p>
                                </div>
                                <div className='flex gap-3 items-center'>
                                    <div className={`p-2 rounded-lg ${glassIcon}`}>
                                        <IoCallOutline size={16} />
                                    </div>
                                    <Link href="tel:+8801810841539" className='text-xs font-semibold text-slate-700 hover:text-amber-600'>+880 1810 841 539</Link>
                                </div>
                                <div className='flex gap-3 items-center'>
                                    <div className={`p-2 rounded-lg ${glassIcon}`}>
                                        <IoMailOutline size={16} />
                                    </div>
                                    <Link href="mailto:labibhelal3662@gmail.com" className='text-xs text-slate-600 hover:text-amber-600'>labibhelal3662@gmail.com</Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="relative z-10 backdrop-blur-md bg-white/50 border-t border-white/60 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} <span className="font-bold text-slate-800">Al-Hilal Panjabi</span>. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mastered by</span>
                        <a 
                            href="https://github.com/mahfuz-yasin" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="backdrop-blur-sm bg-white/70 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-amber-600 transition-all border border-white/60 shadow-sm"
                        >
                            Mahfuz Yasin
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer