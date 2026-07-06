import mongoose from "mongoose"

const blockedCustomerSchema = new mongoose.Schema({
    phone: {
        type: String,
        trim: true,
        default: null,
        index: true,
        sparse: true,
    },
    ipAddress: {
        type: String,
        trim: true,
        default: null,
        index: true,
        sparse: true,
    },
    blockType: {
        type: [String],
        enum: ['phone', 'ip'],
        required: true,
    },
    reason: {
        type: String,
        trim: true,
        default: 'Fraud / Fake order',
    },
    fraudOrderCount: {
        type: Number,
        default: 1,
    },
    totalOrderCount: {
        type: Number,
        default: 0,
    },
    cancelledOrderCount: {
        type: Number,
        default: 0,
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    notes: {
        type: String,
        trim: true,
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true })

blockedCustomerSchema.index({ phone: 1, isActive: 1 })
blockedCustomerSchema.index({ ipAddress: 1, isActive: 1 })

const BlockedCustomerModel = (mongoose.models && mongoose.models.BlockedCustomer) || mongoose.model('BlockedCustomer', blockedCustomerSchema, 'blocked_customers')
export default BlockedCustomerModel
