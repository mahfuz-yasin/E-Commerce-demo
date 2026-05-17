import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import DynamicProductAdsModel from "@/models/DynamicProductAds.model"

// GET all DPA rules
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const campaignId = searchParams.get('campaignId')
        const ruleType = searchParams.get('ruleType')
        
        let query = {}
        if (campaignId) {
            query._id = campaignId
        }
        
        const campaigns = await DynamicProductAdsModel.find(query)
            .select('crossSellRules upSellRules priceDropEnabled backInStockEnabled priceDropThreshold')
            .lean()
        
        const rules = []
        campaigns.forEach(campaign => {
            if (campaign.crossSellEnabled && campaign.crossSellRules) {
                campaign.crossSellRules.forEach(rule => {
                    rules.push({
                        campaignId: campaign._id,
                        type: 'cross-sell',
                        ...rule
                    })
                })
            }
            if (campaign.upSellEnabled && campaign.upSellRules) {
                campaign.upSellRules.forEach(rule => {
                    rules.push({
                        campaignId: campaign._id,
                        type: 'up-sell',
                        ...rule
                    })
                })
            }
            if (campaign.priceDropEnabled) {
                rules.push({
                    campaignId: campaign._id,
                    type: 'price-drop',
                    threshold: campaign.priceDropThreshold,
                    message: campaign.priceDropMessage
                })
            }
            if (campaign.backInStockEnabled) {
                rules.push({
                    campaignId: campaign._id,
                    type: 'back-in-stock',
                    message: campaign.backInStockMessage
                })
            }
        })
        
        if (ruleType) {
            return response(true, 200, 'Rules fetched successfully', rules.filter(r => r.type === ruleType))
        }
        
        return response(true, 200, 'Rules fetched successfully', rules)
    } catch (error) {
        return catchError(error)
    }
}

// POST create/update DPA rule
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const { campaignId, ruleType, ruleData } = payload
        
        if (!campaignId || !ruleType) {
            return response(false, 400, 'Campaign ID and rule type are required')
        }
        
        const campaign = await DynamicProductAdsModel.findById(campaignId)
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        switch (ruleType) {
            case 'cross-sell':
                campaign.crossSellEnabled = true
                campaign.crossSellRules = ruleData
                break
            case 'up-sell':
                campaign.upSellEnabled = true
                campaign.upSellRules = ruleData
                break
            case 'price-drop':
                campaign.priceDropEnabled = true
                campaign.priceDropThreshold = ruleData.threshold || 10
                campaign.priceDropMessage = ruleData.message || 'Price dropped by {percentage}%!'
                break
            case 'back-in-stock':
                campaign.backInStockEnabled = true
                campaign.backInStockMessage = ruleData.message || 'Back in stock!'
                break
            default:
                return response(false, 400, 'Invalid rule type')
        }
        
        campaign.updatedBy = auth.user?.id || 'system'
        await campaign.save()
        
        return response(true, 200, 'Rule updated successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}
