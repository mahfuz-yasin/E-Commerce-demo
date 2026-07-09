import { orderStatus } from "@/lib/utils"
import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    ordernote: {
        type: String,
        required: false
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
            image: { type: String, required: false },
            size: { type: String, required: false },
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    couponDiscountAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: orderStatus,
        default: 'pending'
    },
    payment_id: {
        type: String,
        required: false
    },
    order_id: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    orderSource: {
        type: String,
        enum: ['cart', 'direct', 'whatsapp'],
        default: 'cart'
    },
    // Ads Source Tracking
    adSource: {
        platform: {
            type: String,
            enum: ['facebook', 'tiktok', 'google', 'instagram', 'organic', 'direct', 'other'],
            default: 'organic'
        },
        campaignId: { type: String, default: null },
        adSetId: { type: String, default: null },
        adId: { type: String, default: null },
        utmSource: { type: String, default: null },
        utmMedium: { type: String, default: null },
        utmCampaign: { type: String, default: null },
        utmContent: { type: String, default: null },
        fbclid: { type: String, default: null },
        ttclid: { type: String, default: null },
        gclid: { type: String, default: null },
        landingPage: { type: String, default: null },
        referrer: { type: String, default: null },
        // Advanced Event Match Quality
        fbc: { type: String, default: null },
        fbp: { type: String, default: null },
    },
    // Fraud Detection
    fraudScore: {
        score: { type: Number, default: 0 }, // 0-100, higher = more suspicious
        flags: [{ type: String }],           // ['duplicate_phone', 'multiple_failed', 'ip_blocked', 'suspicious_pattern']
        isBlocked: { type: Boolean, default: false },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        reviewedAt: { type: Date, default: null },
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    // Order Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedAt: { type: Date, default: null },
    // Shipping
    shippingCharge: { type: Number, default: 60 },
    freeShipping: { type: Boolean, default: false },
    // Facebook Purchase Event
    fbPurchaseEventSent: { type: Boolean, default: false },
    fbPurchaseEventSentAt: { type: Date, default: null },
    // AI Order Confirmation Call (Bland.ai)
    aiCallStatus: { type: String, enum: ['not_initiated', 'initiated', 'completed', 'failed', 'unknown'], default: 'not_initiated' },
    aiCallId: { type: String, default: null },
    aiCallOutcome: { type: String, enum: ['confirmed', 'cancelled', 'no_response', null], default: null },
    aiCallTranscript: { type: String, default: null },
    aiCallInitiatedAt: { type: Date, default: null },
    aiCallCompletedAt: { type: Date, default: null },
    // Invoice
    invoiceNumber: { type: String, default: null },
    paymentDetails: {
        type: {
            bkash: {
                number: { type: String },
                transactionId: { type: String }
            },
            nagad: {
                number: { type: String },
                transactionId: { type: String }
            }
        },
        default: null
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
    // Courier tracking fields
    courierInfo: {
        courierName: {
            type: String,
            enum: ['steadfast', 'pathao', 'redx', ''], // '' = not assigned
            default: ''
        },
        trackingCode: {
            type: String,
            default: null
        },
        consignmentId: {
            type: String,
            default: null
        },
        status: {
            type: String,
            default: 'pending' // pending, picked_up, in_transit, delivered, cancelled, returned
        },
        createdAt: {
            type: Date,
            default: null
        },
        updatedAt: {
            type: Date,
            default: null
        }
    },
    // Fraud Detection Enhanced Fields
    thankYouPageAccessed: {
        type: Boolean,
        default: false
    },
    thankYouPageAccessedAt: {
        type: Date,
        default: null
    },
    otpHash: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    otpSentAt: {
        type: Date,
        default: null
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    otpVerifiedAt: {
        type: Date,
        default: null
    },
    // Fraud Session Tracking
    fraudSessionId: {
        type: String,
        default: null
    },
    checkoutStartTime: {
        type: Date,
        default: null
    },
    orderSubmissionTime: {
        type: Date,
        default: null
    },
    checkoutDuration: {
        type: Number,
        default: null
    }
}, { timestamps: true })

const OrderModel = (mongoose.models && mongoose.models.Order) || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel