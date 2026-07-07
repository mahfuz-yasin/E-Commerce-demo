import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import NotePresetModel from "@/models/NotePreset.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const presets = await NotePresetModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean()
        return response(true, 200, 'Note presets.', presets)
    } catch (error) { return catchError(error) }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const { note } = await request.json()
        if (!note?.trim()) return response(false, 400, 'Note is required.')
        const preset = await NotePresetModel.create({ note: note.trim() })
        return response(true, 201, 'Preset created.', preset)
    } catch (error) { return catchError(error) }
}

export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const { id } = await request.json()
        await NotePresetModel.findByIdAndDelete(id)
        return response(true, 200, 'Preset deleted.')
    } catch (error) { return catchError(error) }
}
