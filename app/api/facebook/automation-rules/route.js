import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import AdAutomationRuleModel from "@/models/AdAutomationRule.model"

export async function GET(request) {
    try {
        await connectDB()

        const rules = await AdAutomationRuleModel.find().sort({ createdAt: -1 })

        return response(true, 200, 'Automation rules retrieved successfully', rules)
    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const body = await request.json()
        const { name, conditions, actions, applyToAll, targetCampaigns, applyToAdSets } = body

        if (!name || !conditions || !actions) {
            return response(false, 400, 'Name, conditions, and actions are required')
        }

        const rule = await AdAutomationRuleModel.create({
            name,
            conditions,
            actions,
            applyToAll: applyToAll !== false,
            targetCampaigns: targetCampaigns || [],
            applyToAdSets: applyToAdSets || false,
            status: 'active'
        })

        return response(true, 201, 'Automation rule created successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}
