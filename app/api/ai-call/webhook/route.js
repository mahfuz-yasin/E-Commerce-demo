import { connectDB } from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"
import { NextResponse } from "next/server"

// Bland.ai webhook — called after call ends
export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const { call_id, status, metadata, transcript, completed } = payload
        const orderId = metadata?.order_db_id

        if (!orderId) {
            return NextResponse.json({ received: true })
        }

        const order = await OrderModel.findById(orderId)
        if (!order) return NextResponse.json({ received: true })

        // Determine outcome from transcript
        const transcriptText = (transcript || '').toLowerCase()
        const confirmed = transcriptText.includes('হ্যাঁ') ||
            transcriptText.includes('yes') ||
            transcriptText.includes('ok') ||
            transcriptText.includes('ঠিক আছে') ||
            transcriptText.includes('confirm')

        const cancelled = transcriptText.includes('না') ||
            transcriptText.includes('no') ||
            transcriptText.includes('বাতিল') ||
            transcriptText.includes('cancel')

        order.aiCallStatus = completed ? 'completed' : status || 'unknown'
        order.aiCallTranscript = transcript || null
        order.aiCallCompletedAt = new Date()
        order.aiCallOutcome = confirmed ? 'confirmed' : cancelled ? 'cancelled' : 'no_response'

        // Auto-update order status based on call outcome
        if (confirmed && order.status === 'pending') {
            order.status = 'processing'
        } else if (cancelled && order.status === 'pending') {
            order.status = 'cancelled'
        }

        await order.save()
        console.log(`[AI Webhook] Order ${order.order_id}: outcome=${order.aiCallOutcome}`)

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[AI Webhook] Error:', error.message)
        return catchError(error)
    }
}
