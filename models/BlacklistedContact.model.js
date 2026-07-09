import mongoose from "mongoose"

const blacklistedContactSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    
    // Blacklist metadata
    blacklistReason: {
        type: String,
        required: true,
        enum: ['fraud_orders', 'high_return_rate', 'fake_contact', 'complaint', 'manual_block']
    },
    
    // Order statistics
    totalOrders: {
        type: Number,
        default: 0
    },
    cancelledOrders: {
        type: Number,
        default: 0
    },
    returnedOrders: {
        type: Number,
        default: 0
    },
    fraudOrders: {
        type: Number,
        default: 0
    },
    
    // Risk metrics
    returnRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Blacklist management
    blacklistedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    
    // Auto-unblock settings
    autoUnblockAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: null
    },
    
    // Courier integration data
    courierData: {
        steadfast: {
            successRate: { type: Number, default: 0 },
            returnRate: { type: Number, default: 0 },
            lastChecked: { type: Date, default: null }
        },
        pathao: {
            successRate: { type: Number, default: 0 },
            returnRate: { type: Number, default: 0 },
            lastChecked: { type: Date, default: null }
        }
    },
    
    deletedAt: {
        type: Date,
        default: null,
        index: true
    }
}, { timestamps: true })

// Indexes for performance
blacklistedContactSchema.index({ phone: 1, isActive: 1 })
blacklistedContactSchema.index({ blacklistReason: 1, isActive: 1 })
blacklistedContactSchema.index({ blacklistedAt: 1 })
blacklistedContactSchema.index({ autoUnblockAt: 1, isActive: 1 })

const BlacklistedContactModel = (mongoose.models && mongoose.models.BlacklistedContact) 
    || mongoose.model('BlacklistedContact', blacklistedContactSchema, 'blacklisted_contacts')

export default BlacklistedContactModel
