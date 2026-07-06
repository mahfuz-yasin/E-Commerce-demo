import mongoose from "mongoose"

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    totalPurchaseAmount: {
        type: Number,
        default: 0,
    },
    totalPurchaseCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true })

const SupplierModel = (mongoose.models && mongoose.models.Supplier) || mongoose.model('Supplier', supplierSchema, 'suppliers')
export default SupplierModel
