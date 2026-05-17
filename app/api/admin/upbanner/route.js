import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import UpBannerModel from "@/models/UpBanner.model"
import { NextResponse } from "next/server"

// GET all up banners (admin)
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const deleteType = searchParams.get('deleteType')

        let query = {}

        if (deleteType === 'SD') {
            query = { deletedAt: null }
        } else if (deleteType === 'PD') {
            query = { deletedAt: { $ne: null } }
        }

        const banners = await UpBannerModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Up banners fetched successfully', banners)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new up banner (admin)
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const banner = await UpBannerModel.create(payload)

        return response(true, 201, 'Up banner created successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// PUT soft delete/restore up banners (admin)
export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        const { ids, deleteType } = payload

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or missing IDs')
        }

        if (deleteType === 'SD') {
            // Soft delete - move to trash
            await UpBannerModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: new Date() }
            )
            return response(true, 200, 'Up banners moved to trash successfully')
        } else if (deleteType === 'RSD') {
            // Restore from trash
            await UpBannerModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: null }
            )
            return response(true, 200, 'Up banners restored successfully')
        } else {
            return response(false, 400, 'Invalid delete type')
        }
    } catch (error) {
        return catchError(error)
    }
}

// DELETE permanent delete up banners (admin)
export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        const { ids } = payload

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or missing IDs')
        }

        await UpBannerModel.deleteMany({ _id: { $in: ids } })

        return response(true, 200, 'Up banners deleted permanently')
    } catch (error) {
        return catchError(error)
    }
}
