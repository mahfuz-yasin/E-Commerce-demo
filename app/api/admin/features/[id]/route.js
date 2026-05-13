import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import FeatureModel from "@/models/Feature.model";

// GET single feature (admin)
export async function GET(request, { params }) {
    try {
        await connectDB()
        
        const feature = await FeatureModel.findById(params.id).lean()

        if (!feature) {
            return response(false, 404, 'Feature not found')
        }

        return response(true, 200, 'Feature fetched successfully', feature)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update feature (admin)
export async function PUT(request, { params }) {
    try {
        await connectDB()
        const payload = await request.json()

        const feature = await FeatureModel.findByIdAndUpdate(
            params.id,
            payload,
            { new: true, runValidators: true }
        ).lean()

        if (!feature) {
            return response(false, 404, 'Feature not found')
        }

        return response(true, 200, 'Feature updated successfully', feature)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE feature (admin)
export async function DELETE(request, { params }) {
    try {
        await connectDB()

        const feature = await FeatureModel.findByIdAndDelete(params.id).lean()

        if (!feature) {
            return response(false, 404, 'Feature not found')
        }

        return response(true, 200, 'Feature deleted successfully', feature)
    } catch (error) {
        return catchError(error)
    }
}
