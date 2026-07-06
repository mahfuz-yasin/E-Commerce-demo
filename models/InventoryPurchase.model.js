import mongoose from "mongoose"

const inventoryPurchaseSchema = new mongoose.Schema({
    purchaseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        default: null,
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variant: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
            productName: { type: String, required: true },
            color: { type: String, default: null },
            size: { type: String, default: null },
            qty: { type: Number, required: true },
            costPrice: { type: Number, required: true }, // per unit
            totalCost: { type: Number, required: true }, // qty * costPrice
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    dueAmount: {
        type: Number,
        default: 0,
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'mobile_banking', 'credit'],
        default: 'cash',
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true })

inventoryPurchaseSchema.index({ supplier: 1 })
inventoryPurchaseSchema.index({ purchaseDate: -1 })

const InventoryPurchaseModel = (mongoose.models && mongoose.models.InventoryPurchase) || mongoose.model('InventoryPurchase', inventoryPurchaseSchema, 'inventory_purchases')
export default InventoryPurchaseModel
