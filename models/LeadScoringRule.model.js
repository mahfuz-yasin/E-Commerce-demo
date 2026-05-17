import mongoose from 'mongoose'

const LeadScoringRuleSchema = new mongoose.Schema({
  // Rule Details
  ruleName: {
    type: String,
    required: true
  },
  ruleType: {
    type: String,
    enum: ['demographic', 'behavioral', 'engagement', 'custom'],
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  
  // Scoring Criteria
  scoringCriteria: [{
    criterionId: {
      type: String,
      required: true
    },
    criterionName: {
      type: String,
      required: true
    },
    criterionType: {
      type: String,
      enum: ['demographic', 'behavioral', 'engagement', 'custom_field'],
      required: true
    },
    field: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'between', 'in_list', 'not_in_list'],
      required: true
    },
    value: mongoose.Schema.Types.Mixed,
    value2: mongoose.Schema.Types.Mixed, // For 'between' operator
    points: {
      type: Number,
      required: true,
      default: 10
    },
    weight: {
      type: Number,
      default: 1
    },
    required: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Score Thresholds
  scoreThresholds: [{
    thresholdName: {
      type: String,
      enum: ['hot', 'warm', 'cold'],
      required: true
    },
    minScore: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    action: String,
    assignTo: String,
    autoResponse: String
  }],
  
  // Demographic Criteria
  demographicCriteria: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: [String],
    location: [String],
    language: [String]
  },
  
  // Behavioral Criteria
  behavioralCriteria: {
    pageViews: {
      min: Number,
      max: Number
    },
    timeOnSite: {
      min: Number,
      max: Number
    },
    sessions: {
      min: Number,
      max: Number
    },
    lastActivityDays: Number
  },
  
  // Engagement Criteria
  engagementCriteria: {
    messageCount: {
      min: Number,
      max: Number
    },
    responseRate: {
      min: Number,
      max: Number
    },
    clicks: {
      min: Number,
      max: Number
    },
    shares: {
      min: Number,
      max: Number
    }
  },
  
  // Auto-Scoring
  autoScore: {
    type: Boolean,
    default: true
  },
  scoringInterval: {
    type: Number,
    default: 24 // hours
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Facebook Sync
  facebookRuleId: String,
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
  
  // Performance Tracking
  performance: {
    totalLeadsScored: { type: Number, default: 0 },
    hotLeads: { type: Number, default: 0 },
    warmLeads: { type: Number, default: 0 },
    coldLeads: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Analytics
  analytics: [{
    date: Date,
    leadsScored: Number,
    hotLeads: Number,
    warmLeads: Number,
    coldLeads: Number,
    avgScore: Number
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
LeadScoringRuleSchema.index({ pageId: 1, status: 1 })
LeadScoringRuleSchema.index({ ruleType: 1 })
LeadScoringRuleSchema.index({ status: 1, lastSyncAt: -1 })
LeadScoringRuleSchema.index({ createdBy: 1 })

// Virtual for calculating total max score
LeadScoringRuleSchema.virtual('maxScore').get(function() {
  return this.scoringCriteria.reduce((sum, criterion) => sum + (criterion.points * criterion.weight), 0)
})

const LeadScoringRuleModel = (mongoose.models && mongoose.models.LeadScoringRule) || mongoose.model('LeadScoringRule', LeadScoringRuleSchema)

export default LeadScoringRuleModel
