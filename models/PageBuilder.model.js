import mongoose from "mongoose";

const PageComponentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['hero', 'text', 'image', 'button', 'section', 'spacer', 'divider', 'video', 'gallery', 'form', 'html']
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    styles: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    order: {
        type: Number,
        default: 0
    }
});

const PageBuilderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    featuredImage: {
        type: String,
        trim: true
    },
    pageType: {
        type: String,
        required: true,
        enum: ['page', 'landing_page'],
        default: 'page'
    },
    components: [PageComponentSchema],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    relatedCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    relatedCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    styles: {
        animation: {
            type: String,
            default: 'none'
        },
        animationDuration: {
            type: String,
            default: '0.3s'
        },
        primaryColor: {
            type: String,
            default: '#3b82f6'
        },
        secondaryColor: {
            type: String,
            default: '#10b981'
        },
        shadow: {
            type: String,
            default: 'none'
        },
        borderRadius: {
            type: String,
            default: '0px'
        },
        fontFamily: {
            type: String,
            default: 'default'
        }
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const PageBuilderModel = (mongoose.models && mongoose.models.PageBuilder) || mongoose.model('PageBuilder', PageBuilderSchema);

export default PageBuilderModel;
