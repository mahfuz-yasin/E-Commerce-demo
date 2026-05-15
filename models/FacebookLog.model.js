import mongoose from 'mongoose'

const facebookLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['pixel', 'capi', 'webhook', 'catalog', 'messenger', 'lead_ads', 'custom_conversion', 'diagnostic']
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error', 'warning'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  error: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, { 
  timestamps: true 
})

facebookLogSchema.index({ eventType: 1, createdAt: -1 })
facebookLogSchema.index({ status: 1, createdAt: -1 })

const FacebookLogModel = mongoose.models.FacebookLog || mongoose.model('FacebookLog', facebookLogSchema, 'facebookLogs')
export default FacebookLogModel
