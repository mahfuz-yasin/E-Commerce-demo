import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    mrp: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media',
            required: true
        }
    ],
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    longDescription: [
        {
            header: {
                type: String,
                required: true,
                trim: true
            },
            paragraph: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    colors: [
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            hex: {
                type: String,
                required: true,
                trim: true
            },
            isCustom: {
                type: Boolean,
                default: false
            }
        }
    ],
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })


productSchema.index({ category: 1 })
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema, 'products')
export default ProductModel