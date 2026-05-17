import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import ChatbotFlowModel from "@/models/ChatbotFlow.model"

// GET single chatbot flow
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const flow = await ChatbotFlowModel.findById(params.id).lean()
        
        if (!flow) {
            return response(false, 404, 'Flow not found')
        }
        
        return response(true, 200, 'Flow fetched successfully', flow)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update chatbot flow
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const flow = await ChatbotFlowModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!flow) {
            return response(false, 404, 'Flow not found')
        }
        
        return response(true, 200, 'Flow updated successfully', flow)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE chatbot flow
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        await ChatbotFlowModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Flow deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
