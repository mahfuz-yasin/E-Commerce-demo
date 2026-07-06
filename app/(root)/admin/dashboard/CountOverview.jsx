'use client'
import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import useFetch from '@/hooks/useFetch';
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute';
const CountOverview = () => {

    const { data: countData } = useFetch('/api/dashboard/admin/count')

    const stats = [
        { label: 'Total Categories', value: countData?.data?.category || 0, icon: <BiCategory className='w-5 h-5' />, href: ADMIN_CATEGORY_SHOW, color: 'text-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-950', bar: 'bg-emerald-500' },
        { label: 'Total Products',   value: countData?.data?.product || 0,  icon: <IoShirtOutline className='w-5 h-5' />, href: ADMIN_PRODUCT_SHOW,   color: 'text-primary',    iconBg: 'bg-primary/10 dark:bg-primary/20',       bar: 'bg-primary' },
        { label: 'Total Customers',  value: countData?.data?.customer || 0, icon: <LuUserRound className='w-5 h-5' />,    href: ADMIN_CUSTOMERS_SHOW, color: 'text-amber-600',  iconBg: 'bg-amber-100 dark:bg-amber-950',  bar: 'bg-amber-500' },
        { label: 'Total Orders',     value: countData?.data?.order || 0,    icon: <MdOutlineShoppingBag className='w-5 h-5' />, href: null, color: 'text-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-950', bar: 'bg-violet-500' },
    ]

    return (
        <div className='grid lg:grid-cols-4 sm:grid-cols-2 gap-4'>
            {stats.map((s, i) => {
                const card = (
                    <div key={i} className='relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-150 p-5 flex items-center justify-between'>
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.bar}`} />
                        <div>
                            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>{s.label}</p>
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg} ${s.color}`}>
                            {s.icon}
                        </div>
                    </div>
                )
                return s.href ? <Link key={i} href={s.href}>{card}</Link> : <div key={i}>{card}</div>
            })}
        </div>
    )
}

export default CountOverview