import mongoose from 'mongoose'

const RetargetingRuleSchema = new mongoose.Schema({
  // Rule Details
  ruleName: {
    type: String,
    required: true
  },
  ruleType: {
    type: String,
    enum: ['viewed_products', 'added_to_cart', 'purchased', 'browse_abandonment', 'cart_abandonment'],
    required: true
  },
  adAccountId: {
    type: String,
    required: true
  },
  campaignId: {
    type: String,
    required: false
  },
  
  // Viewed Products Rules
  viewedProductsRules: {
    timeRange: {
      type: Number, // days
      default: 30
    },
    minViews: {
      type: Number,
      default: 1
    },
    excludePurchased: {
      type: Boolean,
      default: true
    },
    purchaseExclusionDays: {
      type: Number,
      default: 30
    }
  },
  
  // Added to Cart Rules
  addedToCartRules: {
    timeRange: {
      type: Number, // days
      default: 7
    },
    excludePurchased: {
      type: Boolean,
      default: true
    },
    purchaseExclusionDays: {
      type: Number,
      default: 30
    }
  },
  
  // Purchased Rules
  purchasedRules: {
    timeRange: {
      type: Number, // days
      default: 90
    },
    minPurchaseAmount: {
      type: Number,
      required: false
    },
    maxPurchaseAmount: {
      type: Number,
      required: false
    },
    includeRepeatPurchasers: {
      type: Boolean,
      default: true
    }
  },
  
  // Browse Abandonment Rules
  browseAbandonmentRules: {
    timeOnSiteThreshold: {
      type: Number, // seconds
      default: 30
    },
    pageViewsThreshold: {
      type: Number,
      default: 2
    },
    timeRange: {
      type: Number, // days
      default: 7
    }
  },
  
  // Cart Abandonment Rules
  cartAbandonmentRules: {
    timeRange: {
      type: Number, // days
      default: 7
    },
    minCartValue: {
      type: Number,
      required: false
    },
    maxCartValue: {
      type: Number,
      required: false
    },
    excludePurchased: {
      type: Boolean,
      default: true
    }
  },
  
  // Targeting Options
  frequencyCap: {
    type: Number,
    default: 3 // impressions per week
  },
  frequencyPeriod: {
    type: String,
    enum: ['day', 'week', 'month'],
    default: 'week'
  },
  
  // Exclusions
  exclusionAudiences: [String],
  exclusionRules: [{
    type: {
      type: String,
      enum: ['purchased_recently', 'high_value_customer', 'inactive_user', 'custom']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Facebook Sync
  facebookAudienceId: String,
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed', 'syncing'],
    default: 'pending'
  },
  lastSyncAt: {
    type: Date,
    default: null
  },
  syncError: String,
  
  // Size Tracking
  estimatedSize: {
    type: Number,
    default: 0
  },
  actualSize: {
    type: Number,
    default: 0
  },
  lastSizeUpdate: {
    type: Date,
    default: null
  },
  
  // Performance Tracking
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roas: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Auto Refresh
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 24 // hours
  },
  lastRefreshAt: {
    type: Date,
    default: null
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
RetargetingRuleSchema.index({ adAccountId: 1, status: 1 })
RetargetingRuleSchema.index({ ruleType: 1 })
RetargetingRuleSchema.index({ status: 1, lastSyncAt: -1 })
RetargetingRuleSchema.index({ createdBy: 1 })

// Virtual for checking if rule needs refresh
RetargetingRuleSchema.virtual('needsRefresh').get(function() {
  if (!this.autoRefresh || this.status !== 'active') return false
  
  if (!this.lastRefreshAt) return true
  
  const hoursSinceRefresh = (new Date() - this.lastRefreshAt) / (1000 * 60 * 60)
  return hoursSinceRefresh >= this.refreshInterval
})

// Virtual for calculating sync age
RetargetingRuleSchema.virtual('syncAge').get(function() {
  if (!this.lastSyncAt) return null
  const hours = (new Date() - this.lastSyncAt) / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
})

const RetargetingRuleModel = (mongoose.models && mongoose.models.RetargetingRule) || mongoose.model('RetargetingRule', RetargetingRuleSchema)

export default RetargetingRuleModel
