import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import FeatureModel from "@/models/Feature.model";

export async function GET(request) {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning empty features array')
            return response(true, 200, 'Features fetched successfully', [])
        }
        
        await connectDB()
        
        const features = await FeatureModel.find({ isActive: true })
            .sort({ order: 1 })
            .lean()

        return response(true, 200, 'Features fetched successfully', features)
    } catch (error) {
        console.error('Error fetching features:', error)
        // Return empty array instead of error to prevent breaking the UI
        return response(true, 200, 'Features fetched successfully', [])
    }
}
