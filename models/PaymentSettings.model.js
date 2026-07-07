import mongoose from 'mongoose'

const paymentSettingsSchema = new mongoose.Schema({
    cod: {
        enabled:     { type: Boolean, default: true },
        label:       { type: String,  default: 'Cash on Delivery' },
        minOrder:    { type: Number,  default: 0 },
        maxOrder:    { type: Number,  default: 0 },
        extraCharge: { type: Number,  default: 0 },
        note:        { type: String,  default: '' },
    },
    bkash: {
        enabled:     { type: Boolean, default: false },
        label:       { type: String,  default: 'bKash' },
        number:      { type: String,  default: '' },
        apiKey:      { type: String,  default: '' },
        secretKey:   { type: String,  default: '' },
        mode:        { type: String,  enum: ['manual', 'api'], default: 'manual' },
        note:        { type: String,  default: '' },
    },
    nagad: {
        enabled:     { type: Boolean, default: false },
        label:       { type: String,  default: 'Nagad' },
        number:      { type: String,  default: '' },
        apiKey:      { type: String,  default: '' },
        secretKey:   { type: String,  default: '' },
        mode:        { type: String,  enum: ['manual', 'api'], default: 'manual' },
        note:        { type: String,  default: '' },
    },
    sslcommerz: {
        enabled:     { type: Boolean, default: false },
        label:       { type: String,  default: 'SSL Commerz' },
        storeId:     { type: String,  default: '' },
        storePass:   { type: String,  default: '' },
        sandbox:     { type: Boolean, default: true },
        note:        { type: String,  default: '' },
    },
    rocket: {
        enabled:     { type: Boolean, default: false },
        label:       { type: String,  default: 'Rocket (DBBL)' },
        number:      { type: String,  default: '' },
        apiKey:      { type: String,  default: '' },
        secretKey:   { type: String,  default: '' },
        mode:        { type: String,  enum: ['manual', 'api'], default: 'manual' },
        note:        { type: String,  default: '' },
    },
    bankTransfer: {
        enabled:       { type: Boolean, default: false },
        label:         { type: String,  default: 'Bank Transfer' },
        bankName:      { type: String,  default: '' },
        accountName:   { type: String,  default: '' },
        accountNumber: { type: String,  default: '' },
        routingNumber: { type: String,  default: '' },
        note:          { type: String,  default: '' },
    },
}, { timestamps: true })

const PaymentSettingsModel = (mongoose.models && mongoose.models.PaymentSettings) || mongoose.model('PaymentSettings', paymentSettingsSchema, 'paymentSettings')
export default PaymentSettingsModel
