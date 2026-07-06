import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import StaffModel from "@/models/Staff.model"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { orderIds, staffUserId } = await request.json()

        if (!orderIds || !orderIds.length || !staffUserId) {
            return response(false, 400, 'orderIds and staffUserId are required.')
        }

        const staff = await StaffModel.findOne({ user: staffUserId, isActive: true, deletedAt: null })
        if (!staff) return response(false, 404, 'Staff not found.')

        const result = await OrderModel.updateMany(
            { _id: { $in: orderIds }, deletedAt: null },
            { assignedTo: staff.user, assignedAt: new Date() }
        )

        await StaffModel.findByIdAndUpdate(staff._id, {
            $inc: { totalOrdersHandled: orderIds.length }
        })

        return response(true, 200, `${result.modifiedCount} order(s) assigned to ${staff.name}.`, { modifiedCount: result.modifiedCount })
    } catch (error) {
        return catchError(error)
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const staffUserId = searchParams.get('staffUserId')

        const query = { deletedAt: null }
        if (staffUserId) query.assignedTo = staffUserId

        const orders = await OrderModel.find(query)
            .select('order_id name phone status totalAmount assignedTo assignedAt createdAt adSource')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(100)

        return response(true, 200, 'Assigned orders fetched.', orders)
    } catch (error) {
        return catchError(error)
    }
}
