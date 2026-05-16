import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { NextResponse } from "next/server";
import PageBuilderModel from "@/models/PageBuilder.model";

// GET all pages (admin)
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const pageType = searchParams.get('pageType')
        
        // Extract query parameters for pagination, filtering, and sorting
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)
        const filters = JSON.parse(searchParams.get('filters') || "[]")
        const globalFilter = searchParams.get('globalFilter') || ""
        const sorting = JSON.parse(searchParams.get('sorting') || "[]")
        const deleteType = searchParams.get('deleteType')

        // Build match query
        let matchQuery = {}
        
        if (pageType) {
            matchQuery.pageType = pageType
        }

        // Handle deleteType filtering
        if (deleteType === 'SD') {
            matchQuery.deletedAt = null
        } else if (deleteType === 'PD') {
            matchQuery.deletedAt = { $ne: null }
        }

        // Global search
        if (globalFilter) {
            matchQuery["$or"] = [
                { title: { $regex: globalFilter, $options: 'i' } },
                { slug: { $regex: globalFilter, $options: 'i' } },
            ]
        }

        // Column filtering
        filters.forEach(filter => {
            matchQuery[filter.id] = { $regex: filter.value, $options: 'i' }
        })

        // Sorting
        let sortQuery = {}
        sorting.forEach(sort => {
            sortQuery[sort.id] = sort.desc ? -1 : 1
        })

        // Aggregate pipeline
        const aggregatePipeline = [
            { $match: matchQuery },
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size }
        ]

        const pages = await PageBuilderModel.aggregate(aggregatePipeline)

        // Get total row count
        const totalRowCount = await PageBuilderModel.countDocuments(matchQuery)

        return NextResponse.json({
            success: true,
            data: pages,
            meta: { totalRowCount }
        })
    } catch (error) {
        return catchError(error)
    }
}

// POST create new page (admin)
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        console.log('Page Builder POST payload:', JSON.stringify(payload, null, 2))

        // Ensure styles object has all required fields with defaults
        const styles = {
            animation: payload.styles?.animation || 'none',
            animationDuration: payload.styles?.animationDuration || '0.3s',
            primaryColor: payload.styles?.primaryColor || '#3b82f6',
            secondaryColor: payload.styles?.secondaryColor || '#10b981',
            shadow: payload.styles?.shadow || 'none',
            borderRadius: payload.styles?.borderRadius || '0px',
            fontFamily: payload.styles?.fontFamily || 'default'
        }

        const pageData = {
            ...payload,
            styles
        }

        const page = await PageBuilderModel.create(pageData)

        return response(true, 201, 'Page created successfully', page)
    } catch (error) {
        console.error('Page Builder POST error:', error)
        return catchError(error)
    }
}
