import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import PerformanceMetricsModel from "@/models/PerformanceMetrics.model"

// GET single performance metrics
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const metrics = await PerformanceMetricsModel.findById(params.id).lean()
        
        if (!metrics) {
            return response(false, 404, 'Metrics not found')
        }
        
        return response(true, 200, 'Metrics fetched successfully', metrics)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE performance metrics
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        await PerformanceMetricsModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Metrics deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
