/**
 * Steadfast Courier API Integration
 * Documentation: https://steadfast.com.bd/developer-api
 * Now supports dynamic configuration from database
 */

import CourierConfigModel from "@/models/CourierConfig.model";

/**
 * Get Steadfast courier configuration from database
 * @returns {Promise<Object|null>} Courier config or null if not found
 */
async function getSteadfastConfig() {
    try {
        const config = await CourierConfigModel.findOne({
            courierName: 'steadfast',
            isActive: true,
            deletedAt: null
        }).lean()
        
        return config
    } catch (error) {
        console.error('[Steadfast] Failed to get config:', error)
        return null
    }
}

/**
 * Get Steadfast credentials - from DB or fallback to env
 * @returns {Promise<Object>} Credentials object
 */
async function getSteadfastCredentials() {
    // Try database first
    const config = await getSteadfastConfig()
    
    if (config && config.apiConfig) {
        return {
            baseUrl: config.apiConfig.baseUrl,
            apiKey: config.apiConfig.apiKey,
            secretKey: config.apiConfig.secretKey
        }
    }
    
    // Fallback to environment variables
    return {
        baseUrl: process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/api/v1',
        apiKey: process.env.STEADFAST_API_KEY,
        secretKey: process.env.STEADFAST_SECRET_KEY
    }
}

/**
 * Create a new consignment in Steadfast
 * @param {Object} consignmentData - Consignment details
 * @returns {Promise<Object>} Steadfast API response
 */
export async function createConsignment(consignmentData) {
    try {
        const credentials = await getSteadfastCredentials()
        
        if (!credentials.apiKey || !credentials.secretKey) {
            throw new Error('Steadfast API credentials not configured. Please set up courier configuration in admin panel.')
        }

        const response = await fetch(`${credentials.baseUrl}/create_consignment`, {
            method: 'POST',
            headers: {
                'Api-Key': credentials.apiKey,
                'Secret-Key': credentials.secretKey,
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
        const credentials = await getSteadfastCredentials()
        
        if (!credentials.apiKey || !credentials.secretKey) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${credentials.baseUrl}/get_details/${trackingCode}`, {
            method: 'GET',
            headers: {
                'Api-Key': credentials.apiKey,
                'Secret-Key': credentials.secretKey,
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
        const credentials = await getSteadfastCredentials()
        
        if (!credentials.apiKey || !credentials.secretKey) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${credentials.baseUrl}/cancel_consignment`, {
            method: 'POST',
            headers: {
                'Api-Key': credentials.apiKey,
                'Secret-Key': credentials.secretKey,
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
        const credentials = await getSteadfastCredentials()
        
        if (!credentials.apiKey || !credentials.secretKey) {
            throw new Error('Steadfast API credentials not configured')
        }

        const response = await fetch(`${credentials.baseUrl}/delivery_status`, {
            method: 'POST',
            headers: {
                'Api-Key': credentials.apiKey,
                'Secret-Key': credentials.secretKey,
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
