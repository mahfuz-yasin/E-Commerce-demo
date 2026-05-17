import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import DownBannerModel from "@/models/DownBanner.model"

// GET single down banner (admin)
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const banner = await DownBannerModel.findById(params.id).lean()

        if (!banner) {
            return response(false, 404, 'Down banner not found')
        }

        return response(true, 200, 'Down banner fetched successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update down banner (admin)
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const banner = await DownBannerModel.findByIdAndUpdate(
            params.id,
            payload,
            { new: true, runValidators: true }
        ).lean()

        if (!banner) {
            return response(false, 404, 'Down banner not found')
        }

        return response(true, 200, 'Down banner updated successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE down banner (admin)
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const banner = await DownBannerModel.findByIdAndDelete(params.id).lean()

        if (!banner) {
            return response(false, 404, 'Down banner not found')
        }

        return response(true, 200, 'Down banner deleted successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}
