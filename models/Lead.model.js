import mongoose from "mongoose"

const leadSchema = new mongoose.Schema({
    facebookLeadId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    adId: {
        type: String,
        trim: true
    },
    formId: {
        type: String,
        required: true,
        trim: true
    },
    formName: {
        type: String,
        trim: true
    },
    pageId: {
        type: String,
        trim: true
    },
    campaignId: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    customFields: {
        type: Map,
        of: String,
        default: new Map()
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'lost'],
        default: 'new'
    },
    notes: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

leadSchema.index({ facebookLeadId: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ createdAt: -1 })

const LeadModel = mongoose.models.Lead || mongoose.model('Lead', leadSchema, 'leads')
export default LeadModel
