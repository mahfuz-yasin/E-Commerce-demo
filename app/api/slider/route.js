import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import SliderModel from "@/models/Slider.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const deleteType = searchParams.get('deleteType') || 'SD'
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)

        let matchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
        }

        const sliders = await SliderModel.find(matchQuery)
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip(start)
            .limit(size)
            .lean()

        const totalCount = await SliderModel.countDocuments(matchQuery)

        return response(true, 200, 'Sliders retrieved successfully.', {
            sliders,
            totalCount,
            pageCount: Math.ceil(totalCount / size)
        })

    } catch (error) {
        return catchError(error)
    }
}
