import mongoose from 'mongoose'

const AbandonedCartRecoverySchema = new mongoose.Schema({
  // Campaign Details
  campaignName: {
    type: String,
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  adAccountId: {
    type: String,
    required: false
  },
  
  // Trigger Configuration
  triggerType: {
    type: String,
    enum: ['time_based', 'behavior_based', 'hybrid'],
    default: 'time_based'
  },
  triggerDelayMinutes: {
    type: Number,
    default: 60 // 1 hour default
  },
  minCartValue: {
    type: Number,
    required: false
  },
  maxCartValue: {
    type: Number,
    required: false
  },
  minItems: {
    type: Number,
    default: 1
  },
  
  // Message Sequence
  messageSequence: [{
    sequenceId: {
      type: String,
      required: true
    },
    delayMinutes: {
      type: Number,
      default: 0
    },
    messageType: {
      type: String,
      enum: ['text', 'template', 'media', 'carousel'],
      default: 'text'
    },
    text: String,
    templateId: String,
    templateData: mongoose.Schema.Types.Mixed,
    mediaType: {
      type: String,
      enum: ['image', 'video']
    },
    mediaUrl: String,
    carouselItems: [{
      title: String,
      description: String,
      imageUrl: String,
      defaultAction: {
        type: String,
        url: String
      },
      buttons: [{
        type: String,
        title: String,
        url: String,
        payload: String
      }]
    }],
    buttons: [{
      type: {
        type: String,
        enum: ['url', 'postback', 'quick_reply']
      },
      title: String,
      url: String,
      payload: String
    }],
    quickReplies: [{
      title: String,
      payload: String
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Offer Configuration
  offerEnabled: {
    type: Boolean,
    default: false
  },
  offerType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'free_gift']
  },
  offerValue: Number,
  offerCode: String,
  offerExpirationHours: Number,
  minPurchaseAmount: Number,
  
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'returning_users', 'high_value', 'custom']
  },
  excludePurchasedUsers: {
    type: Boolean,
    default: true
  },
  purchaseExclusionDays: {
    type: Number,
    default: 30
  },
  
  // Frequency Control
  frequencyControl: {
    enabled: {
      type: Boolean,
      default: false
    },
    maxMessagesPerUser: {
      type: Number,
      default: 3
    },
    cooldownDays: {
      type: Number,
      default: 7
    }
  },
  
  // Time Windows
  timeWindows: [{
    dayOfWeek: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6]
    },
    startHour: {
      type: Number,
      default: 9
    },
    endHour: {
      type: Number,
      default: 21
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  
  // Facebook Sync
  facebookCampaignId: String,
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
    totalAbandonedCarts: { type: Number, default: 0 },
    totalMessagesSent: { type: Number, default: 0 },
    totalRecoveredCarts: { type: Number, default: 0 },
    totalRecoveredRevenue: { type: Number, default: 0 },
    recoveryRate: { type: Number, default: 0 },
    avgRecoveryTime: { type: Number, default: 0 },
    offerRedemptions: { type: Number, default: 0 }
  },
  lastPerformanceUpdate: {
    type: Date,
    default: null
  },
  
  // Analytics
  analytics: [{
    date: Date,
    abandonedCarts: Number,
    messagesSent: Number,
    recoveredCarts: Number,
    recoveredRevenue: Number
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
AbandonedCartRecoverySchema.index({ pageId: 1, status: 1 })
AbandonedCartRecoverySchema.index({ status: 1, lastSyncAt: -1 })
AbandonedCartRecoverySchema.index({ createdBy: 1 })

// Virtual for calculating recovery rate
AbandonedCartRecoverySchema.virtual('calculatedRecoveryRate').get(function() {
  if (this.performance.totalAbandonedCarts > 0) {
    return (this.performance.totalRecoveredCarts / this.performance.totalAbandonedCarts) * 100
  }
  return 0
})

const AbandonedCartRecoveryModel = (mongoose.models && mongoose.models.AbandonedCartRecovery) || mongoose.model('AbandonedCartRecovery', AbandonedCartRecoverySchema)

export default AbandonedCartRecoveryModel
