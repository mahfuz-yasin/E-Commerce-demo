import mongoose from 'mongoose'

const BudgetOptimizationRuleSchema = new mongoose.Schema({
  // Rule Details
  ruleName: {
    type: String,
    required: true
  },
  ruleType: {
    type: String,
    enum: ['roas_based', 'cpa_based', 'performance_based', 'time_based'],
    required: true
  },
  adAccountId: {
    type: String,
    required: true
  },
  campaignIds: [String],
  
  // ROAS Based Rules
  roasTarget: {
    type: Number,
    required: false
  },
  roasIncreasePercentage: {
    type: Number,
    default: 20
  },
  roasDecreasePercentage: {
    type: Number,
    default: 20
  },
  
  // CPA Based Rules
  cpaTarget: {
    type: Number,
    required: false
  },
  cpaIncreasePercentage: {
    type: Number,
    default: 20
  },
  cpaDecreasePercentage: {
    type: Number,
    default: 20
  },
  
  // Performance Based Rules
  performanceMetric: {
    type: String,
    enum: ['impressions', 'clicks', 'conversions', 'ctr']
  },
  performanceThreshold: {
    type: Number,
    required: false
  },
  performanceAction: {
    type: String,
    enum: ['increase_budget', 'decrease_budget', 'pause_campaign', 'enable_campaign']
  },
  performancePercentage: {
    type: Number,
    default: 20
  },
  
  // Budget Limits
  minimumBudget: {
    type: Number,
    required: false
  },
  maximumBudget: {
    type: Number,
    required: false
  },
  dailyBudgetCap: {
    type: Number,
    required: false
  },
  lifetimeBudgetCap: {
    type: Number,
    required: false
  },
  
  // Schedule
  checkInterval: {
    type: Number,
    default: 3 // hours
  },
  activeHours: {
    type: [{
      day: String,
      startHour: Number,
      endHour: Number
    }],
    required: false
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Execution History
  lastExecutedAt: {
    type: Date,
    default: null
  },
  executionCount: {
    type: Number,
    default: 0
  },
  totalBudgetIncreased: {
    type: Number,
    default: 0
  },
  totalBudgetDecreased: {
    type: Number,
    default: 0
  },
  
  // Notifications
  notifyOnExecution: {
    type: Boolean,
    default: true
  },
  notifyEmail: String,
  
  // Sync Status
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
BudgetOptimizationRuleSchema.index({ adAccountId: 1, status: 1 })
BudgetOptimizationRuleSchema.index({ ruleType: 1 })
BudgetOptimizationRuleSchema.index({ status: 1, lastExecutedAt: -1 })
BudgetOptimizationRuleSchema.index({ createdBy: 1 })

// Virtual for calculating next execution time
BudgetOptimizationRuleSchema.virtual('nextExecutionAt').get(function() {
  if (this.lastExecutedAt) {
    const nextExecution = new Date(this.lastExecutedAt)
    nextExecution.setHours(nextExecution.getHours() + this.checkInterval)
    return nextExecution
  }
  return new Date()
})

// Virtual for checking if rule should execute
BudgetOptimizationRuleSchema.virtual('shouldExecute').get(function() {
  if (this.status !== 'active') return false
  
  const now = new Date()
  const nextExecution = this.nextExecutionAt
  
  if (now < nextExecution) return false
  
  // Check active hours if specified
  if (this.activeHours && this.activeHours.length > 0) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentHour = now.getHours()
    
    const isActiveHour = this.activeHours.some(hour => {
      return hour.day === currentDay && currentHour >= hour.startHour && currentHour < hour.endHour
    })
    
    if (!isActiveHour) return false
  }
  
  return true
})

const BudgetOptimizationRuleModel = (mongoose.models && mongoose.models.BudgetOptimizationRule) || mongoose.model('BudgetOptimizationRule', BudgetOptimizationRuleSchema)

export default BudgetOptimizationRuleModel
