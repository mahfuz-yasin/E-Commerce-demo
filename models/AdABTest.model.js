import mongoose from 'mongoose'

const AdABTestSchema = new mongoose.Schema({
  // Test Details
  testName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['creative', 'audience', 'budget', 'placement'],
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
  
  // Test Configuration
  variants: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'carousel', 'single_image', 'collection'],
      required: false
    },
    creative: {
      primaryText: String,
      headline: String,
      description: String,
      callToAction: String,
      imageUrl: String,
      videoUrl: String
    },
    audience: {
      type: String,
      enum: ['custom', 'lookalike', 'interest', 'behavior']
    },
    audienceId: String,
    budget: Number,
    placement: [String]
  }],
  
  // Test Settings
  duration: {
    type: Number,
    default: 7 // days
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  autoWinnerSelection: {
    type: Boolean,
    default: true
  },
  winnerCriteria: {
    type: String,
    enum: ['roas', 'cpa', 'ctr', 'conversions'],
    default: 'roas'
  },
  minimumSampleSize: {
    type: Number,
    default: 1000
  },
  confidenceLevel: {
    type: Number,
    default: 95
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Results
  results: [{
    variantId: String,
    variantName: String,
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roas: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    cpa: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    statisticalSignificance: Boolean,
    pValue: Number,
    confidenceInterval: {
      lower: Number,
      upper: Number
    }
  }],
  
  // Winner Selection
  winner: {
    variantId: String,
    variantName: String,
    reason: String,
    selectedAt: Date,
    applied: {
      type: Boolean,
      default: false
    }
  },
  
  // Sync Status
  facebookTestId: String,
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  lastSyncAt: {
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
AdABTestSchema.index({ adAccountId: 1, status: 1 })
AdABTestSchema.index({ campaignId: 1 })
AdABTestSchema.index({ status: 1, startDate: -1 })
AdABTestSchema.index({ createdBy: 1 })

// Virtual for calculating test duration
AdABTestSchema.virtual('testDuration').get(function() {
  if (this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))
  }
  return Math.ceil((new Date() - this.startDate) / (1000 * 60 * 60 * 24))
})

// Virtual for checking if test is complete
AdABTestSchema.virtual('isComplete').get(function() {
  if (this.endDate) {
    return new Date() >= this.endDate
  }
  return false
})

// Virtual for getting total impressions across all variants
AdABTestSchema.virtual('totalImpressions').get(function() {
  return this.results.reduce((sum, r) => sum + (r.impressions || 0), 0)
})

// Virtual for getting total spend across all variants
AdABTestSchema.virtual('totalSpend').get(function() {
  return this.results.reduce((sum, r) => sum + (r.spend || 0), 0)
})

// Virtual for getting total conversions across all variants
AdABTestSchema.virtual('totalConversions').get(function() {
  return this.results.reduce((sum, r) => sum + (r.conversions || 0), 0)
})

const AdABTestModel = (mongoose.models && mongoose.models.AdABTest) || mongoose.model('AdABTest', AdABTestSchema)

export default AdABTestModel
