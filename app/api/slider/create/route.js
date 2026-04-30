import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import SliderModel from "@/models/Slider.model";

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const body = await request.json()
        const { heading, description, buttonText, buttonLink, imageUrl, publicId } = body

        // Validation
        if (!heading || !description || !imageUrl || !publicId) {
            return response(false, 400, 'Heading, description, imageUrl and publicId are required.')
        }

        // Get the highest sortOrder and add 1
        const lastSlider = await SliderModel.findOne({ deletedAt: null }).sort({ sortOrder: -1 })
        const sortOrder = lastSlider ? lastSlider.sortOrder + 1 : 0

        const slider = await SliderModel.create({
            heading,
            description,
            buttonText: buttonText || 'Shop Now',
            buttonLink: buttonLink || '/shop',
            imageUrl,
            publicId,
            isActive: true,
            sortOrder
        })

        return response(true, 201, 'Slider created successfully.', slider)

    } catch (error) {
        return catchError(error)
    }
}
