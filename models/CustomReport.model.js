import mongoose from 'mongoose'

const customReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  metrics: [{
    type: String,
    required: true
  }],
  dimensions: [{
    type: String
  }],
  filters: {
    type: Object,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const CustomReportModel = mongoose.models.CustomReport || mongoose.model('CustomReport', customReportSchema)

export default CustomReportModel
