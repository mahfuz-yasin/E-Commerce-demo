import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ApiKeyModel from "@/models/ApiKey.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const keys = await ApiKeyModel.find().sort({ createdAt: -1 }).lean()
        return response(true, 200, 'API keys.', keys)
    } catch (error) { return catchError(error) }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const { label, platform } = await request.json()
        if (!label?.trim()) return response(false, 400, 'Label is required.')
        const key = await ApiKeyModel.create({ label: label.trim(), platform: platform || 'custom' })
        return response(true, 201, 'API key created.', key)
    } catch (error) { return catchError(error) }
}

export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const { id } = await request.json()
        await ApiKeyModel.findByIdAndDelete(id)
        return response(true, 200, 'API key deleted.')
    } catch (error) { return catchError(error) }
}
