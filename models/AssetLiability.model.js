import mongoose from "mongoose"

const AssetLiabilitySchema = new mongoose.Schema({
    bankBalance:  { type: Number, default: 0 },
    loans:        { type: Number, default: 0 },
    investments:  { type: Number, default: 0 },
    notes:        { type: String, default: '' },
}, { timestamps: true })

const AssetLiabilityModel = (mongoose.models && mongoose.models.AssetLiability)
    || mongoose.model('AssetLiability', AssetLiabilitySchema, 'asset_liabilities')

export default AssetLiabilityModel
