import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import DownBannerModel from "@/models/DownBanner.model"
import { NextResponse } from "next/server"

// GET all down banners (admin)
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

        const banners = await DownBannerModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Down banners fetched successfully', banners)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new down banner (admin)
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const banner = await DownBannerModel.create(payload)

        return response(true, 201, 'Down banner created successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// PUT soft delete/restore down banners (admin)
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
            await DownBannerModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: new Date() }
            )
            return response(true, 200, 'Down banners moved to trash successfully')
        } else if (deleteType === 'RSD') {
            // Restore from trash
            await DownBannerModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: null }
            )
            return response(true, 200, 'Down banners restored successfully')
        } else {
            return response(false, 400, 'Invalid delete type')
        }
    } catch (error) {
        return catchError(error)
    }
}

// DELETE permanent delete down banners (admin)
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

        await DownBannerModel.deleteMany({ _id: { $in: ids } })

        return response(true, 200, 'Down banners deleted permanently')
    } catch (error) {
        return catchError(error)
    }
}
