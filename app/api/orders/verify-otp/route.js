import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import crypto from 'crypto'

export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { orderId, phone, otp } = body
        
        if (!orderId || !phone || !otp) {
            return response(false, 400, 'Order ID, phone number, and OTP are required')
        }
        
        // Find the order
        const order = await OrderModel.findOne({ 
            order_id: orderId,
            phone: phone,
            deletedAt: null 
        })
        
        if (!order) {
            return response(false, 404, 'Order not found')
        }
        
        // Check if OTP exists and is not expired
        if (!order.otpHash || !order.otpExpiresAt) {
            return response(false, 400, 'No OTP was sent for this order')
        }
        
        if (new Date() > order.otpExpiresAt) {
            return response(false, 400, 'OTP has expired. Please request a new one.')
        }
        
        // Verify OTP
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        
        if (otpHash !== order.otpHash) {
            return response(false, 400, 'Invalid OTP')
        }
        
        // Mark OTP as verified and update order status
        await OrderModel.findByIdAndUpdate(order._id, {
            otpVerified: true,
            otpVerifiedAt: new Date(),
            otpHash: null, // Clear OTP hash
            otpExpiresAt: null, // Clear expiry
            status: order.status === 'pending' ? 'verified' : order.status
        })
        
        return response(true, 200, 'OTP verified successfully', {
            orderId: order.order_id,
            phone: phone,
            verifiedAt: new Date(),
            orderStatus: order.status === 'pending' ? 'verified' : order.status
        })
        
    } catch (error) {
        console.error('Error verifying OTP:', error)
        return catchError(error)
    }
}
