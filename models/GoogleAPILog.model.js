import mongoose from 'mongoose'

const googleAPILogSchema = new mongoose.Schema({
  api: {
    type: String,
    enum: ['GA4', 'Google Ads', 'Merchant Center', 'GTM'],
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error', 'retry'],
    required: true
  },
  statusCode: {
    type: Number
  },
  request: {
    type: mongoose.Schema.Types.Mixed
  },
  response: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  },
  duration: {
    type: Number // in milliseconds
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String
  }
}, {
  timestamps: true
})

googleAPILogSchema.index({ api: 1, timestamp: -1 })
googleAPILogSchema.index({ status: 1, timestamp: -1 })
googleAPILogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }) // Auto-delete after 30 days

const GoogleAPILogModel = mongoose.models.GoogleAPILog || mongoose.model('GoogleAPILog', googleAPILogSchema)
export default GoogleAPILogModel
