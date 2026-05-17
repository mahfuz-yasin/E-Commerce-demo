import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import BudgetOptimizationRuleModel from "@/models/BudgetOptimizationRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET single budget rule
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await BudgetOptimizationRuleModel.findById(params.id).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        return response(true, 200, 'Rule fetched successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update budget rule
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const rule = await BudgetOptimizationRuleModel.findByIdAndUpdate(
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

// DELETE budget rule
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await BudgetOptimizationRuleModel.findById(params.id).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        await BudgetOptimizationRuleModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Rule deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
