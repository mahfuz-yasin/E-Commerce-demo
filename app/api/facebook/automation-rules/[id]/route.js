import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import AdAutomationRuleModel from "@/models/AdAutomationRule.model"

export async function PUT(request, { params }) {
    try {
        await connectDB()

        const { id } = params
        const body = await request.json()

        const rule = await AdAutomationRuleModel.findByIdAndUpdate(
            id,
            body,
            { new: true }
        )

        if (!rule) {
            return response(false, 404, 'Automation rule not found')
        }

        return response(true, 200, 'Automation rule updated successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB()

        const { id } = params

        const rule = await AdAutomationRuleModel.findByIdAndDelete(id)

        if (!rule) {
            return response(false, 404, 'Automation rule not found')
        }

        return response(true, 200, 'Automation rule deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
