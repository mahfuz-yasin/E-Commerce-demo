import mongoose from "mongoose"

const staffSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    department: {
        type: String,
        enum: ['sales', 'support', 'delivery', 'accounts', 'marketing', 'management'],
        default: 'sales',
    },
    permissions: {
        viewOrders: { type: Boolean, default: true },
        updateOrderStatus: { type: Boolean, default: true },
        assignOrders: { type: Boolean, default: false },
        viewCustomers: { type: Boolean, default: true },
        manageProducts: { type: Boolean, default: false },
        manageInventory: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        manageMedia: { type: Boolean, default: false },
        manageCoupons: { type: Boolean, default: false },
        viewFinancials: { type: Boolean, default: false },
        sendSMS: { type: Boolean, default: false },
        manageFraudGuard: { type: Boolean, default: false },
    },
    maxOrdersPerDay: {
        type: Number,
        default: 50,
    },
    currentOrderCount: {
        type: Number,
        default: 0,
    },
    totalOrdersHandled: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    salary: {
        type: Number,
        default: 0,
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

const StaffModel = (mongoose.models && mongoose.models.Staff) || mongoose.model('Staff', staffSchema, 'staff')
export default StaffModel
