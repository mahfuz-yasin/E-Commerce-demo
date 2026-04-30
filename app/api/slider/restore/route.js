import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import SliderModel from "@/models/Slider.model";

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const body = await request.json()
        const { id } = body

        if (!id) {
            return response(false, 400, 'Slider ID is required.')
        }

        const slider = await SliderModel.findById(id)
        if (!slider) {
            return response(false, 404, 'Slider not found.')
        }

        await SliderModel.findByIdAndUpdate(id, { deletedAt: null })

        return response(true, 200, 'Slider restored successfully.')

    } catch (error) {
        return catchError(error)
    }
}
