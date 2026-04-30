import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";

export async function GET() {
    try {
        await connectDB()

        const slides = await SliderModel.find({ 
            isActive: true, 
            deletedAt: null 
        })
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean()

        // Add Cloudinary optimization to image URLs
        const optimizedSlides = slides.map(slide => ({
            ...slide,
            imageUrl: slide.imageUrl.replace('/upload/', '/upload/c_fill,w_1920,h_1080,q_auto,f_auto/')
        }))

        return response(true, 200, 'Active slides retrieved successfully.', optimizedSlides)

    } catch (error) {
        return catchError(error)
    }
}
