import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import LeadModel from "@/models/Lead.model"

export async function PUT(request, { params }) {
    try {
        await connectDB()

        const { id } = await params
        const payload = await request.json()

        const lead = await LeadModel.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        )

        if (!lead) {
            return response(false, 404, 'Lead not found')
        }

        return response(true, 200, 'Lead updated successfully.', lead)

    } catch (error) {
        return catchError(error)
    }
}
