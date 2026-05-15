import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import LeadModel from "@/models/Lead.model"

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const dateRange = searchParams.get('dateRange')

        let query = { deletedAt: null }

        if (status && status !== 'all') {
            query.status = status
        }

        if (dateRange && dateRange !== 'all') {
            const now = new Date()
            const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
            const cutoff = new Date(now - days * 24 * 60 * 60 * 1000)
            query.createdAt = { $gte: cutoff }
        }

        const leads = await LeadModel.find(query).sort({ createdAt: -1 })

        return response(true, 200, 'Leads retrieved successfully.', leads)

    } catch (error) {
        return catchError(error)
    }
}
