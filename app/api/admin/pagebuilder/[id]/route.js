import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import PageBuilderModel from "@/models/PageBuilder.model";

// GET single page (admin)
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const page = await PageBuilderModel.findById(params.id).lean()

        if (!page) {
            return response(false, 404, 'Page not found')
        }

        return response(true, 200, 'Page fetched successfully', page)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update page (admin)
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const page = await PageBuilderModel.findByIdAndUpdate(
            params.id,
            payload,
            { new: true, runValidators: true }
        ).lean()

        if (!page) {
            return response(false, 404, 'Page not found')
        }

        return response(true, 200, 'Page updated successfully', page)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE page (admin)
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const page = await PageBuilderModel.findByIdAndDelete(params.id).lean()

        if (!page) {
            return response(false, 404, 'Page not found')
        }

        return response(true, 200, 'Page deleted successfully', page)
    } catch (error) {
        return catchError(error)
    }
}
