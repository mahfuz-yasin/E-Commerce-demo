import { connectDB } from '@/lib/databaseConnection'
import FacebookConfigModel from '@/models/FacebookConfig.model'
import AdAutomationRuleModel from '@/models/AdAutomationRule.model'
import { getCampaigns, getAdSets, getInsights, updateCampaignStatus, updateCampaignBudget } from '@/lib/metaMarketingAPI'

/**
 * Evaluate a single rule condition against insights data
 * @param {object} condition - Rule condition
 * @param {object} insights - Facebook Ads insights data
 * @returns {boolean} True if condition is met
 */
function evaluateCondition(condition, insights) {
    const { type, operator, value } = condition
    let metricValue

    switch (type) {
        case 'spend':
            metricValue = parseFloat(insights.spend || 0)
            break
        case 'roas':
            metricValue = parseFloat(insights.purchase_roas || 0)
            break
        case 'purchases':
            metricValue = parseInt(insights.conversions || 0)
            break
        case 'clicks':
            metricValue = parseInt(insights.clicks || 0)
            break
        case 'impressions':
            metricValue = parseInt(insights.impressions || 0)
            break
        case 'ctr':
            metricValue = parseFloat(insights.ctr || 0)
            break
        case 'cpc':
            metricValue = parseFloat(insights.cpc || 0)
            break
        default:
            return false
    }

    switch (operator) {
        case '>':
            return metricValue > value
        case '<':
            return metricValue < value
        case '>=':
            return metricValue >= value
        case '<=':
            return metricValue <= value
        case '==':
            return metricValue === value
        case '!=':
            return metricValue !== value
        default:
            return false
    }
}

/**
 * Evaluate all conditions for a rule (AND logic)
 * @param {array} conditions - Rule conditions
 * @param {object} insights - Facebook Ads insights data
 * @returns {boolean} True if all conditions are met
 */
function evaluateAllConditions(conditions, insights) {
    return conditions.every(condition => evaluateCondition(condition, insights))
}

/**
 * Execute rule actions
 * @param {object} rule - Automation rule
 * @param {string} targetId - Campaign or ad set ID
 * @param {object} insights - Current insights data
 */
async function executeActions(rule, targetId, insights) {
    for (const action of rule.actions) {
        try {
            switch (action.type) {
                case 'pause_campaign':
                    await updateCampaignStatus(targetId, 'PAUSED')
                    console.log(`Paused campaign ${targetId} based on rule "${rule.name}"`)
                    break
                case 'pause_adset':
                    // Note: This would require a separate function for ad sets
                    console.log(`Would pause ad set ${targetId} based on rule "${rule.name}"`)
                    break
                case 'increase_budget':
                    const currentBudget = parseFloat(insights.daily_budget || 0)
                    const newBudget = currentBudget * (1 + action.budgetPercentage / 100)
                    await updateCampaignBudget(targetId, { daily_budget: newBudget })
                    console.log(`Increased budget for ${targetId} from ${currentBudget} to ${newBudget} based on rule "${rule.name}"`)
                    break
                case 'decrease_budget':
                    const currentBudgetDec = parseFloat(insights.daily_budget || 0)
                    const newBudgetDec = currentBudgetDec * (1 - action.budgetPercentage / 100)
                    await updateCampaignBudget(targetId, { daily_budget: newBudgetDec })
                    console.log(`Decreased budget for ${targetId} from ${currentBudgetDec} to ${newBudgetDec} based on rule "${rule.name}"`)
                    break
                case 'send_alert':
                    console.log(`ALERT: Rule "${rule.name}" triggered for ${targetId}. ${action.alertMessage || 'No message'}`)
                    // TODO: Implement email/Slack alert
                    break
            }
        } catch (error) {
            console.error(`Error executing action ${action.type} for ${targetId}:`, error)
        }
    }
}

/**
 * Main automation rules engine
 */
async function runAutomationRules() {
    try {
        console.log('Starting Facebook Ads Automation Rules Engine...')
        await connectDB()

        const config = await FacebookConfigModel.getConfig()

        if (!config.adCampaignManagerEnabled || !config.adRulesEnabled) {
            console.log('Ad Campaign Manager or Rules Engine is disabled. Skipping.')
            return
        }

        const rules = await AdAutomationRuleModel.find({ status: 'active' })

        if (rules.length === 0) {
            console.log('No active automation rules found.')
            return
        }

        console.log(`Processing ${rules.length} automation rules...`)

        // Get all active campaigns
        const campaignsData = await getCampaigns({ effective_status: 'ACTIVE', limit: 100 })
        const campaigns = campaignsData.data || []

        console.log(`Found ${campaigns.length} active campaigns to check`)

        for (const campaign of campaigns) {
            const campaignId = campaign.id

            for (const rule of rules) {
                // Check if rule applies to this campaign
                if (!rule.applyToAll && rule.targetCampaigns.length > 0) {
                    if (!rule.targetCampaigns.includes(campaignId)) {
                        continue
                    }
                }

                // Get insights for the campaign
                const timeRange = rule.conditions[0]?.timeRange || '24h'
                const insights = await getInsights(campaignId, { date_preset: timeRange })

                if (!insights.data || insights.data.length === 0) {
                    console.log(`No insights data for campaign ${campaignId}`)
                    continue
                }

                const latestInsights = insights.data[0]

                // Evaluate all conditions
                if (evaluateAllConditions(rule.conditions, latestInsights)) {
                    console.log(`Rule "${rule.name}" triggered for campaign ${campaignId}`)
                    await executeActions(rule, campaignId, latestInsights)

                    // Update rule execution metadata
                    await AdAutomationRuleModel.findByIdAndUpdate(rule._id, {
                        lastExecuted: new Date(),
                        $inc: { executionCount: 1 }
                    })
                }
            }
        }

        console.log('Facebook Ads Automation Rules Engine completed successfully')
    } catch (error) {
        console.error('Error running automation rules engine:', error)
    }
}

// Run the automation rules
runAutomationRules()
    .then(() => {
        console.log('Script completed')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Script failed:', error)
        process.exit(1)
    })
