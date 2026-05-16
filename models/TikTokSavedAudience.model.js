import mongoose from 'mongoose'

const tikTokSavedAudienceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  targetingCriteria: {
    type: Object,
    required: true
  },
  audienceId: {
    type: String,
    required: false // TikTok audience ID after creation
  },
  type: {
    type: String,
    enum: ['CUSTOM', 'LOOKALIKE', 'SAVED'],
    default: 'SAVED'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  size: {
    type: Number,
    required: false
  },
  sharedWith: [{
    type: String // Ad account IDs
  }],
  createdBy: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

tikTokSavedAudienceSchema.index({ type: 1 })
tikTokSavedAudienceSchema.index({ status: 1 })

const TikTokSavedAudienceModel = (mongoose.models && mongoose.models.TikTokSavedAudience) || mongoose.model('TikTokSavedAudience', tikTokSavedAudienceSchema)

export default TikTokSavedAudienceModel
