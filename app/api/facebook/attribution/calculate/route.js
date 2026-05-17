import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AttributionModelModel from "@/models/AttributionModel.model"
import Order from "@/models/Order.model"
import FacebookLog from "@/models/FacebookLog.model"

// POST calculate attribution
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const { modelId, startDate, endDate } = await request.json()
        
        if (!modelId) {
            return response(false, 400, 'Model ID is required')
        }
        
        const model = await AttributionModelModel.findById(modelId)
        
        if (!model) {
            return response(false, 404, 'Attribution model not found')
        }
        
        // Get date range
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const end = endDate ? new Date(endDate) : new Date()
        
        // Get orders in date range
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['delivered', 'completed'] }
        }).lean()
        
        // Get Facebook events for attribution
        const facebookEvents = await FacebookLog.find({
            timestamp: { $gte: start, $lte: end },
            eventType: { $in: ['Purchase', 'AddToCart', 'ViewContent', 'Lead'] }
        }).lean()
        
        // Calculate attribution based on model type
        const attribution = calculateAttribution(model, orders, facebookEvents)
        
        // Update model performance
        model.performance.totalConversions = orders.length
        model.performance.totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
        model.performance.attributedConversions = attribution.totalAttributedConversions
        model.performance.attributedRevenue = attribution.totalAttributedRevenue
        model.performance.avgAttributionRate = attribution.avgAttributionRate
        model.lastPerformanceUpdate = new Date()
        await model.save()
        
        return response(true, 200, 'Attribution calculated successfully', {
            attribution,
            model: {
                id: model._id,
                name: model.modelName,
                type: model.modelType
            },
            dateRange: {
                start,
                end,
                totalOrders: orders.length,
                totalRevenue: model.performance.totalRevenue
            }
        })
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to calculate attribution based on model type
function calculateAttribution(model, orders, facebookEvents) {
    const attribution = {
        modelType: model.modelType,
        touchpoints: [],
        totalAttributedConversions: 0,
        totalAttributedRevenue: 0,
        avgAttributionRate: 0
    }
    
    // Group events by user to create customer journeys
    const customerJourneys = groupEventsByCustomer(facebookEvents, orders)
    
    switch (model.modelType) {
        case 'first_click':
            attribution.touchpoints = calculateFirstClickAttribution(customerJourneys, model.firstClickConfig)
            break
        case 'last_click':
            attribution.touchpoints = calculateLastClickAttribution(customerJourneys, model.lastClickConfig)
            break
        case 'linear':
            attribution.touchpoints = calculateLinearAttribution(customerJourneys, model.linearConfig)
            break
        case 'time_decay':
            attribution.touchpoints = calculateTimeDecayAttribution(customerJourneys, model.timeDecayConfig)
            break
        case 'position_based':
            attribution.touchpoints = calculatePositionBasedAttribution(customerJourneys, model.positionBasedConfig)
            break
        case 'custom':
            attribution.touchpoints = calculateCustomAttribution(customerJourneys, model.customConfig)
            break
    }
    
    // Calculate totals
    attribution.totalAttributedConversions = attribution.touchpoints.reduce((sum, tp) => sum + tp.attributedConversions, 0)
    attribution.totalAttributedRevenue = attribution.touchpoints.reduce((sum, tp) => sum + tp.attributedRevenue, 0)
    attribution.avgAttributionRate = attribution.totalAttributedConversions / (orders.length || 1) * 100
    
    return attribution
}

// Helper function to group events by customer
function groupEventsByCustomer(facebookEvents, orders) {
    const journeys = {}
    
    // Group events by fbc (Facebook Click ID) or user ID
    facebookEvents.forEach(event => {
        const customerId = event.fbc || event.userId || 'unknown'
        if (!journeys[customerId]) {
            journeys[customerId] = {
                customerId,
                events: [],
                order: null
            }
        }
        journeys[customerId].events.push({
            type: event.eventType,
            timestamp: event.timestamp,
            source: event.source || 'facebook',
            value: event.value || 0
        })
    })
    
    // Match orders to journeys
    orders.forEach(order => {
        const customerId = order.userId || order.email || 'unknown'
        if (journeys[customerId]) {
            journeys[customerId].order = order
        }
    })
    
    return Object.values(journeys).filter(j => j.events.length > 0)
}

// First Click Attribution
function calculateFirstClickAttribution(journeys, config) {
    const touchpoints = {}
    
    journeys.forEach(journey => {
        if (!journey.order) return
        
        const firstEvent = journey.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]
        const source = firstEvent.source || 'facebook'
        
        if (!touchpoints[source]) {
            touchpoints[source] = {
                source,
                touchCount: 0,
                attributedConversions: 0,
                attributedRevenue: 0
            }
        }
        
        touchpoints[source].touchCount++
        touchpoints[source].attributedConversions++
        touchpoints[source].attributedRevenue += journey.order.total || 0
    })
    
    return Object.values(touchpoints)
}

// Last Click Attribution
function calculateLastClickAttribution(journeys, config) {
    const touchpoints = {}
    
    journeys.forEach(journey => {
        if (!journey.order) return
        
        const lastEvent = journey.events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        const source = lastEvent.source || 'facebook'
        
        if (!touchpoints[source]) {
            touchpoints[source] = {
                source,
                touchCount: 0,
                attributedConversions: 0,
                attributedRevenue: 0
            }
        }
        
        touchpoints[source].touchCount++
        touchpoints[source].attributedConversions++
        touchpoints[source].attributedRevenue += journey.order.total || 0
    })
    
    return Object.values(touchpoints)
}

