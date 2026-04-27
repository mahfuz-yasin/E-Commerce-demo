'use client'
import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { IoStar } from "react-icons/io5";
import { BsChatQuote } from "react-icons/bs";

// জেলাভিত্তিক কাস্টমার রিভিউ
const testimonials = [
    {
        name: "মাহমুদ হাসান",
        district: "মাগুরা সদর",
        review: "আল-হিলাল থেকে পাঞ্জাবি নিয়েছিলাম, কাপড়ের কোয়ালিটি অসাধারণ। বিশেষ করে প্রিমিয়াম কটন ফেব্রিকটা খুব আরামদায়ক। মাগুরাতেই আন্তর্জাতিক মানের পাঞ্জাবি পাব ভাবিনি।",
        rating: 5
    },
    {
        name: "আব্দুল্লাহ আল মামুন",
        district: "ঝিনাইদহ",
        review: "ডেলিভারি খুব দ্রুত ছিল। পাঞ্জাবির ফিনিশিং এবং হাতের কাজগুলো খুবই নিখুঁত। সাইজ চার্ট অনুযায়ী একদম পারফেক্ট ফিটিং হয়েছে। ধন্যবাদ আল-হিলাল পাঞ্জাবি!",
        rating: 5
    },
    {
        name: "তানভীর আহমেদ",
        district: "ফরিদপুর",
        review: "তাদের কাস্টমার সার্ভিস খুবই ভালো। পাঞ্জাবির কালার যেমন ছবিতে দেখেছি, বাস্তবেও ঠিক তেমন। পাইকারি রেটে এত প্রিমিয়াম কোয়ালিটি আসলেই প্রশংসনীয়।",
        rating: 4
    },
    {
        name: "সাইফুল ইসলাম",
        district: "যশোর",
        review: "ঈদের জন্য পাঞ্জাবি নিয়েছিলাম, সবাই খুব পছন্দ করেছে। কাপড়ের কালার ধোয়ার পরেও একদম ঠিক আছে। আল-হিলাল এখন আমার পাঞ্জাবির প্রথম পছন্দ।",
        rating: 5
    },
    {
        name: "রাকিবুল ইসলাম",
        district: "শ্রীপুর, মাগুরা",
        review: "মাগুরা সদর থেকে সরাসরি তাদের শোরুমে গিয়েছিলাম। পাঞ্জাবির কালেকশন অনেক বড়। বিশেষ করে তাদের এক্সক্লুসিভ ডিজাইনগুলো সত্যিই আলাদা এবং প্রিমিয়াম।",
        rating: 5
    },
    {
        name: "জুবায়ের হোসেন",
        district: "রাজবাড়ী",
        review: "অনলাইনে অর্ডার করার সময় কিছুটা চিন্তিত ছিলাম, কিন্তু প্রোডাক্ট হাতে পাওয়ার পর সব ভয় দূর হয়ে গেল। প্যাকেজিংও খুব প্রিমিয়াম ছিল। নেক্সট টাইম আবার নিব।",
        rating: 4
    }
];

const Testimonial = () => {
    // Trello Style (#93) Shadow
    const trelloShadow = "shadow-[rgba(9,30,66,0.25)_0px_4px_8px_-2px,rgba(9,30,66,0.08)_0px_0px_0px_1px]";

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 3,
        slidesToScroll: 1,
        cssEase: "ease-in-out",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                }
            },
        ]
    }

    return (
        <div className='lg:px-32 px-4 sm:pt-20 pt-10 pb-20 bg-slate-50/30'>
            <div className='text-center mb-12'>
                <h2 className='sm:text-4xl text-3xl font-extrabold text-slate-900 mb-2 uppercase tracking-tight'>
                    Customer <span className='text-amber-600'>Reviews</span>
                </h2>
                <div className='h-1 w-16 bg-amber-600 mx-auto rounded-full'></div>
                <p className='mt-4 text-slate-500 font-medium'>সারাদেশের সন্তুষ্ট গ্রাহকদের মতামত</p>
            </div>

            <Slider {...settings} className="testimonial-slider">
                {testimonials.map((item, index) => (
                    <div key={index} className="p-4">
                        <div className={`bg-white rounded-xl p-8 min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${trelloShadow}`}>
                            
                            <div>
                                <BsChatQuote size={35} className='text-amber-600/20 mb-4' />
                                <p className='text-slate-600 leading-relaxed italic mb-6'>
                                    "{item.review}"
                                </p>
                            </div>

                            <div>
                                <div className='flex mb-2'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <IoStar 
                                            key={`star${i}`} 
                                            className={i < item.rating ? 'text-amber-500' : 'text-slate-200'} 
                                            size={16} 
                                        />
                                    ))}
                                </div>
                                <h4 className='font-bold text-slate-900 text-lg leading-tight'>{item.name}</h4>
                                <p className='text-sm text-slate-400 font-medium'>{item.district}</p>
                                <div className='mt-2 inline-flex items-center gap-1'>
                                    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                                    <p className='text-[10px] text-green-600 font-bold uppercase tracking-widest'>Verified Purchase</p>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </Slider>

            <style jsx global>{`
                .testimonial-slider .slick-dots li button:before {
                    color: #d97706;
                    font-size: 10px;
                }
                .testimonial-slider .slick-dots li.slick-active button:before {
                    color: #b45309;
                }
            `}</style>
        </div>
    )
}

export default Testimonial;