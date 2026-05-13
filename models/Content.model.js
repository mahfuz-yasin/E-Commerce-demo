import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ContentModel = mongoose.models.Content || mongoose.model('Content', ContentSchema);

export default ContentModel;
