import mongoose from 'mongoose'

const adAutomationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  },
  // Rule conditions
  conditions: [{
    type: {
      type: String,
      enum: ['spend', 'roas', 'purchases', 'clicks', 'impressions', 'ctr', 'cpc'],
      required: true
    },
    operator: {
      type: String,
      enum: ['>', '<', '>=', '<=', '==', '!='],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timeRange: {
      type: String,
      enum: ['1h', '3h', '6h', '12h', '24h', '3d', '7d'],
      default: '24h'
    }
  }],
  // Rule actions
  actions: [{
    type: {
      type: String,
      enum: ['pause_campaign', 'pause_adset', 'increase_budget', 'decrease_budget', 'send_alert'],
      required: true
    },
    targetId: {
      type: String,
      required: false // For specific campaign/adset targeting
    },
    budgetPercentage: {
      type: Number,
      required: false // For budget adjustment actions
    },
    alertMessage: {
      type: String,
      required: false // For alert actions
    }
  }],
  // Rule metadata
  lastExecuted: {
    type: Date,
    default: null
  },
  executionCount: {
    type: Number,
    default: 0
  },
  // Apply to all campaigns or specific ones
  applyToAll: {
    type: Boolean,
    default: true
  },
  targetCampaigns: [{
    type: String
  }],
  applyToAdSets: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

adAutomationRuleSchema.index({ status: 1, lastExecuted: 1 })
adAutomationRuleSchema.index({ status: 1, name: 1 })

const AdAutomationRuleModel = mongoose.models.AdAutomationRule || mongoose.model('AdAutomationRule', adAutomationRuleSchema, 'adAutomationRules')
export default AdAutomationRuleModel
