import mongoose from 'mongoose'

const CustomAudienceSegmentSchema = new mongoose.Schema({
  // Segment Details
  segmentName: {
    type: String,
    required: true
  },
  segmentType: {
    type: String,
    enum: ['behavioral', 'demographic', 'purchase_history', 'custom_rule'],
    required: true
  },
  adAccountId: {
    type: String,
    required: true
  },
  
  // Behavioral Segmentation
  behavioralRules: [{
    type: {
      type: String,
      enum: ['page_view', 'add_to_cart', 'purchase', 'view_content', 'search', 'time_on_site']
    },
    timeRange: {
      type: Number, // days
      required: false
    },
    minOccurrences: {
      type: Number,
      default: 1
    },
    maxOccurrences: {
      type: Number,
      required: false
    }
  }],
  
  // Demographic Segmentation
  demographicRules: {
    ageMin: Number,
    ageMax: Number,
    gender: String,
    locations: [String],
    languages: [String],
    deviceTypes: [String]
  },
  
  // Purchase History Segmentation
  purchaseRules: [{
    productCategories: [String],
    minPurchaseAmount: Number,
    maxPurchaseAmount: Number,
    purchaseCount: {
      min: Number,
      max: Number
    },
    lastPurchaseRange: {
      type: Number // days
    },
    totalSpentRange: {
      min: Number,
      max: Number
    },
    avgOrderValueRange: {
      min: Number,
      max: Number
    }
  }],
  
  // Custom Rule Segmentation
  customRules: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in']
    },
    value: mongoose.Schema.Types.Mixed,
    logicalOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    }
  }],
  
  // Targeting Options
  excludeExistingCustomers: {
    type: Boolean,
    default: false
  },
  excludeRecentlyPurchased: {
    type: Boolean,
    default: false
  },
  recentPurchaseDays: {
    type: Number,
    default: 30
  },
  excludeHighValueCustomers: {
    type: Boolean,
    default: false
  },
  highValueThreshold: {
    type: Number,
    default: 500
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
  
  // Size Estimation
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
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
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
  
  // Usage Tracking
  usedInCampaigns: [{
    campaignId: String,
    campaignName: String,
    usedAt: Date
  }],
  
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
CustomAudienceSegmentSchema.index({ adAccountId: 1, status: 1 })
CustomAudienceSegmentSchema.index({ segmentType: 1 })
CustomAudienceSegmentSchema.index({ status: 1, lastSyncAt: -1 })
CustomAudienceSegmentSchema.index({ createdBy: 1 })

// Virtual for checking if segment needs refresh
CustomAudienceSegmentSchema.virtual('needsRefresh').get(function() {
  if (!this.autoRefresh || this.status !== 'active') return false
  
  if (!this.lastRefreshAt) return true
  
  const hoursSinceRefresh = (new Date() - this.lastRefreshAt) / (1000 * 60 * 60)
  return hoursSinceRefresh >= this.refreshInterval
})

// Virtual for calculating sync age
CustomAudienceSegmentSchema.virtual('syncAge').get(function() {
  if (!this.lastSyncAt) return null
  const hours = (new Date() - this.lastSyncAt) / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
})

const CustomAudienceSegmentModel = (mongoose.models && mongoose.models.CustomAudienceSegment) || mongoose.model('CustomAudienceSegment', CustomAudienceSegmentSchema)

export default CustomAudienceSegmentModel
