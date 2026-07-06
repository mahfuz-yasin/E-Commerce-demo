import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import StaffModel from "@/models/Staff.model"
import UserModel from "@/models/User.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '20')

        const query = { deletedAt: null, isActive: true }
        const total = await StaffModel.countDocuments(query)
        const data = await StaffModel.find(query)
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)

        return response(true, 200, 'Staff fetched.', { data, total, page, hasMore: (page + 1) * limit < total })
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
        const { userId, name, phone, department, permissions, salary, maxOrdersPerDay, notes } = payload

        if (!userId || !name) return response(false, 400, 'userId and name are required.')

        const exists = await StaffModel.findOne({ user: userId })
        if (exists) return response(false, 409, 'Staff record already exists for this user.')

        const staff = await StaffModel.create({
            user: userId,
            name,
            phone,
            department: department || 'sales',
            permissions: permissions || {},
            salary: salary || 0,
            maxOrdersPerDay: maxOrdersPerDay || 50,
            notes: notes || null,
        })

        return response(true, 201, 'Staff created.', staff)
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

        const staff = await StaffModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (!staff) return response(false, 404, 'Staff not found.')

        return response(true, 200, 'Staff updated.', staff)
    } catch (error) {
        return catchError(error)
    }
}
