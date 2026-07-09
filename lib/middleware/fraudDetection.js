import FraudDetectionService from '@/lib/services/FraudDetectionService'
import { response } from '@/lib/helperFunction'
import crypto from 'crypto'
import FraudSessionModel from '@/models/FraudSession.model'

// Middleware to create fraud session on checkout page load
export async function createFraudSession(request) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId') || generateSessionId()
        
        const userAgent = request.headers.get('user-agent') || ''
        const ipAddress = getClientIP(request)
        const checkoutStartTime = new Date()
        
        // Create fraud session
        await FraudDetectionService.createFraudSession(
            sessionId,
            checkoutStartTime,
            ipAddress,
            userAgent
        )
        
        return response(true, 200, 'Fraud session created', {
            sessionId,
            checkoutStartTime
        })
    } catch (error) {
        console.error('Error creating fraud session:', error)
        return response(false, 500, 'Failed to create fraud session')
    }
}

// Main fraud detection middleware for order submission
export async function validateOrder(request, orderData) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId')
        
        if (!sessionId) {
            return response(false, 400, 'Session ID is required')
        }
        
        // Get checkout start time from session
        const fraudSession = await FraudSessionModel.findOne({
            sessionId,
            status: 'active'
        })
        
        if (!fraudSession) {
            return response(false, 400, 'Invalid or expired session')
        }
        
        // Extract request metadata
        const userAgent = request.headers.get('user-agent') || ''
        const ipAddress = getClientIP(request)
        
        // Add metadata to order data
        const enrichedOrderData = {
            ...orderData,
            userAgent,
            ipAddress,
            sessionId
        }
        
        // Run fraud detection
        const fraudResult = await FraudDetectionService.detectFraud(
            enrichedOrderData,
            sessionId,
            fraudSession.checkoutStartTime
        )
        
        // Handle different actions
        switch (fraudResult.action) {
            case 'REJECT':
                return response(false, 429, 'Order rejected due to fraud detection', {
                    reason: fraudResult.message,
                    score: fraudResult.overallScore,
                    checks: fraudResult.checks
                })
                
            case 'HOLD_REVIEW':
                return response(true, 200, 'Order held for review', {
                    status: 'Hold/Review',
                    fraudScore: fraudResult.overallScore,
                    fraudChecks: fraudResult.checks,
                    message: fraudResult.message,
                    shouldSendFacebookEvent: false
                })
                
            case 'REQUIRE_ADVANCE_PAYMENT':
                return response(true, 200, 'Order requires advance payment', {
                    status: 'Requires_Advance_Delivery_Charge',
                    fraudScore: fraudResult.overallScore,
                    fraudChecks: fraudResult.checks,
                    message: fraudResult.message,
                    shouldSendFacebookEvent: false
                })
                
            case 'APPROVE':
                return response(true, 200, 'Order approved', {
                    status: 'Approved',
                    fraudScore: fraudResult.overallScore,
                    fraudChecks: fraudResult.checks,
                    message: fraudResult.message,
                    shouldSendFacebookEvent: true
                })
                
            default:
                return response(false, 500, 'Unknown fraud detection result')
        }
    } catch (error) {
        console.error('Error in fraud detection:', error)
        // In case of error, allow order but flag for review
        return response(true, 200, 'Order processed with manual review required', {
            status: 'Hold/Review',
            error: 'Fraud detection service unavailable',
            shouldSendFacebookEvent: false
        })
    }
}

// Generate unique session ID
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex')
}

// Get client IP address
function getClientIP(request) {
    // Try various headers for IP address
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
    
    // Fallback to request IP
    return request.ip || 'unknown'
}

// Middleware to validate phone number format
export function validatePhoneNumber(phone) {
    return FraudDetectionService.isValidBangladeshiPhone(phone)
}

// Middleware to check if phone is blacklisted
export async function checkPhoneBlacklist(phone) {
    const result = await FraudDetectionService.checkPhoneBlacklist(phone)
    return result.isBlacklisted
}
