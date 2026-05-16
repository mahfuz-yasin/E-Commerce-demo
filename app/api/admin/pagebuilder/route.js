import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { NextResponse } from "next/server";
import PageBuilderModel from "@/models/PageBuilder.model";

// GET all pages (admin)
export async function GET(request) {
    try {
        console.log('Page Builder GET request received')
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            console.log('Page Builder GET: Unauthorized')
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const pageType = searchParams.get('pageType')
        
        console.log('Page Builder GET: pageType =', pageType)
        
        // Extract query parameters for pagination, filtering, and sorting
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)
        
        let filters = []
        let sorting = []
        try {
            filters = JSON.parse(searchParams.get('filters') || "[]")
            sorting = JSON.parse(searchParams.get('sorting') || "[]")
        } catch (parseError) {
            console.error('Page Builder GET: Error parsing filters/sorting:', parseError)
            filters = []
            sorting = []
        }
        
        const globalFilter = searchParams.get('globalFilter') || ""
        const deleteType = searchParams.get('deleteType')

        console.log('Page Builder GET: Query params - start:', start, 'size:', size, 'pageType:', pageType)

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

        console.log('Page Builder GET: matchQuery =', JSON.stringify(matchQuery))

        // Aggregate pipeline
        const aggregatePipeline = [
            { $match: matchQuery },
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size }
        ]

        console.log('Page Builder GET: Executing aggregate pipeline')
        const pages = await PageBuilderModel.aggregate(aggregatePipeline)
        console.log('Page Builder GET: Found', pages.length, 'pages')

        // Get total row count
        console.log('Page Builder GET: Counting total documents')
        const totalRowCount = await PageBuilderModel.countDocuments(matchQuery)
        console.log('Page Builder GET: Total row count =', totalRowCount)

        return NextResponse.json({
            success: true,
            data: pages,
            meta: { totalRowCount }
        })
    } catch (error) {
        console.error('Page Builder GET error:', error)
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
