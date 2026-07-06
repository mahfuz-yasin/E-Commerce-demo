import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import BlockedCustomerModel from "@/models/BlockedCustomer.model"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { id } = await request.json()

        if (!id) return response(false, 400, 'ID is required.')

        const record = await BlockedCustomerModel.findById(id)
        if (!record) return response(false, 404, 'Record not found.')

        record.isActive = false
        await record.save()

        return response(true, 200, 'Customer unblocked successfully.')

    } catch (error) {
        return catchError(error)
    }
}
