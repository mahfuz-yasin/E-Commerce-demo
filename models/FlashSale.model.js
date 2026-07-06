import mongoose from "mongoose"

const flashSaleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
            specialPrice: { type: Number, default: null }, // override discount if set
            stockLimit: { type: Number, default: null },   // max qty to sell in flash sale
            soldCount: { type: Number, default: 0 },
        }
    ],
    isActive: {
        type: Boolean,
        default: false,
    },
    showCountdown: {
        type: Boolean,
        default: true,
    },
    bannerImage: {
        type: String,
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true })

flashSaleSchema.index({ startTime: 1, endTime: 1, isActive: 1 })

const FlashSaleModel = (mongoose.models && mongoose.models.FlashSale) || mongoose.model('FlashSale', flashSaleSchema, 'flash_sales')
export default FlashSaleModel
