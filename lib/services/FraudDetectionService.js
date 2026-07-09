import { connectDB } from "@/lib/databaseConnection"
import FraudSessionModel from "@/models/FraudSession.model"
import BlacklistedContactModel from "@/models/BlacklistedContact.model"
import BlockedCustomerModel from "@/models/BlockedCustomer.model"
import OrderModel from "@/models/Order.model"
import FraudSettingsModel from "@/models/FraudSettings.model"
import crypto from 'crypto'

class FraudDetectionService {
    constructor() {
        this.settings = null
    }

    // Initialize fraud detection settings
    async initialize() {
        await connectDB()
        this.settings = await FraudSettingsModel.findOne().lean() || {}
    }

    // Generate device fingerprint
    generateDeviceFingerprint(userAgent, ipAddress) {
        const hash = crypto.createHash('sha256')
        hash.update(`${userAgent}|${ipAddress}`)
        return hash.digest('hex')
    }

    // 1. Time-Gate Trigger: Detect bots by checkout duration
    async checkTimeGate(sessionId, checkoutStartTime) {
        const checkoutTime = new Date(checkoutStartTime)
        const currentTime = new Date()
        const duration = Math.floor((currentTime - checkoutTime) / 1000) // seconds
        
        const isBot = duration < 10 // Less than 10 seconds = bot
        
        return {
            triggered: isBot,
            duration,
            message: isBot ? 'Bot/Spam detected: Checkout completed too quickly' : 'Time gate passed'
        }
    }

