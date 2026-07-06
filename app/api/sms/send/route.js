import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import SMSLogModel from "@/models/SMSLog.model"

async function sendSMSViaSSLWireless(phone, message) {
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
        const { phone, name, message, orderId } = await request.json()

        if (!phone) return response(false, 400, 'Phone number is required.')
        if (!message) return response(false, 400, 'Message is required.')

        const result = await sendSMSViaSSLWireless(phone, message)

        await SMSLogModel.create({
            recipients: [{ phone, name: name || null, orderId: orderId || null, status: result.success ? 'sent' : 'failed', responseCode: result.code }],
            message,
            messageType: 'single',
            totalCount: 1,
            sentCount: result.success ? 1 : 0,
            failedCount: result.success ? 0 : 1,
            provider: 'ssl_wireless',
            sentBy: auth.userId,
        })

        return response(result.success, result.success ? 200 : 502,
            result.success ? 'SMS পাঠানো হয়েছে।' : `SMS পাঠানো যায়নি। (${result.code})`
        )
    } catch (error) {
        return catchError(error)
    }
}
