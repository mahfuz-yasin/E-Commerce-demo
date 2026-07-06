import mongoose from "mongoose"

const smsLogSchema = new mongoose.Schema({
    recipients: [
        {
            phone: { type: String, required: true },
            name: { type: String, default: null },
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
            status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
            responseCode: { type: String, default: null },
        }
    ],
    message: {
        type: String,
        required: true,
        trim: true,
    },
    messageType: {
        type: String,
        enum: ['order_confirmation', 'order_status', 'promotional', 'bulk', 'custom'],
        default: 'custom',
    },
    totalCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    provider: {
        type: String,
        enum: ['ssl_wireless', 'alpha_sms', 'adn_sms', 'twilio', 'other'],
        default: 'ssl_wireless',
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    cost: { type: Number, default: 0 },
}, { timestamps: true })

const SMSLogModel = (mongoose.models && mongoose.models.SMSLog) || mongoose.model('SMSLog', smsLogSchema, 'sms_logs')
export default SMSLogModel
