import mongoose from "mongoose";

const ContactInquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied', 'resolved'],
        default: 'pending'
    },
    reply: {
        type: String
    },
    repliedAt: {
        type: Date
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

const ContactInquiryModel = mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', ContactInquirySchema);

export default ContactInquiryModel;
