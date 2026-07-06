import mongoose from "mongoose"

const shippingRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['flat', 'free', 'conditional_free'],
        default: 'flat',
    },
    flatCharge: {
        type: Number,
        default: 60,
    },
    freeShippingMinAmount: {
        type: Number,
        default: 0, // 0 = always free if type=free
    },
    freeShippingForCategories: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    ],
    freeShippingForProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    priority: {
        type: Number,
        default: 0,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true })

const ShippingRuleModel = (mongoose.models && mongoose.models.ShippingRule) || mongoose.model('ShippingRule', shippingRuleSchema, 'shipping_rules')
export default ShippingRuleModel
