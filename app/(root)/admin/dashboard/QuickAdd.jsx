import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlinePermMedia } from "react-icons/md";
import { ADMIN_CATEGORY_ADD, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD } from '@/routes/AdminPanelRoute';
const QuickAdd = () => {
    return (
        <div>
            <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>Quick Actions</p>
            <div className='grid lg:grid-cols-4 sm:grid-cols-2 gap-3'>
                {[
                    { href: ADMIN_CATEGORY_ADD, label: 'Add Category',  icon: <BiCategory size={18} />,        color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/70' },
                    { href: ADMIN_PRODUCT_ADD,  label: 'Add Product',   icon: <IoShirtOutline size={18} />,    color: 'text-primary',    bg: 'bg-primary/5',                          border: 'border-primary/20',                             hover: 'hover:bg-primary/10' },
                    { href: ADMIN_COUPON_ADD,   label: 'Add Coupon',    icon: <RiCoupon2Line size={18} />,     color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/40',       border: 'border-amber-200 dark:border-amber-800',        hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/70' },
                    { href: ADMIN_MEDIA_SHOW,   label: 'Upload Media',  icon: <MdOutlinePermMedia size={18} />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40',    border: 'border-violet-200 dark:border-violet-800',      hover: 'hover:bg-violet-100 dark:hover:bg-violet-950/70' },
                ].map((q, i) => (
                    <Link key={i} href={q.href}>
                        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${q.border} ${q.bg} ${q.hover} transition-all duration-150 cursor-pointer`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-black/20 shadow-sm ${q.color}`}>
                                {q.icon}
                            </div>
                            <span className={`text-sm font-semibold ${q.color}`}>{q.label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default QuickAdd