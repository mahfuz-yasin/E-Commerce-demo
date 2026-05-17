import mongoose from "mongoose";

const DownBannerSchema = new mongoose.Schema({
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

const DownBannerModel = (mongoose.models && mongoose.models.DownBanner) || mongoose.model('DownBanner', DownBannerSchema);

export default DownBannerModel;
