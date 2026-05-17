import mongoose from "mongoose";

const UpBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        default: '#',
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const UpBannerModel = (mongoose.models && mongoose.models.UpBanner) || mongoose.model('UpBanner', UpBannerSchema);

export default UpBannerModel;
