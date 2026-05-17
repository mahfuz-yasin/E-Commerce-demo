import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AutoResponseModel from "@/models/AutoResponse.model"

// GET single auto response
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const response = await AutoResponseModel.findById(params.id).lean()
        
        if (!response) {
            return response(false, 404, 'Response not found')
        }
        
        return response(true, 200, 'Response fetched successfully', response)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update auto response
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const response = await AutoResponseModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!response) {
            return response(false, 404, 'Response not found')
        }
        
        return response(true, 200, 'Response updated successfully', response)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE auto response
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        await AutoResponseModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Response deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
