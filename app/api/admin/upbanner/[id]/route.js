import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import UpBannerModel from "@/models/UpBanner.model"

// GET single up banner (admin)
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const banner = await UpBannerModel.findById(params.id).lean()

        if (!banner) {
            return response(false, 404, 'Up banner not found')
        }

        return response(true, 200, 'Up banner fetched successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update up banner (admin)
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const banner = await UpBannerModel.findByIdAndUpdate(
            params.id,
            payload,
            { new: true, runValidators: true }
        ).lean()

        if (!banner) {
            return response(false, 404, 'Up banner not found')
        }

        return response(true, 200, 'Up banner updated successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE up banner (admin)
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const banner = await UpBannerModel.findByIdAndDelete(params.id).lean()

        if (!banner) {
            return response(false, 404, 'Up banner not found')
        }

        return response(true, 200, 'Up banner deleted successfully', banner)
    } catch (error) {
        return catchError(error)
    }
}
