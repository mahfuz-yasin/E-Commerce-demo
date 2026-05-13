import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SettingsModel from "@/models/Settings.model";

// GET single setting (admin)
export async function GET(request, { params }) {
    try {
        await connectDB()
        
        const setting = await SettingsModel.findById(params.id).lean()

        if (!setting) {
            return response(false, 404, 'Setting not found')
        }

        return response(true, 200, 'Setting fetched successfully', setting)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update setting (admin)
export async function PUT(request, { params }) {
    try {
        await connectDB()
        const payload = await request.json()

        const setting = await SettingsModel.findByIdAndUpdate(
            params.id,
            payload,
            { new: true, runValidators: true }
        ).lean()

        if (!setting) {
            return response(false, 404, 'Setting not found')
        }

        return response(true, 200, 'Setting updated successfully', setting)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE setting (admin)
export async function DELETE(request, { params }) {
    try {
        await connectDB()

        const setting = await SettingsModel.findByIdAndDelete(params.id).lean()

        if (!setting) {
            return response(false, 404, 'Setting not found')
        }

        return response(true, 200, 'Setting deleted successfully', setting)
    } catch (error) {
        return catchError(error)
    }
}
