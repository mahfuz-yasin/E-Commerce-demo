import mongoose from "mongoose"

const NotePresetSchema = new mongoose.Schema({
    note: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true })

const NotePresetModel = (mongoose.models && mongoose.models.NotePreset)
    || mongoose.model('NotePreset', NotePresetSchema, 'note_presets')

export default NotePresetModel