    // 2. Rate Limiting & Device/IP Fingerprinting
    async checkRateLimit(ipAddress, userAgent) {
        const deviceFingerprint = this.generateDeviceFingerprint(userAgent, ipAddress)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
        
        // Check IP-based rate limiting
        const ipOrders = await OrderModel.find({
            ipAddress,
            createdAt: { $gte: fifteenMinutesAgo },
            deletedAt: null
        }).countDocuments()
        
        // Check device-based rate limiting
        const deviceOrders = await FraudSessionModel.aggregate([
            {
                $match: {
                    deviceFingerprint,
                    checkoutStartTime: { $gte: fifteenMinutesAgo },
                    status: { $in: ['completed', 'active'] }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ])
        
        const deviceOrderCount = deviceOrders[0]?.count || 0
        const maxOrders = Math.max(ipOrders, deviceOrderCount)
        const isRateLimited = maxOrders >= 3
        
        // Auto-block if rate limited
        if (isRateLimited) {
            await this.blockIPAddress(ipAddress, 'Rate limit exceeded: 3+ orders in 15 minutes')
        }
        
        return {
            triggered: isRateLimited,
            orderCount: maxOrders,
            deviceFingerprint,
            message: isRateLimited ? 'Rate limit exceeded: Too many orders from same IP/device' : 'Rate limit passed'
        }
    }

    // 3. Trash Data & Regex Validation
    async checkTrashData(customerName, shippingAddress) {
        const flaggedFields = []
        
        // Patterns for trash/gibberish data
        const trashPatterns = [
            /(.)\1{4,}/, // Repeated characters (aaaaa, 11111)
            /^[a-z]{10,}$/i, // Long lowercase strings
            /^[0-9]{10,}$/, // Long numeric strings
            /^(asdf|qwer|zxcv|test|demo|fake)/i, // Common test strings
            /^[^a-zA-Z0-9\s]{5,}$/, // Special characters only
            /^(.)\1{2,}(.)\2{2,}/, // Alternating repeated chars
        ]
        
        // Check customer name
        if (customerName) {
            for (const pattern of trashPatterns) {
                if (pattern.test(customerName)) {
                    flaggedFields.push('customerName')
                    break
                }
            }
            
            // Additional name checks
            if (customerName.length < 2 || customerName.length > 100) {
                flaggedFields.push('customerName')
            }
        }
        
        // Check shipping address
        if (shippingAddress) {
            for (const pattern of trashPatterns) {
                if (pattern.test(shippingAddress)) {
                    flaggedFields.push('shippingAddress')
                    break
                }
            }
            
            // Additional address checks
            if (shippingAddress.length < 10 || shippingAddress.length > 500) {
                flaggedFields.push('shippingAddress')
            }
        }
        
        const isTrashData = flaggedFields.length > 0
        
        return {
            triggered: isTrashData,
            flaggedFields,
            message: isTrashData ? `Trash data detected in: ${flaggedFields.join(', ')}` : 'Data validation passed'
        }
    }

    // 4. Phone Number Filter & Blacklist
    async checkPhoneBlacklist(phoneNumber) {
        // Normalize phone number
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
        
        // Check if phone is blacklisted
        const blacklistedContact = await BlacklistedContactModel.findOne({
            phone: normalizedPhone,
            isActive: true,
            deletedAt: null
        }).lean()
        
        // Also check blocked customers
        const blockedCustomer = await BlockedCustomerModel.findOne({
            phone: normalizedPhone,
            isActive: true,
            deletedAt: null
        }).lean()
        
        const isBlacklisted = !!(blacklistedContact || blockedCustomer)
        
        return {
            triggered: isBlacklisted,
            isBlacklisted,
            blacklistedContact,
            blockedCustomer,
            message: isBlacklisted ? 'Phone number is blacklisted' : 'Phone number validation passed'
        }
    }

    // 5. Third-Party Courier Fraud API Integration
    async checkCourierRisk(phoneNumber) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
        
        try {
            // Mock courier API integration
            const courierData = await this.fetchCourierData(normalizedPhone)
            
            const returnRate = courierData.returnRate || 0
            const isHighRisk = returnRate > 40
            
            // Update blacklisted contacts with courier data
            if (isHighRisk) {
                await BlacklistedContactModel.findOneAndUpdate(
                    { phone: normalizedPhone },
                    {
                        $set: {
                            'courierData.steadfast.returnRate': returnRate,
                            'courierData.steadfast.lastChecked': new Date(),
                            returnRate
                        }
                    },
                    { upsert: true }
                )
            }
            
            return {
                triggered: isHighRisk,
                returnRate,
                courierData,
                message: isHighRisk ? `High return rate detected: ${returnRate}%` : 'Courier risk check passed'
            }
        } catch (error) {
            console.error('Courier API error:', error)
            return {
                triggered: false,
                returnRate: 0,
                message: 'Courier API unavailable - proceeding with order'
            }
        }
    }

    // Mock courier API integration
    async fetchCourierData(phoneNumber) {
        // This is a mock implementation
        // In production, integrate with actual courier APIs like SteadFast, Pathao, etc.
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data based on phone number patterns
        const phoneHash = phoneNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const returnRate = (phoneHash % 100) // Random return rate 0-99%
        
        return {
            phoneNumber,
            returnRate,
            successRate: 100 - returnRate,
            totalOrders: Math.floor(phoneHash % 50) + 1,
            returnedOrders: Math.floor((returnRate / 100) * ((phoneHash % 50) + 1)),
            lastChecked: new Date()
        }
    }

    // 6. Block IP Address
    async blockIPAddress(ipAddress, reason) {
        const existingBlock = await BlockedCustomerModel.findOne({
            ipAddress,
            isActive: true,
            deletedAt: null
        })
        
        if (!existingBlock) {
            await BlockedCustomerModel.create({
                ipAddress,
                blockType: ['ip'],
                reason,
                isActive: true,
                blockedBy: null, // System blocked
                autoUnblockAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            })
        }
    }

    // 7. Normalize phone number
    normalizePhoneNumber(phone) {
        if (!phone) return ''
        
        // Remove all non-numeric characters
        let normalized = phone.replace(/\D/g, '')
        
        // Handle Bangladeshi phone numbers
        if (normalized.startsWith('880')) {
            normalized = normalized.substring(2) // Remove 880
        } else if (normalized.startsWith('0')) {
            normalized = normalized.substring(1) // Remove leading 0
        }
        
        // Ensure it starts with 1 (Bangladeshi mobile numbers)
        if (!normalized.startsWith('1')) {
            return phone // Return original if not a valid BD number
        }
        
        return normalized
    }

    // 8. Validate Bangladeshi phone number
    isValidBangladeshiPhone(phone) {
        const normalized = this.normalizePhoneNumber(phone)
        
        // Bangladeshi mobile numbers are 10 digits starting with 1
        const bdMobilePattern = /^1[3-9]\d{8}$/
        
        return bdMobilePattern.test(normalized)
    }

    // 9. Calculate overall fraud score
    calculateFraudScore(checks) {
        let score = 0
        
        // Time gate violation (high severity)
        if (checks.timeGate.triggered) score += 30
        
        // Rate limiting violation (high severity)
        if (checks.rateLimit.triggered) score += 35
        
        // Trash data (medium severity)
        if (checks.trashData.triggered) score += 20
        
        // Phone blacklist (high severity)
        if (checks.phoneBlacklist.triggered) score += 40
        
        // High courier risk (low-medium severity)
        if (checks.courierRisk.triggered) score += 15
        
        return Math.min(score, 100) // Cap at 100
    }

    // 10. Main fraud detection method
    async detectFraud(orderData, sessionId, checkoutStartTime) {
        await this.initialize()
        
        const { customerName, phone, address } = orderData
        const userAgent = orderData.userAgent || ''
        const ipAddress = orderData.ipAddress || ''
        
        // Run all fraud checks
        const checks = {
            timeGate: await this.checkTimeGate(sessionId, checkoutStartTime),
            rateLimit: await this.checkRateLimit(ipAddress, userAgent),
            trashData: await this.checkTrashData(customerName, address),
            phoneBlacklist: await this.checkPhoneBlacklist(phone),
            courierRisk: await this.checkCourierRisk(phone)
        }
        
        // Calculate overall score
        const overallScore = this.calculateFraudScore(checks)
        
        // Determine order action
        const action = this.determineOrderAction(checks, overallScore)
        
        // Update fraud session
        await this.updateFraudSession(sessionId, checks, overallScore, orderData)
        
        return {
            checks,
            overallScore,
            action,
            message: this.getActionMessage(action, checks)
        }
    }

    // 11. Determine order action based on fraud checks
    determineOrderAction(checks, score) {
        // Instant rejection for critical violations
        if (checks.timeGate.triggered || checks.rateLimit.triggered) {
            return 'REJECT'
        }
        
        // Hold for review for medium violations
        if (checks.trashData.triggered || checks.phoneBlacklist.triggered) {
            return 'HOLD_REVIEW'
        }
        
        // Require advance payment for high courier risk
        if (checks.courierRisk.triggered) {
            return 'REQUIRE_ADVANCE_PAYMENT'
        }
        
        // Approve if score is low
        if (score < 30) {
            return 'APPROVE'
        }
        
        // Hold for review for medium scores
        if (score < 70) {
            return 'HOLD_REVIEW'
        }
        
        // Reject for high scores
        return 'REJECT'
    }

    // 12. Get action message
    getActionMessage(action, checks) {
        switch (action) {
            case 'REJECT':
                return 'Order rejected due to high fraud risk'
            case 'HOLD_REVIEW':
                return 'Order held for manual review'
            case 'REQUIRE_ADVANCE_PAYMENT':
                return 'Order requires advance payment due to high return rate'
            case 'APPROVE':
                return 'Order approved'
            default:
                return 'Order status unknown'
        }
    }

    // 13. Update fraud session
    async updateFraudSession(sessionId, checks, score, orderData) {
        await FraudSessionModel.findOneAndUpdate(
            { sessionId },
            {
                $set: {
                    fraudChecks: checks,
                    overallScore: score,
                    status: 'completed',
                    orderSubmittedAt: new Date()
                }
            },
            { upsert: true }
        )
    }

    // 14. Create fraud session
    async createFraudSession(sessionId, checkoutStartTime, ipAddress, userAgent) {
        const deviceFingerprint = this.generateDeviceFingerprint(userAgent, ipAddress)
        
        await FraudSessionModel.create({
            sessionId,
            checkoutStartTime: new Date(checkoutStartTime),
            ipAddress,
            userAgent,
            deviceFingerprint,
            status: 'active'
        })
        
        return deviceFingerprint
    }
}

export default new FraudDetectionService()
