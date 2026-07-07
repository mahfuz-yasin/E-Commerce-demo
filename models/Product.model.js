import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    mrp: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media',
            required: true
        }
    ],
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    longDescription: [
        {
            header: {
                type: String,
                required: true,
                trim: true
            },
            paragraph: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    colors: {
        type: [
            {
                name: {
                    type: String,
                    trim: true
                },
                hex: {
                    type: String,
                    trim: true
                },
                isCustom: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        default: []
    },
    // Pricing extras
    costPrice:      { type: Number, default: 0 },
    additionalCost: { type: Number, default: 0 },

    // Behaviour toggles
    showOnWebsite:         { type: Boolean, default: true },
    freeDelivery:          { type: Boolean, default: false },
    allowBackorder:        { type: Boolean, default: false },
    hideQuantitySelector:  { type: Boolean, default: false },
    isDigital:             { type: Boolean, default: false },

    // Media extras
    youtubeUrl: { type: String, default: null },

    // Internal note (admin only)
    internalNote: { type: String, default: null },

    // Badge extras
    showSaveAmountBadge: { type: Boolean, default: false },
    specialPromoBadge: {
        enabled: { type: Boolean, default: false },
        texts:   { type: [String], default: [] },
    },

    // Stock
    stock: { type: Number, default: 0 },
    sku: { type: String, default: null, trim: true },
    lowStockThreshold: { type: Number, default: 5 },

    // Status
    isActive: { type: Boolean, default: true },

    // Badge
    badge: { type: String, enum: ['none','new','sale','hot','featured','out_of_stock'], default: 'none' },

    // Tags
    tags: { type: [String], default: [] },

    // SEO
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
    seoKeywords: { type: [String], default: [] },

    // Weight & dimensions
    weight: { type: Number, default: null },
    dimensions: {
        length: { type: Number, default: null },
        width:  { type: Number, default: null },
        height: { type: Number, default: null },
    },

    // Combo offer
    comboOffer: {
        enabled:      { type: Boolean, default: false },
        minQty:       { type: Number,  default: 2 },
        comboPrice:   { type: Number,  default: 0 },
        comboDiscount:{ type: Number,  default: 0 },
    },

    // Payment restrictions (block specific methods)
    allowedPayments: {
        cod:        { type: Boolean, default: true },
        bkash:      { type: Boolean, default: true },
        nagad:      { type: Boolean, default: true },
        card:       { type: Boolean, default: true },
        bankTransfer:{ type: Boolean, default: true },
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })


productSchema.index({ category: 1 })
const ProductModel = (mongoose.models && mongoose.models.Product) || mongoose.model('Product', productSchema, 'products')
export default ProductModel