import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import AssetLiabilityModel from "@/models/AssetLiability.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        let record = await AssetLiabilityModel.findOne().lean()
        if (!record) record = await AssetLiabilityModel.create({})

        // Compute stock value dynamically from variants
        const variants = await ProductVariantModel.find({ deletedAt: null }).select('stock sellingPrice mrp').lean()
        let stockValue = 0
        for (const v of variants) {
            stockValue += (v.sellingPrice || v.mrp || 0) * (v.stock || 0)
        }

        const netValue = (record.bankBalance || 0) + stockValue + (record.investments || 0) - (record.loans || 0)

        return response(true, 200, 'Asset & Liabilities.', {
            bankBalance: record.bankBalance,
            stockValue,
            loans: record.loans,
            investments: record.investments,
            netValue,
            notes: record.notes,
            _id: record._id,
        })
    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()
        const body = await request.json()
        const record = await AssetLiabilityModel.findOneAndUpdate(
            {},
            { $set: body },
            { upsert: true, new: true, runValidators: true }
        )
        return response(true, 200, 'Updated.', record)
    } catch (error) {
        return catchError(error)
    }
}
