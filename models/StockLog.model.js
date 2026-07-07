import mongoose from "mongoose"

const StockLogSchema = new mongoose.Schema({
    product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String },
    variant:     { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    action:      { type: String, enum: ['decrease', 'increase', 'restock', 'return', 'adjustment'], required: true },
    reason:      { type: String, default: '' },
    change:      { type: Number, required: true },
    before:      { type: Number, required: true },
    after:       { type: Number, required: true },
    reference:   { type: String, default: '' },
    performedBy: { type: String, default: 'system' },
}, { timestamps: true })

const StockLogModel = (mongoose.models && mongoose.models.StockLog)
    || mongoose.model('StockLog', StockLogSchema, 'stock_logs')

export default StockLogModel
