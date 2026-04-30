import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    buttonText: {
        type: String,
        default: 'Shop Now',
        trim: true
    },
    buttonLink: {
        type: String,
        default: '/shop',
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    publicId: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

const SliderModel = mongoose.models.Slider || mongoose.model('Slider', sliderSchema, 'sliders')
export default SliderModel
