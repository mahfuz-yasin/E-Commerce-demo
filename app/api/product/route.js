import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

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
        const categoryFilter = searchParams.get('category') || ''
        const stockFilter    = searchParams.get('stock')    || ''
        const statusFilter   = searchParams.get('status')   || ''
        const searchFilter   = searchParams.get('search')   || ''

        // Build match query  
        let matchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
        }

        // Status filter
        if (statusFilter === 'active')   matchQuery.isActive = true
        if (statusFilter === 'inactive') matchQuery.isActive = false

        // Search filter (name or sku)
        if (searchFilter) {
            matchQuery['$or'] = [
                { name: { $regex: searchFilter, $options: 'i' } },
                { sku:  { $regex: searchFilter, $options: 'i' } },
            ]
        }

        // Global search handled post-lookup (to allow categoryData.name filtering)
        const hasGlobalFilter = !!(globalFilter && !searchFilter)

        //  Column filteration  

        filters.forEach(filter => {
            if (filter.id === 'mrp' || filter.id === 'sellingPrice' || filter.id === 'discountPercentage') {
                matchQuery[filter.id] = Number(filter.value)
            } else {
                matchQuery[filter.id] = { $regex: filter.value, $options: 'i' }
            }
        });

        //   Sorting  
        let sortQuery = {}
        sorting.forEach(sort => {
            sortQuery[sort.id] = sort.desc ? -1 : 1
        });


        // Aggregate pipeline — matchQuery (without category) runs first
        const preLookupMatch = { ...matchQuery }
        // Category filter needs post-lookup match
        const postLookupMatch = {}
        if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
            postLookupMatch['categoryData._id'] = new mongoose.Types.ObjectId(categoryFilter)
        }

        const aggregatePipeline = [
            { $match: preLookupMatch },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $unwind: {
                    path: "$categoryData", preserveNullAndEmptyArrays: true
                }
            },
        ]

        if (Object.keys(postLookupMatch).length > 0) {
            aggregatePipeline.push({ $match: postLookupMatch })
        }

        // Global filter — applied post-lookup so categoryData.name is available
        if (hasGlobalFilter) {
            aggregatePipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: globalFilter, $options: 'i' } },
                        { slug: { $regex: globalFilter, $options: 'i' } },
                        { 'categoryData.name': { $regex: globalFilter, $options: 'i' } },
                        { $expr: { $regexMatch: { input: { $toString: '$mrp' }, regex: globalFilter, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $toString: '$sellingPrice' }, regex: globalFilter, options: 'i' } } },
                    ]
                }
            })
        }

        // Stock filter: join variants to compute total stock per product
        if (stockFilter && stockFilter !== 'all') {
            aggregatePipeline.push(
                {
                    $lookup: {
                        from: 'productvariants',
                        localField: '_id',
                        foreignField: 'product',
                        as: 'variants'
                    }
                },
                {
                    $addFields: {
                        totalStock: { $sum: '$variants.stock' }
                    }
                }
            )
            let stockMatchVal
            if (stockFilter === 'outofstock') stockMatchVal = 0
            else if (stockFilter === 'low')   stockMatchVal = { $gt: 0, $lte: 5 }
            else if (stockFilter === 'instock') stockMatchVal = { $gt: 5 }
            if (stockMatchVal !== undefined) {
                aggregatePipeline.push({ $match: { totalStock: stockMatchVal } })
            }
        }

        aggregatePipeline.push(
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    mrp: 1,
                    sellingPrice: 1,
                    discountPercentage: 1,
                    isActive: 1,
                    sku: 1,
                    category: "$categoryData.name",
                    totalStock: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    deletedAt: 1
                }
            }
        )

        // Execute query  

        const getProduct = await ProductModel.aggregate(aggregatePipeline)

        // Count
        let totalRowCount
        const needsAggrCount = (stockFilter && stockFilter !== 'all') || Object.keys(postLookupMatch).length > 0
        if (needsAggrCount) {
            const countPipeline = [
                { $match: preLookupMatch },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryData'
                    }
                },
                { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
            ]
            if (Object.keys(postLookupMatch).length > 0) {
                countPipeline.push({ $match: postLookupMatch })
            }
            if (stockFilter && stockFilter !== 'all') {
                countPipeline.push(
                    { $lookup: { from: 'productvariants', localField: '_id', foreignField: 'product', as: 'variants' } },
                    { $addFields: { totalStock: { $sum: '$variants.stock' } } },
                    { $match: { totalStock: stockFilter === 'outofstock' ? 0 : stockFilter === 'low' ? { $gt: 0, $lte: 5 } : { $gt: 5 } } }
                )
            }
            countPipeline.push({ $count: 'total' })
            const countResult = await ProductModel.aggregate(countPipeline)
            totalRowCount = countResult[0]?.total ?? 0
        } else {
            totalRowCount = await ProductModel.countDocuments(preLookupMatch)
        }

        return NextResponse.json({
            success: true,
            data: getProduct,
            meta: { totalRowCount }
        })

    } catch (error) {
        return catchError(error)
    }
}