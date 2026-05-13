import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import FeatureModel from "@/models/Feature.model";

export async function GET(request) {
    try {
        await connectDB()
        
        const features = await FeatureModel.find({ isActive: true })
            .sort({ order: 1 })
            .lean()

        return response(true, 200, 'Features fetched successfully', features)
    } catch (error) {
        return catchError(error)
    }
}
