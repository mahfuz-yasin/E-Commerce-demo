import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import OTPService from "@/lib/services/OTPService"
import crypto from 'crypto'

export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { orderId, phone } = body
        
        if (!orderId || !phone) {
            return response(false, 400, 'Order ID and phone number are required')
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
        
        // Check if OTP was already sent recently
        if (order.otpSentAt && (Date.now() - order.otpSentAt.getTime()) < 60000) {
            return response(false, 429, 'OTP already sent. Please wait 1 minute before requesting again.')
        }
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        
        // Store OTP hash and expiry (5 minutes)
        await OrderModel.findByIdAndUpdate(order._id, {
            otpHash,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            otpSentAt: new Date(),
            otpVerified: false
        })
        
        // Send OTP via SMS
        const otpSent = await OTPService.sendOTP(phone, otp, orderId)
        
        if (!otpSent) {
            return response(false, 500, 'Failed to send OTP. Please try again.')
        }
        
        return response(true, 200, 'OTP sent successfully', {
            orderId: order.order_id,
            phone: phone,
            expiresIn: '5 minutes'
        })
        
    } catch (error) {
        console.error('Error sending OTP:', error)
        return catchError(error)
    }
}
