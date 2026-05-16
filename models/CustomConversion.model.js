import mongoose from 'mongoose'

const customConversionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  ruleType: {
    type: String,
    enum: ['url_pattern', 'time_on_page', 'scroll_depth', 'element_click'],
    required: true
  },
  ruleValue: {
    type: String,
    required: true
  },
  ruleValueNumber: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
}, { timestamps: true })

customConversionSchema.index({ status: 1 })
customConversionSchema.index({ ruleType: 1 })

const CustomConversionModel = (mongoose.models && mongoose.models.CustomConversion) || mongoose.model('CustomConversion', customConversionSchema, 'customConversions')
export default CustomConversionModel
