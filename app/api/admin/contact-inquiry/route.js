import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ContactInquiryModel from "@/models/ContactInquiry.model"
import { NextResponse } from "next/server"

// GET all contact inquiries (admin)
export async function GET(request) {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning empty inquiries array')
            return NextResponse.json({
                success: true,
                data: [],
                meta: { totalRowCount: 0 }
            })
        }
        
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10

        let query = {}

        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status
        }

        const skip = (page - 1) * limit

        const [inquiries, total] = await Promise.all([
            ContactInquiryModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ContactInquiryModel.countDocuments(query)
        ])

        return NextResponse.json({
            success: true,
            data: inquiries,
            meta: { totalRowCount: total }
        })
    } catch (error) {
        console.error('Error fetching contact inquiries:', error)
        return NextResponse.json({
            success: true,
            data: [],
            meta: { totalRowCount: 0 }
        })
    }
}

// PUT update inquiry status or add reply (admin)
export async function PUT(request) {
    try {
        if (!process.env.MONGODB_URI) {
            return response(false, 500, 'Database not configured.')
        }
        
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        const { id, status, reply } = payload

        if (!id) {
            return response(false, 400, 'Inquiry ID is required.')
        }

        const updateData = {}
        if (status) updateData.status = status
        if (reply) {
            updateData.reply = reply
            updateData.repliedAt = new Date()
            updateData.status = 'replied'
        }

        const inquiry = await ContactInquiryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )

        if (!inquiry) {
            return response(false, 404, 'Inquiry not found.')
        }

        return response(true, 200, 'Inquiry updated successfully', inquiry)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE inquiry (admin)
export async function DELETE(request) {
    try {
        if (!process.env.MONGODB_URI) {
            return response(false, 500, 'Database not configured.')
        }
        
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        const { ids } = payload

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or missing IDs')
        }

        await ContactInquiryModel.deleteMany({ _id: { $in: ids } })

        return response(true, 200, 'Inquiries deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
