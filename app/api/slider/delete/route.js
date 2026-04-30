import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import SliderModel from "@/models/Slider.model";
import { v2 as cloudinary } from 'cloudinary'

export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const permanent = searchParams.get('permanent') === 'true'

        if (!id) {
            return response(false, 400, 'Slider ID is required.')
        }

        const slider = await SliderModel.findById(id)
        if (!slider) {
            return response(false, 404, 'Slider not found.')
        }

        if (permanent) {
            // Delete image from Cloudinary
            try {
                await cloudinary.uploader.destroy(slider.publicId)
            } catch (err) {
                console.error('Error deleting image from Cloudinary:', err)
            }

            await SliderModel.findByIdAndDelete(id)
            return response(true, 200, 'Slider permanently deleted.')
        } else {
            // Soft delete
            await SliderModel.findByIdAndUpdate(id, { deletedAt: new Date() })
            return response(true, 200, 'Slider moved to trash.')
        }

    } catch (error) {
        return catchError(error)
    }
}
