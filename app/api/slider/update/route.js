import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import SliderModel from "@/models/Slider.model";
import { v2 as cloudinary } from 'cloudinary'

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const body = await request.json()
        const { _id, heading, description, buttonText, buttonLink, imageUrl, publicId, isActive, sortOrder } = body

        if (!_id) {
            return response(false, 400, 'Slider ID is required.')
        }

        const existingSlider = await SliderModel.findById(_id)
        if (!existingSlider) {
            return response(false, 404, 'Slider not found.')
        }

        // Delete old image from Cloudinary if new image is uploaded
        if (publicId && existingSlider.publicId !== publicId) {
            try {
                await cloudinary.uploader.destroy(existingSlider.publicId)
            } catch (err) {
                console.error('Error deleting old image:', err)
            }
        }

        const updatedSlider = await SliderModel.findByIdAndUpdate(
            _id,
            {
                heading: heading || existingSlider.heading,
                description: description || existingSlider.description,
                buttonText: buttonText || existingSlider.buttonText,
                buttonLink: buttonLink || existingSlider.buttonLink,
                imageUrl: imageUrl || existingSlider.imageUrl,
                publicId: publicId || existingSlider.publicId,
                isActive: isActive !== undefined ? isActive : existingSlider.isActive,
                sortOrder: sortOrder !== undefined ? sortOrder : existingSlider.sortOrder
            },
            { new: true }
        )

        return response(true, 200, 'Slider updated successfully.', updatedSlider)

    } catch (error) {
        return catchError(error)
    }
}
