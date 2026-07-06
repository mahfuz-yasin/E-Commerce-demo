import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import SMSLogModel from "@/models/SMSLog.model"

async function sendSMSViaSSlWireless(phone, message) {
    const apiKey = process.env.SSL_WIRELESS_API_KEY
    const sid = process.env.SSL_WIRELESS_SID
    if (!apiKey || !sid) return { success: false, code: 'NO_CONFIG' }

    try {
        const res = await fetch(
            `https://sms.sslwireless.com/pushapi/dynamic/server.php?api_token=${apiKey}&sid=${sid}&msisdn=${phone}&sms=${encodeURIComponent(message)}&csmsid=${Date.now()}`,
            { method: 'GET' }
        )
        const data = await res.json()
        return { success: data.status === 'ACCEPTED', code: data.status }
    } catch {
        return { success: false, code: 'REQUEST_FAILED' }
    }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { recipients, message, messageType } = await request.json()

        if (!recipients || recipients.length === 0) return response(false, 400, 'Recipients are required.')
        if (!message) return response(false, 400, 'Message is required.')

        const results = []
        let sentCount = 0
        let failedCount = 0

        for (const recipient of recipients) {
            const phone = recipient.phone || recipient
            const smsResult = await sendSMSViaSSlWireless(phone, message)
            results.push({
                phone,
                name: recipient.name || null,
                orderId: recipient.orderId || null,
                status: smsResult.success ? 'sent' : 'failed',
                responseCode: smsResult.code,
            })
            if (smsResult.success) sentCount++
            else failedCount++
        }

        const log = await SMSLogModel.create({
            recipients: results,
            message,
            messageType: messageType || 'bulk',
            totalCount: recipients.length,
            sentCount,
            failedCount,
            provider: 'ssl_wireless',
            sentBy: auth.userId,
        })

        return response(true, 200, `SMS sent: ${sentCount} success, ${failedCount} failed.`, {
            logId: log._id,
            sentCount,
            failedCount,
        })
    } catch (error) {
        return catchError(error)
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '20')

        const total = await SMSLogModel.countDocuments()
        const data = await SMSLogModel.find()
            .populate('sentBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)

        return response(true, 200, 'SMS logs fetched.', { data, total, page, hasMore: (page + 1) * limit < total })
    } catch (error) {
        return catchError(error)
    }
}
