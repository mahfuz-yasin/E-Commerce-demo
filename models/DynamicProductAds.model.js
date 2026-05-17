import mongoose from 'mongoose'

const DynamicProductAdsSchema = new mongoose.Schema({
  // Campaign Details
  campaignName: {
    type: String,
    required: true
  },
  campaignId: {
    type: String,
    required: false
  },
  adAccountId: {
    type: String,
    required: true
  },
  catalogId: {
    type: String,
    required: true
  },
  
  // Product Set Configuration
  productSetId: {
    type: String,
    required: false
  },
  productSetFilters: {
    type: {
      categories: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      inStock: Boolean,
      availability: String,
      condition: String
    },
    required: false
  },
  
  // Ad Configuration
  adFormat: {
    type: String,
    enum: ['carousel', 'single_image', 'collection', 'slideshow'],
    default: 'carousel'
  },
  adCreative: {
    primaryText: String,
    headline: String,
    description: String,
    callToAction: {
      type: String,
      enum: ['shop_now', 'buy_now', 'learn_more', 'sign_up', 'get_offer']
    }
  },
  
  // Cross-sell Configuration
  crossSellEnabled: {
    type: Boolean,
    default: false
  },
  crossSellRules: [{
    productId: String,
    relatedProducts: [String],
    ruleType: {
      type: String,
      enum: ['category', 'price', 'brand', 'manual']
    },
    maxProducts: {
      type: Number,
      default: 5
    }
  }],
  
  // Up-sell Configuration
  upSellEnabled: {
    type: Boolean,
    default: false
  },
  upSellRules: [{
    productId: String,
    upSellProducts: [String],
    ruleType: {
      type: String,
      enum: ['higher_price', 'premium', 'manual']
    },
    maxProducts: {
      type: Number,
      default: 3
    }
  }],
  
  // Price Drop Configuration
  priceDropEnabled: {
    type: Boolean,
    default: false
  },
  priceDropThreshold: {
    type: Number,
    default: 10 // percentage
  },
  priceDropMessage: {
    type: String,
    default: 'Price dropped by {percentage}%!'
  },
  
  // Back in Stock Configuration
  backInStockEnabled: {
    type: Boolean,
    default: false
  },
  backInStockMessage: {
    type: String,
    default: 'Back in stock!'
  },
  
  // Targeting
  targeting: {
    locations: [String],
    ageMin: Number,
    ageMax: Number,
    gender: String,
    interests: [String],
    behaviors: [String],
    customAudiences: [String],
    exclusions: [String]
  },
  
  // Budget & Schedule
  budget: {
    daily: Number,
    lifetime: Number
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    scheduleType: {
      type: String,
      enum: ['continuous', 'start_end', 'lifetime']
    },
    runTimes: [{
      days: [String],
      startHour: Number,
      endHour: Number
    }]
  },
  
  // Optimization
  optimizationGoal: {
    type: String,
    enum: ['conversions', 'traffic', 'impressions', 'reach', 'landing_page_views']
  },
  bidStrategy: {
    type: String,
    enum: ['lowest_cost', 'bid_cap', 'target_cost']
  },
  bidAmount: Number,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  
  // Performance Tracking
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roas: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    cpa: { type: Number, default: 0 }
  },
  
  // Sync Status
  lastSyncAt: {
    type: Date,
    default: null
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: false
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
DynamicProductAdsSchema.index({ adAccountId: 1, status: 1 })
DynamicProductAdsSchema.index({ campaignId: 1 })
DynamicProductAdsSchema.index({ status: 1, createdAt: -1 })
DynamicProductAdsSchema.index({ createdBy: 1 })

// Virtual for calculating ROAS
DynamicProductAdsSchema.virtual('calculatedROAS').get(function() {
  if (this.performance.spend > 0) {
    return this.performance.revenue / this.performance.spend
  }
  return 0
})

// Virtual for calculating CTR
DynamicProductAdsSchema.virtual('calculatedCTR').get(function() {
  if (this.performance.impressions > 0) {
    return (this.performance.clicks / this.performance.impressions) * 100
  }
  return 0
})

// Virtual for calculating CPC
DynamicProductAdsSchema.virtual('calculatedCPC').get(function() {
  if (this.performance.clicks > 0) {
    return this.performance.spend / this.performance.clicks
  }
  return 0
})

// Virtual for calculating CPA
DynamicProductAdsSchema.virtual('calculatedCPA').get(function() {
  if (this.performance.conversions > 0) {
    return this.performance.spend / this.performance.conversions
  }
  return 0
})

const DynamicProductAdsModel = (mongoose.models && mongoose.models.DynamicProductAds) || mongoose.model('DynamicProductAds', DynamicProductAdsSchema)

export default DynamicProductAdsModel
