import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import InventoryPurchaseModel from "@/models/InventoryPurchase.model"
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
                { purchaseNumber: { $regex: search, $options: 'i' } },
                { 'items.productName': { $regex: search, $options: 'i' } },
            ]
        }

        const total = await InventoryPurchaseModel.countDocuments(query)
        const data = await InventoryPurchaseModel.find(query)
            .populate('supplier', 'name phone company')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)

        return response(true, 200, 'Purchases fetched.', {
            data,
            total,
            page,
            hasMore: (page + 1) * limit < total,
        })
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

        const { supplier, items, paymentMethod, paidAmount, notes, purchaseDate } = payload

        if (!items || items.length === 0) {
            return response(false, 400, 'At least one item is required.')
        }

        const totalAmount = items.reduce((sum, i) => sum + (i.totalCost || i.qty * i.costPrice), 0)
        const paid = paidAmount || 0
        const due = totalAmount - paid

        const purchaseNumber = 'PUR-' + Date.now().toString().slice(-8)

        const purchase = await InventoryPurchaseModel.create({
            purchaseNumber,
            supplier: supplier || null,
            items: items.map(i => ({
                ...i,
                totalCost: i.qty * i.costPrice,
            })),
            totalAmount,
            paidAmount: paid,
            dueAmount: due,
            paymentStatus: paid === 0 ? 'unpaid' : paid < totalAmount ? 'partial' : 'paid',
            paymentMethod: paymentMethod || 'cash',
            purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
            notes: notes || null,
            createdBy: auth.userId,
        })

        // Update supplier stats
        if (supplier) {
            await SupplierModel.findByIdAndUpdate(supplier, {
                $inc: { totalPurchaseAmount: totalAmount, totalPurchaseCount: 1 }
            })
        }

        return response(true, 201, 'Purchase recorded successfully.', purchase)
    } catch (error) {
        return catchError(error)
    }
}
