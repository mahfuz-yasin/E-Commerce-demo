import mongoose from 'mongoose'

const AttributionModelSchema = new mongoose.Schema({
  // Model Details
  modelName: {
    type: String,
    required: true
  },
  modelType: {
    type: String,
    enum: ['first_click', 'last_click', 'linear', 'time_decay', 'position_based', 'custom'],
    required: true
  },
  adAccountId: {
    type: String,
    required: true
  },
  
  // First Click Model
  firstClickConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    creditPercentage: {
      type: Number,
      default: 100
    }
  },
  
  // Last Click Model
  lastClickConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    creditPercentage: {
      type: Number,
      default: 100
    }
  },
  
  // Linear Model
  linearConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    equalDistribution: {
      type: Boolean,
      default: true
    },
    minTouchpoints: {
      type: Number,
      default: 1
    }
  },
  
  // Time Decay Model
  timeDecayConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    decayRate: {
      type: Number,
      default: 0.5
    },
    halfLife: {
      type: Number, // days
      default: 7
    }
  },
  
  // Position Based Model
  positionBasedConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    firstTouchCredit: {
      type: Number,
      default: 40
    },
    lastTouchCredit: {
      type: Number,
      default: 40
    },
    middleTouchCredit: {
      type: Number,
      default: 20
    }
  },
  
  // Custom Model
  customConfig: {
    lookbackWindow: {
      type: Number, // days
      default: 30
    },
    touchpointRules: [{
      touchpointType: {
        type: String,
        enum: ['facebook', 'google', 'email', 'direct', 'organic', 'referral', 'social', 'other']
      },
      position: {
        type: String,
        enum: ['first', 'last', 'middle', 'any']
      },
      creditPercentage: {
        type: Number,
        required: true
      },
      multiplier: {
        type: Number,
        default: 1
      }
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Default Model
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Performance Tracking
  performance: {
    totalConversions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    attributedConversions: { type: Number, default: 0 },
    attributedRevenue: { type: Number, default: 0 },
    avgAttributionRate: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Comparison with other models
  comparisonData: [{
    modelId: String,
    modelName: String,
    attributionDifference: Number,
    revenueDifference: Number,
    calculatedAt: Date
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
AttributionModelSchema.index({ adAccountId: 1, status: 1 })
AttributionModelSchema.index({ modelType: 1 })
AttributionModelSchema.index({ status: 1, isDefault: -1 })
AttributionModelSchema.index({ createdBy: 1 })

// Virtual for calculating attribution rate
AttributionModelSchema.virtual('attributionRate').get(function() {
  if (this.performance.totalConversions > 0) {
    return (this.performance.attributedConversions / this.performance.totalConversions) * 100
  }
  return 0
})

// Virtual for checking if model is ready for comparison
AttributionModelSchema.virtual('canCompare').get(function() {
  return this.performance.totalConversions >= 100
})

const AttributionModelModel = (mongoose.models && mongoose.models.AttributionModel) || mongoose.model('AttributionModel', AttributionModelSchema)

export default AttributionModelModel
