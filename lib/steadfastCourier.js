/**
 * Steadfast Courier API Integration
 * Documentation: https://steadfast.com.bd/developer-api
 */

const STEADFAST_BASE_URL = process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/api/v1'
const STEADFAST_API_KEY = process.env.STEADFAST_API_KEY
const STEADFAST_SECRET_KEY = process.env.STEADFAST_SECRET_KEY

/**
 * Create a new consignment in Steadfast
 * @param {Object} consignmentData - Consignment details
 * @returns {Promise<Object>} Steadfast API response
 */
export async function createConsignment(consignmentData) {
    try {
        if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${STEADFAST_BASE_URL}/create_consignment`, {
            method: 'POST',
            headers: {
                'Api-Key': STEADFAST_API_KEY,
                'Secret-Key': STEADFAST_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                invoice: consignmentData.invoice,
                recipient_name: consignmentData.recipientName,
                recipient_phone: consignmentData.recipientPhone,
                recipient_address: consignmentData.recipientAddress,
                cod_amount: consignmentData.codAmount,
                note: consignmentData.note || ''
            })
        })

        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.message || `Steadfast API error: ${response.status}`)
        }

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('[Steadfast] Create consignment error:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

/**
 * Get consignment details by tracking code
 * @param {string} trackingCode - Steadfast tracking code
 * @returns {Promise<Object>} Consignment details
 */
export async function getConsignmentDetails(trackingCode) {
    try {
        if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${STEADFAST_BASE_URL}/get_details/${trackingCode}`, {
            method: 'GET',
            headers: {
                'Api-Key': STEADFAST_API_KEY,
                'Secret-Key': STEADFAST_SECRET_KEY,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.message || `Steadfast API error: ${response.status}`)
        }

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('[Steadfast] Get consignment details error:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

/**
 * Cancel a consignment
 * @param {string} trackingCode - Steadfast tracking code
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelConsignment(trackingCode) {
    try {
        if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${STEADFAST_BASE_URL}/cancel_consignment`, {
            method: 'POST',
            headers: {
                'Api-Key': STEADFAST_API_KEY,
                'Secret-Key': STEADFAST_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tracking_code: trackingCode
            })
        })

        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.message || `Steadfast API error: ${response.status}`)
        }

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('[Steadfast] Cancel consignment error:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

/**
 * Check delivery status
 * @param {string} trackingCode - Steadfast tracking code
 * @returns {Promise<Object>} Delivery status
 */
export async function checkDeliveryStatus(trackingCode) {
    try {
        if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${STEADFAST_BASE_URL}/delivery_status`, {
            method: 'POST',
            headers: {
                'Api-Key': STEADFAST_API_KEY,
                'Secret-Key': STEADFAST_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tracking_code: trackingCode
            })
        })

        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.message || `Steadfast API error: ${response.status}`)
        }

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('[Steadfast] Check delivery status error:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

/**
 * Prepare consignment data from order
 * @param {Object} order - Order document
 * @returns {Object} Consignment data for Steadfast
 */
export function prepareConsignmentData(order) {
    return {
        invoice: order.order_id,
        recipientName: order.name,
        recipientPhone: order.phone,
        recipientAddress: order.address,
        codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
        note: order.ordernote || ''
    }
}
