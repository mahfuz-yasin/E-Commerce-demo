import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AttributionModelModel from "@/models/AttributionModel.model"

// GET single attribution model
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const model = await AttributionModelModel.findById(params.id).lean()
        
        if (!model) {
            return response(false, 404, 'Model not found')
        }
        
        return response(true, 200, 'Model fetched successfully', model)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update attribution model
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // If setting as default, remove default from other models for this account
        if (payload.isDefault) {
            const existingModel = await AttributionModelModel.findById(params.id)
            if (existingModel) {
                await AttributionModelModel.updateMany(
                    { adAccountId: existingModel.adAccountId, isDefault: true, _id: { $ne: params.id } },
                    { isDefault: false }
                )
            }
        }
        
        const model = await AttributionModelModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!model) {
            return response(false, 404, 'Model not found')
        }
        
        return response(true, 200, 'Model updated successfully', model)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE attribution model
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const model = await AttributionModelModel.findById(params.id)
        
        if (!model) {
            return response(false, 404, 'Model not found')
        }
        
        if (model.isDefault) {
            return response(false, 400, 'Cannot delete default attribution model')
        }
        
        await AttributionModelModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Model deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
