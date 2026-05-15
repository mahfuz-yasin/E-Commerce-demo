import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { getCampaigns, updateCampaignStatus, updateCampaignBudget } from "@/lib/metaMarketingAPI"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || undefined
        const limit = parseInt(searchParams.get('limit') || '50')

        const filters = {}
        if (status) {
            filters.effective_status = status.toUpperCase()
        }
        if (limit) {
            filters.limit = limit
        }

        const data = await getCampaigns(filters)

        return response(true, 200, 'Campaigns retrieved successfully', data)
    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        const body = await request.json()
        const { campaignId, action, budgetData } = body

        if (!campaignId) {
            return response(false, 400, 'Campaign ID is required')
        }

        if (!action && !budgetData) {
            return response(false, 400, 'Action or budgetData is required')
        }

        let result
        if (action === 'activate' || action === 'pause') {
            result = await updateCampaignStatus(campaignId, action.toUpperCase())
        } else if (budgetData) {
            result = await updateCampaignBudget(campaignId, budgetData)
        }

        return response(true, 200, 'Campaign updated successfully', result)
    } catch (error) {
        return catchError(error)
    }
}
