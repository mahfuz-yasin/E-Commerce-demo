import mongoose from 'mongoose'

const PerformanceMetricsSchema = new mongoose.Schema({
  // Campaign Details
  campaignId: {
    type: String,
    required: false
  },
  campaignName: {
    type: String,
    required: false
  },
  adAccountId: {
    type: String,
    required: true
  },
  
  // ROAS Metrics
  roas: {
    type: Number,
    default: 0
  },
  roasTarget: {
    type: Number,
    required: false
  },
  revenue: {
    type: Number,
    default: 0
  },
  spend: {
    type: Number,
    default: 0
  },
  
  // CAC Metrics
  cac: {
    type: Number,
    default: 0
  },
  cacTarget: {
    type: Number,
    required: false
  },
  conversions: {
    type: Number,
    default: 0
  },
  costPerConversion: {
    type: Number,
    default: 0
  },
  
  // LTV Metrics
  ltv: {
    type: Number,
    default: 0
  },
  ltvTarget: {
    type: Number,
    required: false
  },
  totalCustomerValue: {
    type: Number,
    default: 0
  },
  repeatPurchaseRate: {
    type: Number,
    default: 0
  },
  avgOrderValue: {
    type: Number,
    default: 0
  },
  
  // Cohort Analysis
  cohortId: String,
  cohortSize: {
    type: Number,
    default: 0
  },
  cohortLTV: {
    type: Number,
    default: 0
  },
  cohortRetention: {
    type: Number,
    default: 0
  },
  
  // Additional Metrics
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  ctr: {
    type: Number,
    default: 0
  },
  cpc: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  
  // Time Period
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'daily'
  },
  
  // Status
  status: {
    type: String,
    enum: ['calculated', 'pending', 'failed'],
    default: 'pending'
  },
  
  // Comparison
  previousPeriodMetrics: {
    roas: Number,
    cac: Number,
    ltv: Number,
    conversions: Number,
    revenue: Number
  },
  comparison: {
    roasChange: Number,
    roasChangePercent: Number,
    cacChange: Number,
    cacChangePercent: Number,
    ltvChange: Number,
    ltvChangePercent: Number
  },
  
  // Alerts
  alerts: [{
    type: {
      type: String,
      enum: ['roas_below_target', 'cac_above_target', 'ltv_below_target', 'performance_drop', 'performance_improvement']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    message: String,
    triggeredAt: Date,
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  
  // Metadata
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
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
PerformanceMetricsSchema.index({ adAccountId: 1, periodStart: -1 })
PerformanceMetricsSchema.index({ campaignId: 1, periodStart: -1 })
PerformanceMetricsSchema.index({ cohortId: 1, periodStart: -1 })
PerformanceMetricsSchema.index({ periodType: 1, periodStart: -1 })

// Virtual for checking if metrics meet targets
PerformanceMetricsSchema.virtual('meetsROASTarget').get(function() {
  if (!this.roasTarget) return null
  return this.roas >= this.roasTarget
})

PerformanceMetricsSchema.virtual('meetsCACTarget').get(function() {
  if (!this.cacTarget) return null
  return this.cac <= this.cacTarget
})

PerformanceMetricsSchema.virtual('meetsLTVTarget').get(function() {
  if (!this.ltvTarget) return null
  return this.ltv >= this.ltvTarget
})

// Virtual for overall performance score
PerformanceMetricsSchema.virtual('performanceScore').get(function() {
  let score = 0
  let maxScore = 0
  
  if (this.roasTarget) {
    maxScore += 33
    score += (this.roas / this.roasTarget) * 33
  }
  
  if (this.cacTarget) {
    maxScore += 33
    score += (this.cacTarget / this.cac) * 33
  }
  
  if (this.ltvTarget) {
    maxScore += 34
    score += (this.ltv / this.ltvTarget) * 34
  }
  
  return maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0
})

const PerformanceMetricsModel = (mongoose.models && mongoose.models.PerformanceMetrics) || mongoose.model('PerformanceMetrics', PerformanceMetricsSchema)

export default PerformanceMetricsModel
