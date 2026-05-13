import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true,
        enum: ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'teal']
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    buttonText: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const FeatureModel = mongoose.models.Feature || mongoose.model('Feature', FeatureSchema);

export default FeatureModel;
