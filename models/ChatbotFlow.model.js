import mongoose from 'mongoose'

const ChatbotFlowSchema = new mongoose.Schema({
  // Flow Details
  flowName: {
    type: String,
    required: true
  },
  flowType: {
    type: String,
    enum: ['customer_support', 'sales', 'lead_generation', 'order_tracking', 'product_recommendation', 'custom'],
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  
  // Flow Configuration
  welcomeMessage: {
    type: String,
    required: true
  },
  welcomeButtons: [{
    type: {
      type: String,
      enum: ['quick_reply', 'url_button', 'call_button', 'postback_button']
    },
    title: {
      type: String,
      required: true
    },
    payload: String,
    url: String,
    phoneNumber: String
  }],
  
  // Conversation Steps
  steps: [{
    stepId: {
      type: String,
      required: true
    },
    stepName: {
      type: String,
      required: true
    },
    stepType: {
      type: String,
      enum: ['message', 'question', 'menu', 'input', 'action', 'condition', 'handoff'],
      required: true
    },
    content: {
      type: String,
      required: false
    },
    buttons: [{
      type: {
        type: String,
        enum: ['quick_reply', 'url_button', 'call_button', 'postback_button']
      },
      title: String,
      payload: String,
      url: String,
      phoneNumber: String,
      nextStepId: String
    }],
    nextStepId: String,
    condition: {
      type: String,
      enum: ['equals', 'contains', 'starts_with', 'regex']
    },
    conditionValue: String,
    trueStepId: String,
    falseStepId: String,
    actionType: {
      type: String,
      enum: ['send_email', 'create_lead', 'update_order', 'get_product', 'get_order', 'handoff_to_agent']
    },
    actionData: mongoose.Schema.Types.Mixed,
    required: {
      type: Boolean,
      default: false
    },
    validation: {
      type: {
        type: String,
        enum: ['email', 'phone', 'number', 'text', 'date']
      },
      errorMessage: String
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // AI Configuration
  aiEnabled: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    enum: ['gpt-3.5-turbo', 'gpt-4', 'claude', 'custom'],
    required: false
  },
  aiSystemPrompt: String,
  aiTemperature: {
    type: Number,
    default: 0.7
  },
  aiMaxTokens: {
    type: Number,
    default: 500
  },
  
  // NLP Configuration
  nlpEnabled: {
    type: Boolean,
    default: false
  },
  intents: [{
    intentName: String,
    trainingPhrases: [String],
    responses: [String],
    action: String,
    parameters: [{
      name: String,
      type: String,
      required: Boolean
    }]
  }],
  entities: [{
    entityName: String,
    entityType: String,
    values: [{
      value: String,
      synonyms: [String]
    }]
  }],
  
  // Handoff Configuration
  handoffEnabled: {
    type: Boolean,
    default: false
  },
  handoffConditions: [{
    type: {
      type: String,
      enum: ['intent', 'keyword', 'sentiment', 'complexity']
    },
    value: String,
    threshold: Number
  }],
  handoffMessage: String,
  
  // Fallback Configuration
  fallbackMessage: {
    type: String,
    default: "I'm sorry, I didn't understand. Can you please rephrase?"
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Facebook Sync
  facebookFlowId: String,
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
    totalConversations: { type: Number, default: 0 },
    completedConversations: { type: Number, default: 0 },
    handedOffConversations: { type: Number, default: 0 },
    avgConversationDuration: { type: Number, default: 0 },
    userSatisfaction: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Analytics
  analytics: [{
    date: Date,
    conversations: Number,
    completed: Number,
    handedOff: Number,
    avgDuration: Number
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
ChatbotFlowSchema.index({ pageId: 1, status: 1 })
ChatbotFlowSchema.index({ flowType: 1 })
ChatbotFlowSchema.index({ status: 1, lastSyncAt: -1 })
ChatbotFlowSchema.index({ createdBy: 1 })

// Virtual for calculating completion rate
ChatbotFlowSchema.virtual('completionRate').get(function() {
  if (this.performance.totalConversations > 0) {
    return (this.performance.completedConversations / this.performance.totalConversations) * 100
  }
  return 0
})

// Virtual for calculating handoff rate
ChatbotFlowSchema.virtual('handoffRate').get(function() {
  if (this.performance.totalConversations > 0) {
    return (this.performance.handedOffConversations / this.performance.totalConversations) * 100
  }
  return 0
})

const ChatbotFlowModel = (mongoose.models && mongoose.models.ChatbotFlow) || mongoose.model('ChatbotFlow', ChatbotFlowSchema)

export default ChatbotFlowModel
