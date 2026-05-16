import mongoose from 'mongoose'
import { encrypt, decrypt, validateGA4MeasurementId, validateGoogleAdsCustomerId, validateGTMContainerId, validateMerchantCenterId } from '@/lib/google-validation'

const googleConfigSchema = new mongoose.Schema({
  // GA4 (Google Analytics 4)
  ga4MeasurementId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  ga4ApiSecret: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  ga4PropertyId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  
  // Google Ads
  googleAdsCustomerId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  googleAdsDeveloperToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  googleAdsRefreshToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  googleAdsClientId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  googleAdsClientSecret: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  googleAdsTokenExpiry: {
    type: Date,
    required: false
  },
  // Google Ads Conversion Actions
  googleAdsConversions: {
    type: Map,
    of: String,
    default: new Map([
      ['purchase', ''],
      ['add_to_cart', ''],
      ['begin_checkout', ''],
      ['view_item', ''],
      ['lead', '']
    ])
  },
  
  // Merchant Center
  merchantCenterId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  merchantCenterFeedId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  
  // GTM (Google Tag Manager)
  gtmContainerId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  gtmAuth: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  gtmPreview: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  // GTM Variables
  gtmVariables: {
    type: Array,
    default: []
  },
  // Custom HTML/JavaScript Tags
  customTags: {
    type: Array,
    default: []
  },
  
  // Conversion Linker
  conversionLinkerActive: {
    type: Boolean,
    default: false
  },
  
  // Cloudinary
  cloudinaryFolderForGoogleFeeds: {
    type: String,
    default: 'google-catalog'
  },
  
  // Status flags
  isGA4Active: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  isGoogleAdsActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  isMerchantActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  isGTMActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  
  // API version
  apiVersion: {
    type: String,
    default: 'v1'
  }
}, {
  timestamps: true
})

googleConfigSchema.index({ isGA4Active: 1 })
googleConfigSchema.index({ isGoogleAdsActive: 1 })
googleConfigSchema.index({ isMerchantActive: 1 })
googleConfigSchema.index({ isGTMActive: 1 })

googleConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne()
  if (!config) {
    config = await this.create({})
  }
  return config
}

const GoogleConfigModel = (mongoose.models && mongoose.models.GoogleConfig) || mongoose.model('GoogleConfig', googleConfigSchema)
export default GoogleConfigModel
