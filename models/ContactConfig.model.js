import mongoose from "mongoose";

const ContactConfigSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'E-Online Fashion Panjabi'
    },
    address: {
        line1: { type: String, default: 'Magura Sadar' },
        line2: { type: String, default: 'Magura' },
        city: { type: String, default: 'Magura' },
        district: { type: String, default: 'Khulna Division' },
        country: { type: String, default: 'Bangladesh' }
    },
    phone: {
        primary: { type: String, default: '+880 1810-841539' },
        secondary: { type: String, default: '' }
    },
    email: {
        primary: { type: String, default: 'info@alhilalpanjabi.com' },
        support: { type: String, default: 'support@alhilalpanjabi.com' }
    },
    businessHours: {
        days: { type: String, default: 'Sat - Thu' },
        hours: { type: String, default: '9AM - 8PM' }
    },
    socialLinks: {
        facebook: { type: String, default: '#' },
        whatsapp: { type: String, default: 'https://wa.me/8801810841539' },
        instagram: { type: String, default: '#' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },
    mapEmbedUrl: {
        type: String,
        default: ''
    },
    pageTitle: {
        type: String,
        default: 'Contact Us'
    },
    pageSubtitle: {
        type: String,
        default: 'Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Static method to get or create config
ContactConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne({ isActive: true });
    if (!config) {
        config = await this.create({});
    }
    return config;
};

const ContactConfigModel = mongoose.models.ContactConfig || mongoose.model('ContactConfig', ContactConfigSchema);

export default ContactConfigModel;
