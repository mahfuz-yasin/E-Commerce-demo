import mongoose from "mongoose"

const courierConfigSchema = new mongoose.Schema({
    courierName: {
        type: String,
        required: true,
        enum: ['steadfast', 'pathao', 'redx'],
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    apiConfig: {
        baseUrl: {
            type: String,
            required: true
        },
        apiKey: {
            type: String,
            required: true
        },
        secretKey: {
            type: String,
            default: null
        },
        additionalConfig: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    settings: {
        autoAssign: {
            type: Boolean,
            default: false
        },
        defaultCodAmount: {
            type: String,
            enum: ['full', 'custom'],
            default: 'full'
        },
        customCodAmount: {
            type: Number,
            default: 0
        },
        webhookUrl: {
            type: String,
            default: null
        }
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    }
}, { timestamps: true })

const CourierConfigModel = (mongoose.models && mongoose.models.CourierConfig) || mongoose.model('CourierConfig', courierConfigSchema, 'courier_configs')
export default CourierConfigModel
