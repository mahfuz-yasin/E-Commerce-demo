import mongoose from 'mongoose'

const tikTokWebhookLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true
  },
  eventData: {
    type: Object,
    required: true
  },
  signature: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  processed: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    required: false
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
})

tikTokWebhookLogSchema.index({ eventType: 1 })
tikTokWebhookLogSchema.index({ verified: 1 })
tikTokWebhookLogSchema.index({ processed: 1 })
tikTokWebhookLogSchema.index({ createdAt: -1 })

const TikTokWebhookLogModel = (mongoose.models && mongoose.models.TikTokWebhookLog) || mongoose.model('TikTokWebhookLog', tikTokWebhookLogSchema)

export default TikTokWebhookLogModel
