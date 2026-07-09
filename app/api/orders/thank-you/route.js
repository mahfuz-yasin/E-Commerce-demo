import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate one-time JWT token for thank you page
export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { orderId } = body
        
        if (!orderId) {
            return response(false, 400, 'Order ID is required')
        }
        
        // Find the order
        const order = await OrderModel.findOne({ 
            order_id: orderId,
            deletedAt: null 
        })
        
        if (!order) {
            return response(false, 404, 'Order not found')
        }
        
        // Check if thank you page was already accessed
        if (order.thankYouPageAccessed) {
            return response(false, 400, 'Thank you page already accessed')
        }
        
        // Generate one-time JWT token (expires in 5 minutes)
        const token = jwt.sign(
            { 
                orderId: order.order_id,
                timestamp: Date.now(),
                nonce: crypto.randomBytes(16).toString('hex')
            },
            JWT_SECRET,
            { expiresIn: '5m' }
        )
        
        // Mark order as thank you page accessed
        await OrderModel.findByIdAndUpdate(order._id, {
            thankYouPageAccessed: true,
            thankYouPageAccessedAt: new Date()
        })
        
        return response(true, 200, 'Thank you page token generated', {
            token,
            expiresIn: '5 minutes',
            orderDetails: {
                orderId: order.order_id,
                customerName: order.name,
                totalAmount: order.totalAmount,
                status: order.status
            }
        })
        
    } catch (error) {
        console.error('Error generating thank you token:', error)
        return catchError(error)
    }
}

// Validate thank you page token
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')
        
        if (!token) {
            return response(false, 400, 'Token is required')
        }
        
        // Verify JWT token
        try {
            const decoded = jwt.verify(token, JWT_SECRET)
            
            // Find the order
            const order = await OrderModel.findOne({ 
                order_id: decoded.orderId,
                deletedAt: null 
            })
            
            if (!order) {
                return response(false, 404, 'Order not found')
            }
            
            // Check if token is still valid (not already used)
            if (!order.thankYouPageAccessed || order.thankYouPageAccessedAt > new Date(decoded.timestamp)) {
                return response(false, 400, 'Invalid or expired token')
            }
            
            // Return order details for thank you page
            return response(true, 200, 'Token validated', {
                order: {
                    orderId: order.order_id,
                    customerName: order.name,
                    phone: order.phone,
                    address: order.address,
                    products: order.products,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    createdAt: order.createdAt
                }
            })
            
        } catch (jwtError) {
            return response(false, 401, 'Invalid or expired token')
        }
        
    } catch (error) {
        console.error('Error validating thank you token:', error)
        return catchError(error)
    }
}
