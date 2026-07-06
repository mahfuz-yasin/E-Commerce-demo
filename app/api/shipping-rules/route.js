import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ShippingRuleModel from "@/models/ShippingRule.model"

export async function GET() {
    try {
        await connectDB()
        const rules = await ShippingRuleModel.find({ deletedAt: null }).sort({ priority: -1 })
        return response(true, 200, 'Shipping rules fetched.', rules)
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
        const { name, type, flatCharge, freeShippingMinAmount, isActive, priority } = payload

        if (!name || !type) return response(false, 400, 'name and type are required.')

        const rule = await ShippingRuleModel.create({
            name,
            type,
            flatCharge: flatCharge || 60,
            freeShippingMinAmount: freeShippingMinAmount || 0,
            isActive: isActive !== false,
            priority: priority || 0,
        })

        return response(true, 201, 'Shipping rule created.', rule)
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

        const rule = await ShippingRuleModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (!rule) return response(false, 404, 'Rule not found.')

        return response(true, 200, 'Shipping rule updated.', rule)
    } catch (error) {
        return catchError(error)
    }
}
