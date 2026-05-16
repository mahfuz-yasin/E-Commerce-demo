import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['header', 'footer', 'banner', 'page', 'landing_page']
    },
    key: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    imageUrl: {
        type: String
    },
    link: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SettingsModel = (mongoose.models && mongoose.models.Settings) || mongoose.model('Settings', SettingsSchema);

export default SettingsModel;
