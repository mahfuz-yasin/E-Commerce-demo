import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import CustomConversionModel from "@/models/CustomConversion.model"

export async function PUT(request, { params }) {
    try {
        await connectDB()

        const { id } = await params
        const payload = await request.json()

        const conversion = await CustomConversionModel.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        )

        if (!conversion) {
            return response(false, 404, 'Custom conversion not found')
        }

        return response(true, 200, 'Custom conversion updated successfully.', conversion)

    } catch (error) {
        return catchError(error)
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB()

        const { id } = await params

        const conversion = await CustomConversionModel.findByIdAndUpdate(
            id,
            { deletedAt: new Date() },
            { new: true }
        )

        if (!conversion) {
            return response(false, 404, 'Custom conversion not found')
        }

        return response(true, 200, 'Custom conversion deleted successfully.')

    } catch (error) {
        return catchError(error)
    }
}
