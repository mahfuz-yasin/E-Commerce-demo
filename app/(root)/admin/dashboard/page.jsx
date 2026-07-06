'use client'
import React, { Suspense } from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrderOverview } from './OrderOverview'
import { OrderStatus } from './OrderStatus'
import LatestOrder from './LatestOrder'
import LatestReview from './LatestReview'
import { ADMIN_ORDER_SHOW, ADMIN_REVIEW_SHOW } from '@/routes/AdminPanelRoute'
import SmartMetrics from './SmartMetrics'

const AdminDashboard = () => {
    return (
        <div className='pt-5'>
            <Suspense fallback={<div>Loading...</div>}>
                <CountOverview />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <QuickAdd />
            </Suspense>

            <SmartMetrics />

            <div className='mt-10 flex lg:flex-nowrap flex-wrap gap-10'>
                <Card className="rounded-lg lg:w-[70%] w-full p-0">
                    <CardHeader className="py-3 border [.border-b]:pb-3">
                        <div className='flex justify-between items-center'>
                            <span className='font-semibold'>Order Overview</span>
                            <Button type="button" >
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Suspense fallback={<div>Loading...</div>}>
                            <OrderOverview />
                        </Suspense>
                    </CardContent>

                </Card>
                <Card className="rounded-lg lg:w-[30%] w-full p-0">
                    <CardHeader className="py-3 border [.border-b]:pb-3">
                        <div className='flex justify-between items-center'>
                            <span className='font-semibold'>Orders Status </span>
                            <Button type="button" >
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div>Loading...</div>}>
                            <OrderStatus />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
            <div className='mt-10 flex lg:flex-nowrap flex-wrap gap-10'>
                <Card className="rounded-lg lg:w-[70%] w-full p-0 block">
                    <CardHeader className="py-3 border [.border-b]:pb-3">
                        <div className='flex justify-between items-center'>
                            <span className='font-semibold'>Latest Order</span>
                            <Button type="button" >
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className='pt-3 lg:h-[350px] overflow-auto'>
                        <Suspense fallback={<div>Loading...</div>}>
                            <LatestOrder />
                        </Suspense>
                    </CardContent>

                </Card>
                <Card className="rounded-lg lg:w-[30%] w-full p-0 block">
                    <CardHeader className="py-3 border [.border-b]:pb-3">
                        <div className='flex justify-between items-center'>
                            <span className='font-semibold'>Latest Review </span>
                            <Button type="button" >
                                <Link href={ADMIN_REVIEW_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='pt-3 px-1 lg:h-[350px] overflow-auto'>
                        <Suspense fallback={<div>Loading...</div>}>
                            <LatestReview />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default AdminDashboard