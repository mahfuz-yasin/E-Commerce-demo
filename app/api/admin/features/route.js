import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import FeatureModel from "@/models/Feature.model";

// GET all features (admin)
export async function GET(request) {
    try {
        await connectDB()

        const features = await FeatureModel.find()
            .sort({ order: 1 })
            .lean()

        return response(true, 200, 'Features fetched successfully', features)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new feature (admin)
export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const feature = await FeatureModel.create(payload)

        return response(true, 201, 'Feature created successfully', feature)
    } catch (error) {
        return catchError(error)
    }
}

// PUT soft delete/restore features (admin)
export async function PUT(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const { ids, deleteType } = payload

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or missing IDs')
        }

        if (deleteType === 'SD') {
            // Soft delete - move to trash
            await FeatureModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: new Date() }
            )
            return response(true, 200, 'Features moved to trash successfully')
        } else if (deleteType === 'RSD') {
            // Restore from trash
            await FeatureModel.updateMany(
                { _id: { $in: ids } },
                { deletedAt: null }
            )
            return response(true, 200, 'Features restored successfully')
        } else {
            return response(false, 400, 'Invalid delete type')
        }
    } catch (error) {
        return catchError(error)
    }
}

// DELETE permanent delete features (admin)
export async function DELETE(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const { ids } = payload

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or missing IDs')
        }

        await FeatureModel.deleteMany({ _id: { $in: ids } })

        return response(true, 200, 'Features deleted permanently')
    } catch (error) {
        return catchError(error)
    }
}
