import mongoose from 'mongoose'

const AutoResponseSchema = new mongoose.Schema({
  // Response Details
  responseName: {
    type: String,
    required: true
  },
  responseType: {
    type: String,
    enum: ['keyword', 'intent', 'event_based', 'time_based', 'condition_based'],
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  
  // Trigger Configuration
  triggerType: {
    type: String,
    enum: ['keyword', 'keyword_any', 'keyword_all', 'regex', 'event', 'time', 'condition'],
    required: true
  },
  keywords: [String],
  keywordMatchType: {
    type: String,
    enum: ['exact', 'contains', 'starts_with', 'ends_with'],
    default: 'contains'
  },
  regexPattern: String,
  eventType: {
    type: String,
    enum: ['message_received', 'postback', 'quick_reply', 'referral', 'opt_in', 'opt_out', 'payment']
  },
  schedule: {
    type: String,
    enum: ['immediate', 'delayed', 'scheduled']
  },
  delayMinutes: {
    type: Number,
    default: 0
  },
  scheduledTime: Date,
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Response Content
  responseType: {
    type: String,
    enum: ['text', 'template', 'media', 'quick_reply', 'button', 'carousel']
  },
  text: String,
  templateId: String,
  templateData: mongoose.Schema.Types.Mixed,
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'file']
  },
  mediaUrl: String,
  buttons: [{
    type: {
      type: String,
      enum: ['url', 'postback', 'call', 'quick_reply']
    },
    title: String,
    url: String,
    payload: String,
    phoneNumber: String
  }],
  quickReplies: [{
    contentType: {
      type: String,
      enum: ['text', 'user_email', 'user_phone_number', 'location']
    },
    title: String,
    payload: String,
    imageUrl: String
  }],
  
  // Condition-Based Rules
  conditions: [{
    field: {
      type: String,
      enum: ['user_tag', 'custom_field', 'conversation_count', 'last_active', 'time_of_day', 'day_of_week']
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'returning_users', 'specific_segment', 'custom']
  },
  audienceSegmentId: String,
  customTargeting: {
    tags: [String],
    minConversationCount: Number,
    maxConversationCount: Number,
    lastActiveAfter: Date,
    lastActiveBefore: Date
  },
  
  // Frequency Control
  frequencyControl: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['once_per_user', 'once_per_conversation', 'daily_limit', 'weekly_limit']
    },
    limit: Number,
    cooldownMinutes: Number
  },
  
  // Fallback
  fallbackResponse: String,
  noMatchResponse: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Facebook Sync
  facebookResponseId: String,
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
    totalTriggers: { type: Number, default: 0 },
    totalResponses: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    userEngagement: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Analytics
  analytics: [{
    date: Date,
    triggers: Number,
    responses: Number,
    engagement: Number
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
AutoResponseSchema.index({ pageId: 1, status: 1 })
AutoResponseSchema.index({ responseType: 1 })
AutoResponseSchema.index({ status: 1, lastSyncAt: -1 })
AutoResponseSchema.index({ createdBy: 1 })

// Virtual for calculating response rate
AutoResponseSchema.virtual('calculatedResponseRate').get(function() {
  if (this.performance.totalTriggers > 0) {
    return (this.performance.totalResponses / this.performance.totalTriggers) * 100
  }
  return 0
})

const AutoResponseModel = (mongoose.models && mongoose.models.AutoResponse) || mongoose.model('AutoResponse', AutoResponseSchema)

export default AutoResponseModel
