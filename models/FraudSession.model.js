import mongoose from "mongoose"

const fraudSessionSchema = new mongoose.Schema({
    // Session tracking for time-gate trigger
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    checkoutStartTime: {
        type: Date,
        required: true,
        index: true
    },
    orderSubmittedAt: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in seconds
        default: null
    },
    
    // Device fingerprinting
    ipAddress: {
        type: String,
        required: true,
        index: true
    },
    userAgent: {
        type: String,
        required: true
    },
    deviceFingerprint: {
        type: String,
        required: true,
        index: true
    },
    
    // Order tracking
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    
    // Fraud detection results
    fraudChecks: {
        timeGate: {
            triggered: { type: Boolean, default: false },
            duration: { type: Number, default: null }
        },
        rateLimit: {
            triggered: { type: Boolean, default: false },
            orderCount: { type: Number, default: 0 }
        },
        trashData: {
            triggered: { type: Boolean, default: false },
            flaggedFields: [String]
        },
        phoneBlacklist: {
            triggered: { type: Boolean, default: false },
            isBlacklisted: { type: Boolean, default: false }
        },
        courierRisk: {
            triggered: { type: Boolean, default: false },
            returnRate: { type: Number, default: 0 }
        }
    },
    
    // Overall fraud score
    overallScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Session status
    status: {
        type: String,
        enum: ['active', 'completed', 'blocked', 'expired'],
        default: 'active'
    },
    
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // 1 hour
    }
}, { timestamps: true })

// Indexes for performance
fraudSessionSchema.index({ ipAddress: 1, checkoutStartTime: 1 })
fraudSessionSchema.index({ deviceFingerprint: 1, checkoutStartTime: 1 })
fraudSessionSchema.index({ status: 1, expiresAt: 1 })

const FraudSessionModel = (mongoose.models && mongoose.models.FraudSession) 
    || mongoose.model('FraudSession', fraudSessionSchema, 'fraud_sessions')

export default FraudSessionModel
