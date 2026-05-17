import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AbandonedCartRecoveryModel from "@/models/AbandonedCartRecovery.model"

// GET single abandoned cart recovery campaign
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const campaign = await AbandonedCartRecoveryModel.findById(params.id).lean()
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        return response(true, 200, 'Campaign fetched successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update abandoned cart recovery campaign
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const campaign = await AbandonedCartRecoveryModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        return response(true, 200, 'Campaign updated successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE abandoned cart recovery campaign
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        await AbandonedCartRecoveryModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Campaign deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
