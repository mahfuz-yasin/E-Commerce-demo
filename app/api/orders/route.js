import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"

import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams

        // Extract query parameters 
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)
        const filters = JSON.parse(searchParams.get('filters') || "[]")
        const globalFilter = searchParams.get('globalFilter') || ""
        const sorting = JSON.parse(searchParams.get('sorting') || "[]")
        const deleteType = searchParams.get('deleteType')

        // Extra filter params
        const statusFilter   = searchParams.get('status')   || ''
        const paymentFilter  = searchParams.get('payment')  || ''
        const sourceFilter   = searchParams.get('source')   || ''
        const dateFrom       = searchParams.get('dateFrom') || ''
        const dateTo         = searchParams.get('dateTo')   || ''

        // Build match query  
        let matchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
        }

        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'incomplete') {
                matchQuery.status = { $in: ['pending', 'processing', 'unverified'] }
            } else {
                matchQuery.status = statusFilter
            }
        }

        // Payment filter
        if (paymentFilter && paymentFilter !== 'all') {
            if (paymentFilter === 'paid') {
                matchQuery.paymentMethod = { $ne: 'COD' }
            } else if (paymentFilter === 'unpaid') {
                matchQuery.paymentMethod = 'COD'
            }
        }

        // Source filter (ad platform)
        if (sourceFilter && sourceFilter !== 'all') {
            matchQuery['adSource.platform'] = sourceFilter
        }

        // Date range filter
        if (dateFrom || dateTo) {
            matchQuery.createdAt = {}
            if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom)
            if (dateTo) {
                const end = new Date(dateTo); end.setHours(23, 59, 59, 999)
                matchQuery.createdAt.$lte = end
            }
        }

        // Global search 
        if (globalFilter) {
            matchQuery["$or"] = [
                { order_id: { $regex: globalFilter, $options: 'i' } },
                { payment_id: { $regex: globalFilter, $options: 'i' } },
                { name: { $regex: globalFilter, $options: 'i' } },
                { email: { $regex: globalFilter, $options: 'i' } },
                { phone: { $regex: globalFilter, $options: 'i' } },
                { country: { $regex: globalFilter, $options: 'i' } },
                { state: { $regex: globalFilter, $options: 'i' } },
                { city: { $regex: globalFilter, $options: 'i' } },
                { pincode: { $regex: globalFilter, $options: 'i' } },
                { discount: { $regex: globalFilter, $options: 'i' } },
                { couponDiscount: { $regex: globalFilter, $options: 'i' } },
                { totalAmount: { $regex: globalFilter, $options: 'i' } },
                { status: { $regex: globalFilter, $options: 'i' } },
            ]
        }

        //  Column filteration  

        filters.forEach(filter => {
            matchQuery[filter.id] = { $regex: filter.value, $options: 'i' }
        });

        //   Sorting  
        let sortQuery = {}
        sorting.forEach(sort => {
            sortQuery[sort.id] = sort.desc ? -1 : 1
        });


        // Aggregate pipeline  

        const aggregatePipeline = [
            { $match: matchQuery },
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size },
        ]

        // Execute query  

        const getOrders = await OrderModel.aggregate(aggregatePipeline)

        // Get totalRowCount  
        const totalRowCount = await OrderModel.countDocuments(matchQuery)

        return NextResponse.json({
            success: true,
            data: getOrders,
            meta: { totalRowCount }
        })

    } catch (error) {
        return catchError(error)
    }
}