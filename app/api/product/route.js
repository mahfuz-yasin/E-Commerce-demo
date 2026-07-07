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

        // Build match query  
        let matchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
        }

        // Category filter — applied after lookup (requires ObjectId)
        if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
            matchQuery['categoryData._id'] = new mongoose.Types.ObjectId(categoryFilter)
        }

        // Global search 
        if (globalFilter) {
            matchQuery["$or"] = [
                { name: { $regex: globalFilter, $options: 'i' } },
                { slug: { $regex: globalFilter, $options: 'i' } },
                { "categoryData.name": { $regex: globalFilter, $options: 'i' } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$mrp" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$sellingPrice" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$discountPercentage" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
            ]
        }

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


        // Aggregate pipeline  

        const aggregatePipeline = [
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
            if (stockFilter === 'outofstock') {
                matchQuery.totalStock = 0
            } else if (stockFilter === 'low') {
                matchQuery.totalStock = { $gt: 0, $lte: 5 }
            } else if (stockFilter === 'instock') {
                matchQuery.totalStock = { $gt: 5 }
            }
        }

        aggregatePipeline.push(
            { $match: matchQuery },
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

        // Count: if stock filter active, must use aggregate count too
        let totalRowCount
        if (stockFilter && stockFilter !== 'all') {
            const countPipeline = [
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryData'
                    }
                },
                { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'productvariants',
                        localField: '_id',
                        foreignField: 'product',
                        as: 'variants'
                    }
                },
                { $addFields: { totalStock: { $sum: '$variants.stock' } } },
                { $match: matchQuery },
                { $count: 'total' }
            ]
            const countResult = await ProductModel.aggregate(countPipeline)
            totalRowCount = countResult[0]?.total ?? 0
        } else {
            totalRowCount = await ProductModel.countDocuments(matchQuery)
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