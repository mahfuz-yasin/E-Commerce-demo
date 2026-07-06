import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import SupplierModel from "@/models/Supplier.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''

        const query = { deletedAt: null }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ]
        }

        const total = await SupplierModel.countDocuments(query)
        const data = await SupplierModel.find(query)
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)

        return response(true, 200, 'Suppliers fetched.', { data, total, page, hasMore: (page + 1) * limit < total })
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
        const { name, phone, email, address, company, notes } = payload

        if (!name) return response(false, 400, 'Supplier name is required.')

        const supplier = await SupplierModel.create({ name, phone, email, address, company, notes })
        return response(true, 201, 'Supplier created.', supplier)
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

        const supplier = await SupplierModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (!supplier) return response(false, 404, 'Supplier not found.')

        return response(true, 200, 'Supplier updated.', supplier)
    } catch (error) {
        return catchError(error)
    }
}
