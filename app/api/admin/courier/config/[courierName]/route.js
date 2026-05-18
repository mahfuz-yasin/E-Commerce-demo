import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CourierConfigModel from "@/models/CourierConfig.model";

/**
 * GET /api/admin/courier/config/[courierName]
 * Get specific courier configuration with full details
 */
export async function GET(request, { params }) {
    try {
        await connectDB()
        const { courierName } = await params

        const config = await CourierConfigModel.findOne({ 
            courierName,
            deletedAt: null 
        }).lean()

        if (!config) {
            return response(false, 404, 'Courier configuration not found.')
        }

        return response(true, 200, 'Courier configuration retrieved.', config)

    } catch (error) {
        console.error('[API Courier Config Detail GET] Error:', error)
        return catchError(error, 'Failed to retrieve courier configuration')
    }
}

/**
 * DELETE /api/admin/courier/config/[courierName]
 * Soft delete courier configuration
 */
export async function DELETE(request, { params }) {
    try {
        await connectDB()
        const { courierName } = await params

        const result = await CourierConfigModel.findOneAndUpdate(
            { courierName, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        )

        if (!result) {
            return response(false, 404, 'Courier configuration not found.')
        }

        return response(true, 200, 'Courier configuration deleted successfully.')

    } catch (error) {
        console.error('[API Courier Config DELETE] Error:', error)
        return catchError(error, 'Failed to delete courier configuration')
    }
}
