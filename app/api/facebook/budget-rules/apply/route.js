import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import BudgetOptimizationRuleModel from "@/models/BudgetOptimizationRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import DynamicProductAdsModel from "@/models/DynamicProductAds.model"

// POST apply budget optimization rule
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const { ruleId } = await request.json()
        
        if (!ruleId) {
            return response(false, 400, 'Rule ID is required')
        }
        
        const rule = await BudgetOptimizationRuleModel.findById(ruleId)
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        if (rule.status !== 'active') {
            return response(false, 400, 'Rule is not active')
        }
        
        // Get campaigns to apply rule to
        let campaigns = []
        if (rule.campaignIds && rule.campaignIds.length > 0) {
            campaigns = await DynamicProductAdsModel.find({ 
                _id: { $in: rule.campaignIds },
                adAccountId: rule.adAccountId 
            }).lean()
        } else {
            campaigns = await DynamicProductAdsModel.find({ 
                adAccountId: rule.adAccountId,
                status: 'active' 
            }).lean()
        }
        
        if (campaigns.length === 0) {
            return response(false, 404, 'No campaigns found to apply rule')
        }
        
        // Apply rule to each campaign
        const results = []
        let totalIncreased = 0
        let totalDecreased = 0
        
        for (const campaign of campaigns) {
            try {
                let newBudget = campaign.budget?.daily || 0
                let action = null
                let reason = ''
                
                switch (rule.ruleType) {
                    case 'roas_based':
                        const roas = campaign.performance?.roas || 0
                        if (roas < rule.roasTarget) {
                            // Decrease budget
                            const decreaseAmount = (newBudget * rule.roasDecreasePercentage) / 100
                            newBudget = Math.max(rule.minimumBudget || 0, newBudget - decreaseAmount)
                            action = 'decrease'
                            reason = `ROAS (${roas.toFixed(2)}) below target (${rule.roasTarget})`
                            totalDecreased += decreaseAmount
                        } else if (roas > rule.roasTarget * 1.2) {
                            // Increase budget
                            const increaseAmount = (newBudget * rule.roasIncreasePercentage) / 100
                            newBudget = Math.min(rule.maximumBudget || Infinity, newBudget + increaseAmount)
                            action = 'increase'
                            reason = `ROAS (${roas.toFixed(2)}) above target (${rule.roasTarget})`
                            totalIncreased += increaseAmount
                        }
                        break
                        
                    case 'cpa_based':
                        const cpa = campaign.performance?.cpa || 0
                        if (cpa > rule.cpaTarget) {
                            const decreaseAmount = (newBudget * rule.cpaDecreasePercentage) / 100
                            newBudget = Math.max(rule.minimumBudget || 0, newBudget - decreaseAmount)
                            action = 'decrease'
                            reason = `CPA (${cpa.toFixed(2)}) above target (${rule.cpaTarget})`
                            totalDecreased += decreaseAmount
                        } else if (cpa < rule.cpaTarget * 0.8) {
                            const increaseAmount = (newBudget * rule.cpaIncreasePercentage) / 100
                            newBudget = Math.min(rule.maximumBudget || Infinity, newBudget + increaseAmount)
                            action = 'increase'
                            reason = `CPA (${cpa.toFixed(2)}) below target (${rule.cpaTarget})`
                            totalIncreased += increaseAmount
                        }
                        break
                        
                    case 'performance_based':
                        const metricValue = campaign.performance?.[rule.performanceMetric] || 0
                        if (metricValue < rule.performanceThreshold) {
                            if (rule.performanceAction === 'pause_campaign') {
                                action = 'pause'
                                reason = `${rule.performanceMetric} (${metricValue}) below threshold (${rule.performanceThreshold})`
                            } else if (rule.performanceAction === 'decrease_budget') {
                                const decreaseAmount = (newBudget * rule.performancePercentage) / 100
                                newBudget = Math.max(rule.minimumBudget || 0, newBudget - decreaseAmount)
                                action = 'decrease'
                                reason = `${rule.performanceMetric} (${metricValue}) below threshold (${rule.performanceThreshold})`
                                totalDecreased += decreaseAmount
                            }
                        } else if (metricValue > rule.performanceThreshold * 1.2) {
                            if (rule.performanceAction === 'enable_campaign') {
                                action = 'enable'
                                reason = `${rule.performanceMetric} (${metricValue}) above threshold (${rule.performanceThreshold})`
                            } else if (rule.performanceAction === 'increase_budget') {
                                const increaseAmount = (newBudget * rule.performancePercentage) / 100
                                newBudget = Math.min(rule.maximumBudget || Infinity, newBudget + increaseAmount)
                                action = 'increase'
                                reason = `${rule.performanceMetric} (${metricValue}) above threshold (${rule.performanceThreshold})`
                                totalIncreased += increaseAmount
                            }
                        }
                        break
                }
                
                // Apply the change
                if (action && newBudget !== campaign.budget?.daily) {
                    // Update campaign budget
                    campaign.budget = campaign.budget || {}
                    campaign.budget.daily = newBudget
                    await DynamicProductAdsModel.findByIdAndUpdate(campaign._id, { budget: campaign.budget })
                    
                    // Sync with Facebook
                    const fbConfig = await FacebookConfigModel.getConfig()
                    if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken && campaign.campaignId) {
                        await metaMarketingAPI.updateCampaignBudget({
                            campaignId: campaign.campaignId,
                            dailyBudget: newBudget,
                            accessToken: fbConfig.adAccountAccessToken
                        })
                    }
                    
                    results.push({
                        campaignId: campaign._id,
                        campaignName: campaign.campaignName,
                        action,
                        oldBudget: campaign.budget?.daily || 0,
                        newBudget,
                        reason
                    })
                } else if (action === 'pause' || action === 'enable') {
                    // Update campaign status
                    const newStatus = action === 'pause' ? 'paused' : 'active'
                    await DynamicProductAdsModel.findByIdAndUpdate(campaign._id, { status: newStatus })
                    
                    // Sync with Facebook
                    const fbConfig = await FacebookConfigModel.getConfig()
                    if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken && campaign.campaignId) {
                        await metaMarketingAPI.updateCampaignStatus({
                            campaignId: campaign.campaignId,
                            status: newStatus,
                            accessToken: fbConfig.adAccountAccessToken
                        })
                    }
                    
                    results.push({
                        campaignId: campaign._id,
                        campaignName: campaign.campaignName,
                        action,
                        reason
                    })
                }
            } catch (error) {
                console.error(`Error applying rule to campaign ${campaign._id}:`, error)
                results.push({
                    campaignId: campaign._id,
                    campaignName: campaign.campaignName,
                    error: error.message
                })
            }
        }
        
        // Update rule execution stats
        rule.lastExecutedAt = new Date()
        rule.executionCount += 1
        rule.totalBudgetIncreased += totalIncreased
        rule.totalBudgetDecreased += totalDecreased
        await rule.save()
        
        return response(true, 200, 'Rule applied successfully', {
            results,
            summary: {
                campaignsProcessed: campaigns.length,
                campaignsModified: results.filter(r => !r.error).length,
                totalBudgetIncreased,
                totalBudgetDecreased
            }
        })
    } catch (error) {
        return catchError(error)
    }
}
