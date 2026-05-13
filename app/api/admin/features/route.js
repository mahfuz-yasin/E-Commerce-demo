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
