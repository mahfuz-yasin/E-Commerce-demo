import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import PerformanceMetricsModel from "@/models/PerformanceMetrics.model"
import Order from "@/models/Order.model"
import FacebookLog from "@/models/FacebookLog.model"
import User from "@/models/User.model"

// GET all performance metrics
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const adAccountId = searchParams.get('adAccountId')
        const campaignId = searchParams.get('campaignId')
        const periodType = searchParams.get('periodType')
        const periodStart = searchParams.get('periodStart')
        const periodEnd = searchParams.get('periodEnd')
        
        let query = {}
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        if (campaignId) {
            query.campaignId = campaignId
        }
        if (periodType) {
            query.periodType = periodType
        }
        if (periodStart && periodEnd) {
            query.periodStart = { $gte: new Date(periodStart) }
            query.periodEnd = { $lte: new Date(periodEnd) }
        }
        
        const metrics = await PerformanceMetricsModel.find(query)
            .sort({ periodStart: -1 })
            .lean()

        return response(true, 200, 'Performance metrics fetched successfully', metrics)
    } catch (error) {
        return catchError(error)
    }
}

// POST calculate performance metrics
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.adAccountId || !payload.periodStart || !payload.periodEnd) {
            return response(false, 400, 'Missing required fields: adAccountId, periodStart, periodEnd')
        }
        
        const start = new Date(payload.periodStart)
        const end = new Date(payload.periodEnd)
        
        // Get orders in period
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['delivered', 'completed'] }
        }).lean()
        
        // Get Facebook events in period
        const facebookEvents = await FacebookLog.find({
            timestamp: { $gte: start, $lte: end },
            eventType: { $in: ['Purchase', 'AddToCart', 'ViewContent', 'Lead'] }
        }).lean()
        
        // Calculate metrics
        const metrics = calculatePerformanceMetrics(payload, orders, facebookEvents)
        
        // Create metrics record
        const performanceMetrics = await PerformanceMetricsModel.create({
            ...payload,
            ...metrics,
            periodStart: start,
            periodEnd: end,
            calculatedAt: new Date(),
            status: 'calculated',
            createdBy: auth.user?.id || 'system'
        })
        
        // Calculate comparison with previous period
        const previousPeriodStart = new Date(start)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (end - start) / (1000 * 60 * 60 * 24))
        
        const previousMetrics = await PerformanceMetricsModel.findOne({
            adAccountId: payload.adAccountId,
            campaignId: payload.campaignId,
            periodStart: previousPeriodStart
        }).lean()
        
        if (previousMetrics) {
            performanceMetrics.previousPeriodMetrics = {
                roas: previousMetrics.roas,
                cac: previousMetrics.cac,
                ltv: previousMetrics.ltv,
                conversions: previousMetrics.conversions,
                revenue: previousMetrics.revenue
            }
            
            performanceMetrics.comparison = {
                roasChange: performanceMetrics.roas - previousMetrics.roas,
                roasChangePercent: previousMetrics.roas > 0 ? ((performanceMetrics.roas - previousMetrics.roas) / previousMetrics.roas) * 100 : 0,
                cacChange: performanceMetrics.cac - previousMetrics.cac,
                cacChangePercent: previousMetrics.cac > 0 ? ((performanceMetrics.cac - previousMetrics.cac) / previousMetrics.cac) * 100 : 0,
                ltvChange: performanceMetrics.ltv - previousMetrics.ltv,
                ltvChangePercent: previousMetrics.ltv > 0 ? ((performanceMetrics.ltv - previousMetrics.ltv) / previousMetrics.ltv) * 100 : 0
            }
            
            // Generate alerts based on comparison
            const alerts = []
            
            if (performanceMetrics.roasTarget && performanceMetrics.roas < performanceMetrics.roasTarget) {
                alerts.push({
                    type: 'roas_below_target',
                    severity: performanceMetrics.roas < performanceMetrics.roasTarget * 0.7 ? 'high' : 'medium',
                    message: `ROAS (${performanceMetrics.roas.toFixed(2)}) is below target (${performanceMetrics.roasTarget})`,
                    triggeredAt: new Date()
                })
            }
            
            if (performanceMetrics.cacTarget && performanceMetrics.cac > performanceMetrics.cacTarget) {
                alerts.push({
                    type: 'cac_above_target',
                    severity: performanceMetrics.cac > performanceMetrics.cacTarget * 1.3 ? 'high' : 'medium',
                    message: `CAC (${performanceMetrics.cac.toFixed(2)}) is above target (${performanceMetrics.cacTarget})`,
                    triggeredAt: new Date()
                })
            }
            
            if (performanceMetrics.ltvTarget && performanceMetrics.ltv < performanceMetrics.ltvTarget) {
                alerts.push({
                    type: 'ltv_below_target',
                    severity: performanceMetrics.ltv < performanceMetrics.ltvTarget * 0.8 ? 'high' : 'medium',
                    message: `LTV (${performanceMetrics.ltv.toFixed(2)}) is below target (${performanceMetrics.ltvTarget})`,
                    triggeredAt: new Date()
                })
            }
            
            if (performanceMetrics.comparison.roasChangePercent < -20) {
                alerts.push({
                    type: 'performance_drop',
                    severity: 'high',
                    message: `ROAS dropped by ${Math.abs(performanceMetrics.comparison.roasChangePercent).toFixed(1)}% compared to previous period`,
                    triggeredAt: new Date()
                })
            }
            
            if (performanceMetrics.comparison.roasChangePercent > 20) {
                alerts.push({
                    type: 'performance_improvement',
                    severity: 'low',
                    message: `ROAS improved by ${performanceMetrics.comparison.roasChangePercent.toFixed(1)}% compared to previous period`,
                    triggeredAt: new Date()
                })
            }
            
            performanceMetrics.alerts = alerts
            await performanceMetrics.save()
        }
        
        return response(true, 201, 'Performance metrics calculated successfully', performanceMetrics)
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(payload, orders, facebookEvents) {
    const metrics = {
        revenue: 0,
        spend: 0,
        conversions: orders.length,
        impressions: 0,
        clicks: 0,
        totalCustomerValue: 0,
        repeatPurchases: 0,
        uniqueCustomers: new Set()
    }
    
    // Calculate revenue and customer metrics
    orders.forEach(order => {
        metrics.revenue += order.total || 0
        metrics.uniqueCustomers.add(order.userId || order.email)
        
        // Check for repeat purchases (simplified)
        if (order.isRepeatPurchase) {
            metrics.repeatPurchases++
        }
    })
    
    // Calculate spend from Facebook events
    facebookEvents.forEach(event => {
        if (event.spend) {
            metrics.spend += event.spend
        }
        if (event.impressions) {
            metrics.impressions += event.impressions
        }
        if (event.clicks) {
            metrics.clicks += event.clicks
        }
    })
    
    const uniqueCustomerCount = metrics.uniqueCustomers.size
    const totalRevenue = metrics.revenue
    const totalSpend = metrics.spend
    const totalConversions = metrics.conversions
    
    // Calculate ROAS
    metrics.roas = totalSpend > 0 ? totalRevenue / totalSpend : 0
    
    // Calculate CAC
    metrics.cac = totalConversions > 0 ? totalSpend / totalConversions : 0
    metrics.costPerConversion = metrics.cac
    
    // Calculate LTV (simplified - average revenue per customer)
    metrics.ltv = uniqueCustomerCount > 0 ? totalRevenue / uniqueCustomerCount : 0
    metrics.totalCustomerValue = totalRevenue
    metrics.repeatPurchaseRate = totalConversions > 0 ? (metrics.repeatPurchases / totalConversions) * 100 : 0
    metrics.avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0
    
    // Calculate additional metrics
    metrics.ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
    metrics.cpc = metrics.clicks > 0 ? totalSpend / metrics.clicks : 0
    metrics.conversionRate = metrics.clicks > 0 ? (totalConversions / metrics.clicks) * 100 : 0
    
    // Apply targets if provided
    if (payload.roasTarget) metrics.roasTarget = payload.roasTarget
    if (payload.cacTarget) metrics.cacTarget = payload.cacTarget
    if (payload.ltvTarget) metrics.ltvTarget = payload.ltvTarget
    
    return metrics
}
