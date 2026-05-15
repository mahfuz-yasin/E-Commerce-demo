import mongoose from 'mongoose'
import { encrypt, decrypt } from '@/lib/encryption'

const FacebookConfigSchema = new mongoose.Schema({
  // General Settings
  appId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  appSecret: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  apiVersion: {
    type: String,
    default: 'v19.0',
    required: false
  },

  // Pixel & CAPI Settings
  pixelId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  capiAccessToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  testEventCode: {
    type: String,
    required: false
  },
  pixelStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  capiStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },

  // Business Manager Settings
  businessManagerId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  adAccountId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  businessManagerStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },

  // Page & Messenger Settings
  pageId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  messengerPageId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  pageStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  messengerStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },

  // Catalog Settings
  catalogId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  catalogStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  lastCatalogSync: {
    type: Date,
    default: null
  },

  // Instagram Settings
  instagramBusinessId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  instagramStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },

  // WhatsApp Settings
  whatsappBusinessId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  whatsappStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },

  // Advanced Settings
  domainVerificationCode: {
    type: String,
    required: false
  },
  clientToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  systemUserId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
})

// Ensure only one FacebookConfig document exists
FacebookConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne()
  if (!config) {
    config = new this()
    await config.save()
  }
  return config
}

const FacebookConfigModel = mongoose.models.FacebookConfig || mongoose.model('FacebookConfig', FacebookConfigSchema)

export default FacebookConfigModel
