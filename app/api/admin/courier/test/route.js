import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import CourierConfigModel from "@/models/CourierConfig.model"

/**
 * POST /api/admin/courier/test
 * Test courier API credentials before saving
 */
export async function POST(request) {
    try {
        const { courierName, apiKey, secretKey, baseUrl } = await request.json()

        if (!apiKey || !secretKey) {
            return response(false, 400, 'API Key and Secret Key are required to test connection.')
        }

        const url = baseUrl || 'https://portal.steadfast.com.bd/api/v1'

        if (courierName === 'steadfast') {
            // Steadfast balance check — lightweight test endpoint
            const res = await fetch(`${url}/get_balance`, {
                method: 'GET',
                headers: {
                    'Api-Key': apiKey,
                    'Secret-Key': secretKey,
                    'Content-Type': 'application/json',
                },
            })

            const data = await res.json()

            if (res.ok && (data.status === 200 || data.current_balance !== undefined)) {
                return response(true, 200, `Connection successful! Current balance: ৳${data.current_balance ?? 'N/A'}`, {
                    balance: data.current_balance,
                })
            } else {
                return response(false, 401, data.message || 'Invalid credentials. Please check your API Key and Secret Key.')
            }
        }

        return response(false, 400, 'Unsupported courier for connection test.')
    } catch (error) {
        if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
            return response(false, 502, 'Cannot reach Steadfast API. Check your internet connection or API base URL.')
        }
        return catchError(error)
    }
}
