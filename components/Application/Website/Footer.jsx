'use client'
import React from 'react'
import Link from 'next/link'
import { IoLocationOutline, IoCallOutline, IoMailOutline } from "react-icons/io5"
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube } from "react-icons/fa"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'

const Footer = () => {
    // পিক্সেল-পারফেক্ট ট্রেলো শ্যাডো (#93)
    const trelloShadow = "shadow-[rgba(9,30,66,0.25)_0px_4px_8px_-2px,rgba(9,30,66,0.08)_0px_0px_0px_1px]";

    const socialLinks = [
        { platform: 'facebook', url: '#', icon: FaFacebookF, color: "hover:bg-blue-600" },
        { platform: 'whatsapp', url: 'https://wa.me/8801810841539', icon: FaWhatsapp, color: "hover:bg-green-600" },
        { platform: 'instagram', url: '#', icon: FaInstagram, color: "hover:bg-pink-600" },
        { platform: 'youtube', url: '#', icon: FaYoutube, color: "hover:bg-red-600" }
    ]

    return (
        <footer className='bg-white border-t border-slate-100 mt-20 font-sans'>
            {/* ১. মেইন ফুটার কন্টেন্ট */}
            <div className='grid lg:grid-cols-12 md:grid-cols-2 grid-cols-2 gap-y-12 gap-x-4 py-16 lg:px-32 px-6'>

                {/* ব্র্যান্ড ভিশন সেকশন - মোবাইলে পুরো উইডথ নেবে */}
                <div className='col-span-2 lg:col-span-4 md:col-span-2'>
                    <Link href={WEBSITE_HOME} className="inline-block mb-6 group">
                        <div className="flex flex-col">
                            <Image src={logo} alt="Al-Hilal Panjabi" width={100} height={100} className="w-24 h-24" />
                        </div>
                    </Link>
                    <p className='text-slate-500 text-sm leading-relaxed max-w-sm'>
                        আল-হিলাল পাঞ্জাবি মানেই আভিজাত্য। আমরা পাইকারি ও খুচরা বিক্রয়কারী হিসেবে দেশের সেরা প্রিমিয়াম পাঞ্জাবি ও পায়জামা সরবরাহ করছি।
                    </p>
                    
                    {/* সোশ্যাল আইকনস */}
                    <div className='flex gap-3 mt-8'>
                        {socialLinks.map((social, i) => {
                            const Icon = social.icon
                            return (
                                <Link key={i} href={social.url} className={`p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-white ${social.color} transition-all duration-300 ${trelloShadow}`}>
                                    <Icon size={18} />
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Shop সেকশন - মোবাইলে পাশাপাশি বসবে */}
                <div className='col-span-1 lg:col-span-2'>
                    <h4 className='text-slate-900 font-bold text-lg mb-6 relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-amber-600'>Shop</h4>
                    <ul className='space-y-3'>
                        {['Premium Punjabi', 'Pyjama', 'T-shirt', 'Polo Shirt'].map(link => (
                            <li key={link}>
                                <Link href={WEBSITE_SHOP} className='text-slate-500 hover:text-amber-600 transition-all text-sm flex items-center gap-2 group'>
                                    <span className='w-1 h-1 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-all'></span>
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pages সেকশন */}
                <div className='col-span-1 lg:col-span-2'>
                    <h4 className='text-slate-900 font-bold text-lg mb-6 relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-amber-600'>Pages</h4>
                    <ul className='space-y-3 text-sm'>
                        <li><Link href="/about-us" className='text-slate-500 hover:text-amber-600 transition-all flex items-center gap-2 group'>
                            <span className='w-1 h-1 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-all'></span>
                            About Us
                        </Link></li>
                        <li><Link href="/contact-us" className='text-slate-500 hover:text-amber-600 transition-all flex items-center gap-2 group'>
                            <span className='w-1 h-1 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-all'></span>
                            Contact Us
                        </Link></li>
                        <li><Link href="/return-policy" className='text-slate-500 hover:text-amber-600 transition-all flex items-center gap-2 group'>
                            <span className='w-1 h-1 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-all'></span>
                            Return Policy
                        </Link></li>
                        <li><Link href="/privacy-policy" className='text-slate-500 hover:text-amber-600 transition-all flex items-center gap-2 group'>
                            <span className='w-1 h-1 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-all'></span>
                            Privacy Policy
                        </Link></li>
                    </ul>
                </div>

                {/* Support সেকশন - মোবাইলে পাশাপাশি বসবে */}
                <div className='col-span-1 lg:col-span-2'>
                    <h4 className='text-slate-900 font-bold text-lg mb-6 relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-amber-600'>Support</h4>
                    <ul className='space-y-3 text-sm'>
                        <li><Link href={USER_DASHBOARD} className='text-slate-500 hover:text-amber-600'>My Account</Link></li>
                        <li><Link href="/about-us" className='text-slate-500 hover:text-amber-600'>Our Story</Link></li>
                        <li><Link href="/privacy-policy" className='text-slate-500 hover:text-amber-600'>Privacy</Link></li>
                        <li><Link href={WEBSITE_LOGIN} className='text-slate-500 hover:text-amber-600'>Login</Link></li>
                    </ul>
                </div>

                {/* কন্টাক্ট সেকশন - মোবাইলে পুরো উইডথ নেবে */}
                <div className='col-span-2 lg:col-span-4'>
                    <h4 className='text-slate-900 font-bold text-lg mb-6 relative after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-amber-600'>Showroom</h4>
                    <div className='space-y-5'>
                        <div className='flex gap-4'>
                            <div className={`p-2.5 rounded-xl bg-amber-50 text-amber-600 h-fit ${trelloShadow}`}>
                                <IoLocationOutline size={20} />
                            </div>
                            <p className='text-sm text-slate-600 leading-snug'>
                                <span className='font-bold block text-slate-900'>Shop No.: 22</span>
                                S. R. Shopping Mall (Under Ground), East Aganagor, South Keranigonj, Dhaka.
                            </p>
                        </div>
                        <div className='flex gap-4 items-center'>
                            <div className={`p-2.5 rounded-xl bg-amber-50 text-amber-600 ${trelloShadow}`}>
                                <IoCallOutline size={20} />
                            </div>
                            <Link href="tel:+8801810841539" className='text-sm font-bold text-slate-700 hover:text-amber-600'>+880 1810 841 539</Link>
                        </div>
                        <div className='flex gap-4 items-center'>
                            <div className={`p-2.5 rounded-xl bg-amber-50 text-amber-600 ${trelloShadow}`}>
                                <IoMailOutline size={20} />
                            </div>
                            <Link href="mailto:labibhelal3662@gmail.com" className='text-sm text-slate-600 hover:text-amber-600'>labibhelal3662@gmail.com</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ২. কপিরাইট ও ডেভেলপার সিগনেচার */}
            <div className="bg-slate-50/50 py-8 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} <span className="font-bold text-slate-900">Al-Hilal Panjabi</span>. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mastered by</span>
                        <a 
                            href="https://github.com/mahfuz-yasin" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white px-4 py-1.5 rounded-lg text-sm font-bold text-slate-700 hover:text-amber-600 transition-all border border-slate-100 shadow-sm"
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