// Linear Attribution
function calculateLinearAttribution(journeys, config) {
    const touchpoints = {}
    
    journeys.forEach(journey => {
        if (!journey.order) return
        
        const creditPerTouch = 100 / journey.events.length
        const revenuePerTouch = (journey.order.total || 0) / journey.events.length
        
        journey.events.forEach(event => {
            const source = event.source || 'facebook'
            
            if (!touchpoints[source]) {
                touchpoints[source] = {
                    source,
                    touchCount: 0,
                    attributedConversions: 0,
                    attributedRevenue: 0
                }
            }
            
            touchpoints[source].touchCount++
            touchpoints[source].attributedConversions += creditPerTouch / 100
            touchpoints[source].attributedRevenue += revenuePerTouch
        })
    })
    
    return Object.values(touchpoints)
}

// Time Decay Attribution
function calculateTimeDecayAttribution(journeys, config) {
    const touchpoints = {}
    const halfLife = config.halfLife || 7 // days
    const decayRate = Math.log(2) / halfLife
    
    journeys.forEach(journey => {
        if (!journey.order) return
        
        const orderTime = new Date(journey.order.createdAt).getTime()
        let totalWeight = 0
        const weights = journey.events.map(event => {
            const eventTime = new Date(event.timestamp).getTime()
            const daysDiff = (orderTime - eventTime) / (1000 * 60 * 60 * 24)
            const weight = Math.exp(-decayRate * daysDiff)
            totalWeight += weight
            return { ...event, weight }
        })
        
        weights.forEach(({ source, weight }) => {
            source = source || 'facebook'
            const credit = weight / totalWeight
            const revenue = (journey.order.total || 0) * credit
            
            if (!touchpoints[source]) {
                touchpoints[source] = {
                    source,
                    touchCount: 0,
                    attributedConversions: 0,
                    attributedRevenue: 0
                }
            }
            
            touchpoints[source].touchCount++
            touchpoints[source].attributedConversions += credit
            touchpoints[source].attributedRevenue += revenue
        })
    })
    
    return Object.values(touchpoints)
}

// Position Based Attribution
function calculatePositionBasedAttribution(journeys, config) {
    const touchpoints = {}
    const firstTouchCredit = config.firstTouchCredit || 40
    const lastTouchCredit = config.lastTouchCredit || 40
    const middleTouchCredit = config.middleTouchCredit || 20
    
    journeys.forEach(journey => {
        if (!journey.order || journey.events.length === 0) return
        
        const sortedEvents = journey.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        const firstEvent = sortedEvents[0]
        const lastEvent = sortedEvents[sortedEvents.length - 1]
        const middleEvents = sortedEvents.slice(1, -1)
        
        const totalRevenue = journey.order.total || 0
        
        // First touch
        const firstSource = firstEvent.source || 'facebook'
        if (!touchpoints[firstSource]) {
            touchpoints[firstSource] = {
                source: firstSource,
                touchCount: 0,
                attributedConversions: 0,
                attributedRevenue: 0
            }
        }
        touchpoints[firstSource].touchCount++
        touchpoints[firstSource].attributedConversions += firstTouchCredit / 100
        touchpoints[firstSource].attributedRevenue += totalRevenue * (firstTouchCredit / 100)
        
        // Last touch
        if (lastEvent !== firstEvent) {
            const lastSource = lastEvent.source || 'facebook'
            if (!touchpoints[lastSource]) {
                touchpoints[lastSource] = {
                    source: lastSource,
                    touchCount: 0,
                    attributedConversions: 0,
                    attributedRevenue: 0
                }
            }
            touchpoints[lastSource].touchCount++
            touchpoints[lastSource].attributedConversions += lastTouchCredit / 100
            touchpoints[lastSource].attributedRevenue += totalRevenue * (lastTouchCredit / 100)
        }
        
        // Middle touches
        if (middleEvents.length > 0) {
            const creditPerMiddle = middleTouchCredit / middleEvents.length
            middleEvents.forEach(event => {
                const source = event.source || 'facebook'
                if (!touchpoints[source]) {
                    touchpoints[source] = {
                        source,
                        touchCount: 0,
                        attributedConversions: 0,
                        attributedRevenue: 0
                    }
                }
                touchpoints[source].touchCount++
                touchpoints[source].attributedConversions += creditPerMiddle / 100
                touchpoints[source].attributedRevenue += totalRevenue * (creditPerMiddle / 100)
            })
        }
    })
    
    return Object.values(touchpoints)
}

// Custom Attribution
function calculateCustomAttribution(journeys, config) {
    const touchpoints = {}
    
    journeys.forEach(journey => {
        if (!journey.order || !config.touchpointRules) return
        
        const sortedEvents = journey.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        const totalRevenue = journey.order.total || 0
        
        sortedEvents.forEach((event, index) => {
            const source = event.source || 'facebook'
            const position = index === 0 ? 'first' : index === sortedEvents.length - 1 ? 'last' : 'middle'
            
            // Find matching rule
            const rule = config.touchpointRules.find(r => {
                const typeMatch = r.touchpointType === 'facebook' || r.touchpointType === source
                const positionMatch = r.position === 'any' || r.position === position
                return typeMatch && positionMatch
            })
            
            if (rule) {
                const credit = (rule.creditPercentage / 100) * (rule.multiplier || 1)
                const revenue = totalRevenue * credit
                
                if (!touchpoints[source]) {
                    touchpoints[source] = {
                        source,
                        touchCount: 0,
                        attributedConversions: 0,
                        attributedRevenue: 0
                    }
                }
                
                touchpoints[source].touchCount++
                touchpoints[source].attributedConversions += credit
                touchpoints[source].attributedRevenue += revenue
            }
        })
    })
    
    return Object.values(touchpoints)
}
