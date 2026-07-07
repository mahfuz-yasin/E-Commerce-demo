import mongoose from "mongoose"

const FraudSettingsSchema = new mongoose.Schema({
    // Global toggle
    protectionEnabled: { type: Boolean, default: true },

    // Validation rules
    minAddressLength: { type: Number, default: 10 },
    blockBelowDeliveryRatio: { type: Number, default: 30 }, // percentage 0-100
    blockNewCustomers: { type: Boolean, default: false },

    // Block popup message
    blockMessage: { type: String, default: 'দুঃখিত! আপনার অর্ডার গ্রহণ করা সম্ভব হচ্ছে না। আরও তথ্যের জন্য যোগাযোগ করুন।' },
    blockWhatsappNumber: { type: String, default: '' },
    blockCallNumber: { type: String, default: '' },
    showWhatsappButton: { type: Boolean, default: true },
    showCallButton: { type: Boolean, default: true },

    // WhatsApp pre-filled message template
    whatsappMessageTemplate: {
        type: String,
        default: 'আমার অর্ডার: {{order_id}}\nনাম: {{customer_name}}\nপণ্য: {{products}}\nমোট: {{total}}\nঠিকানা: {{address}}'
    },
}, { timestamps: true })

const FraudSettingsModel = (mongoose.models && mongoose.models.FraudSettings)
    || mongoose.model('FraudSettings', FraudSettingsSchema, 'fraud_settings')

export default FraudSettingsModel
