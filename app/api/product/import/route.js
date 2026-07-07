import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import CategoryModel from "@/models/Category.model"

function parseCSV(text) {
    const lines = text.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    return lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((h, i) => { row[h] = cols[i] || '' })
        return row
    })
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        await connectDB()

        const formData = await request.formData()
        const file = formData.get('file')
        if (!file) return response(false, 400, 'No file provided.')

        const text = await file.text()
        const rows = parseCSV(text)
        if (!rows.length) return response(false, 400, 'Empty or invalid CSV.')

        let created = 0, failed = 0
        for (const row of rows) {
            try {
                const { name, sellingPrice, mrp, stock, category, description } = row
                if (!name?.trim()) { failed++; continue }

                let categoryId = null
                if (category?.trim()) {
                    const cat = await CategoryModel.findOne({ name: { $regex: new RegExp(category.trim(), 'i') } }).lean()
                    if (cat) categoryId = cat._id
                }

                const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
                const product = await ProductModel.create({
                    name: name.trim(),
                    slug,
                    category: categoryId,
                    description: description?.trim() || '',
                    sellingPrice: parseFloat(sellingPrice) || 0,
                    mrp: parseFloat(mrp) || 0,
                })

                await ProductVariantModel.create({
                    product: product._id,
                    sku: `SKU-${Date.now()}`,
                    stock: parseInt(stock) || 0,
                    sellingPrice: parseFloat(sellingPrice) || 0,
                    mrp: parseFloat(mrp) || 0,
                })

                created++
            } catch { failed++ }
        }

        return response(true, 200, `Import done. Created: ${created}, Failed: ${failed}`, { created, failed })
    } catch (error) {
        return catchError(error)
    }
}
