import mongoose from "mongoose"
import crypto from "crypto"

const ApiKeySchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['wordpress', 'woocommerce', 'laravel', 'custom', 'other'], default: 'custom' },
    key: { type: String, unique: true, default: () => 'ak_' + crypto.randomBytes(24).toString('hex') },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date, default: null },
    requestCount: { type: Number, default: 0 },
}, { timestamps: true })

const ApiKeyModel = (mongoose.models && mongoose.models.ApiKey)
    || mongoose.model('ApiKey', ApiKeySchema, 'api_keys')

export default ApiKeyModel
