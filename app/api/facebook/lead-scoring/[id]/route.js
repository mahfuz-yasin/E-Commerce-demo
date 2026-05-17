import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import LeadScoringRuleModel from "@/models/LeadScoringRule.model"

// GET single lead scoring rule
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await LeadScoringRuleModel.findById(params.id).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        return response(true, 200, 'Rule fetched successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update lead scoring rule
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const rule = await LeadScoringRuleModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        return response(true, 200, 'Rule updated successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE lead scoring rule
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        await LeadScoringRuleModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Rule deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
