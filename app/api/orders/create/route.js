import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import FraudSessionModel from "@/models/FraudSession.model"
import { validateOrder, createFraudSession } from "@/lib/middleware/fraudDetection"
import { sendFacebookPurchaseEvent } from "@/lib/services/FacebookConversionAPI"
import { generateOrderId } from "@/lib/utils"

export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId')
        
        // Validate required fields
        const requiredFields = ['name', 'phone', 'address', 'products', 'totalAmount']
        const missingFields = requiredFields.filter(field => !body[field])
        
        if (missingFields.length > 0) {
            return response(false, 400, `Missing required fields: ${missingFields.join(', ')}`)
        }
        
        // Extract request metadata
        const userAgent = request.headers.get('user-agent') || ''
        const ipAddress = getClientIP(request)
        
        // Enrich order data with metadata
        const enrichedOrderData = {
            ...body,
            userAgent,
            ipAddress,
            sessionId
        }
        
        // Run fraud detection
        const fraudResult = await validateOrder(request, enrichedOrderData)
        
        if (!fraudResult.success) {
            return fraudResult
        }
        
        // Determine order status based on fraud detection
        let orderStatus = 'pending'
        const fraudData = fraudResult.data
        
        if (fraudData.status === 'Approved') {
            orderStatus = 'approved'
        } else if (fraudData.status === 'Hold/Review') {
            orderStatus = 'hold_review'
        } else if (fraudData.status === 'Requires_Advance_Delivery_Charge') {
            orderStatus = 'requires_advance_payment'
        }
        
        // Create order with fraud detection data
        const orderData = {
            ...body,
            order_id: generateOrderId(),
            status: orderStatus,
            ipAddress,
            userAgent,
            fraudScore: {
                score: fraudData.fraudScore || 0,
                flags: fraudData.fraudChecks ? Object.keys(fraudData.fraudChecks).filter(key => fraudData.fraudChecks[key].triggered) : [],
                isBlocked: orderStatus === 'rejected',
                reviewedBy: null,
                reviewedAt: null
            },
            fbPurchaseEventSent: false,
            fbPurchaseEventSentAt: null
        }
        
        // Save order to database
        const order = await OrderModel.create(orderData)
        
        // Update fraud session with order ID
        if (sessionId) {
            await FraudSessionModel.findOneAndUpdate(
                { sessionId },
                { 
                    orderId: order._id,
                    status: 'completed'
                }
            )
        }
        
        // Send Facebook Purchase Event if approved
        if (fraudData.shouldSendFacebookEvent && orderStatus === 'approved') {
            try {
                await sendFacebookPurchaseEvent(order)
                await OrderModel.findByIdAndUpdate(order._id, {
                    fbPurchaseEventSent: true,
                    fbPurchaseEventSentAt: new Date()
                })
            } catch (fbError) {
                console.error('Facebook Purchase Event failed:', fbError)
            }
        }
        
        // Prepare response
        const responseData = {
            order: order,
            fraudDetection: {
                status: fraudData.status,
                score: fraudData.fraudScore,
                message: fraudData.message,
                checks: fraudData.fraudChecks
            },
            facebookEventSent: fraudData.shouldSendFacebookEvent && orderStatus === 'approved'
        }
        
        // Return appropriate response based on status
        if (orderStatus === 'rejected') {
            return response(false, 429, 'Order rejected due to fraud detection', responseData)
        } else if (orderStatus === 'hold_review' || orderStatus === 'requires_advance_payment') {
            return response(true, 200, 'Order received and under review', responseData)
        } else {
            return response(true, 200, 'Order created successfully', responseData)
        }
        
    } catch (error) {
        console.error('Error creating order:', error)
        return catchError(error)
    }
}

// Helper function to get client IP
function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = request.headers.get('x-client-ip')
    
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
        return realIP
    }
    
    if (clientIP) {
        return clientIP
    }
    
    return request.ip || 'unknown'
}

// API endpoint to create fraud session
export async function GET(request) {
    return await createFraudSession(request)
}
