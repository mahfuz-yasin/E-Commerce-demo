import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FlashSaleModel from "@/models/FlashSale.model"

export async function GET(request) {
    try {
        await connectDB()
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') === 'true'

        const query = { deletedAt: null }
        if (activeOnly) {
            const now = new Date()
            query.isActive = true
            query.startTime = { $lte: now }
            query.endTime = { $gte: now }
        }

        const data = await FlashSaleModel.find(query)
            .populate('products.product', 'name mrp sellingPrice')
            .sort({ startTime: -1 })

        return response(true, 200, 'Flash sales fetched.', data)
    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const payload = await request.json()
        const { title, discountPercentage, startTime, endTime, products, showCountdown, bannerImage } = payload

        if (!title || !discountPercentage || !startTime || !endTime) {
            return response(false, 400, 'title, discountPercentage, startTime, endTime are required.')
        }

        const flashSale = await FlashSaleModel.create({
            title,
            discountPercentage,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            products: products || [],
            showCountdown: showCountdown !== false,
            bannerImage: bannerImage || null,
            isActive: true,
        })

        return response(true, 201, 'Flash sale created.', flashSale)
    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { _id, ...updateData } = await request.json()
        if (!_id) return response(false, 400, 'ID is required.')

        const flashSale = await FlashSaleModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (!flashSale) return response(false, 404, 'Flash sale not found.')

        return response(true, 200, 'Flash sale updated.', flashSale)
    } catch (error) {
        return catchError(error)
    }
}
