import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import CustomConversionModel from "@/models/CustomConversion.model"

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = { deletedAt: null }

        if (status && status !== 'all') {
            query.status = status
        }

        const conversions = await CustomConversionModel.find(query).sort({ createdAt: -1 })

        return response(true, 200, 'Custom conversions retrieved successfully.', conversions)

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const payload = await request.json()

        const newConversion = await CustomConversionModel.create(payload)

        return response(true, 201, 'Custom conversion created successfully.', newConversion)

    } catch (error) {
        return catchError(error)
    }
}
