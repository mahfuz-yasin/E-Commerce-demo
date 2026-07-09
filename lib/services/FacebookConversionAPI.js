// Facebook Conversion API Service for Purchase Events
class FacebookConversionAPI {
    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN
        this.pixelId = process.env.FACEBOOK_PIXEL_ID
        this.apiVersion = 'v18.0'
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`
    }

    // Send Purchase Event to Facebook
    async sendPurchaseEvent(order) {
        try {
            if (!this.accessToken || !this.pixelId) {
                console.warn('Facebook credentials not configured')
                return false
            }

            const eventData = this.formatPurchaseData(order)
            const response = await this.sendEvent(eventData)
            
            if (response.success) {
                console.log(`Facebook Purchase Event sent for order ${order.order_id}`)
                return true
            } else {
                console.error('Facebook Purchase Event failed:', response.error)
                return false
            }
            
        } catch (error) {
            console.error('Facebook Conversion API error:', error)
            return false
        }
    }

    // Format purchase data for Facebook
    formatPurchaseData(order) {
        const products = order.products || []
        
        return {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            user_data: {
                client_user_agent: order.userAgent,
                client_ip_address: order.ipAddress,
                // Add hashed user data for better matching
                em: this.hashData(order.email || ''),
                ph: this.hashData(order.phone || ''),
                fn: this.hashData(order.name || ''),
                ct: this.hashData(this.extractCity(order.address) || ''),
                st: this.hashData(this.extractState(order.address) || ''),
                country: this.hashData('BD'), // Bangladesh
                // Facebook Click ID if available
                fbc: order.adSource?.fbcl || null,
                fbp: order.adSource?.fbp || null
            },
            custom_data: {
                currency: 'BDT',
                value: order.totalAmount,
                order_id: order.order_id,
                content_type: 'product',
                contents: products.map(product => ({
                    product_id: product.productId,
                    quantity: product.qty,
                    item_price: product.sellingPrice
                })),
                num_items: products.reduce((sum, product) => sum + product.qty, 0)
            },
            // Advanced matching parameters
            original_event_data: {
                event_source_url: order.adSource?.landingPage || 'https://yourwebsite.com',
                opt_out: false
            }
        }
    }

    // Send event to Facebook API
    async sendEvent(eventData) {
        try {
            const url = `${this.baseUrl}/${this.pixelId}/events`
            
            const payload = {
                data: [eventData],
                test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE || null
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()
            
            if (response.ok && result.data_received) {
                return { success: true, data: result }
            } else {
                return { success: false, error: result }
            }
            
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // Hash data for Facebook privacy compliance
    hashData(data) {
        if (!data) return null
        
        const crypto = require('crypto')
        return crypto.createHash('sha256')
            .update(data.toLowerCase().trim())
            .digest('hex')
    }

    // Extract city from address
    extractCity(address) {
        if (!address) return ''
        
        // Simple city extraction - can be enhanced
        const cityPatterns = [
            /dhaka/i,
            /chattogram/i,
            /khulna/i,
            /rajshahi/i,
            /sylhet/i,
            /barishal/i,
            /rangpur/i,
            /mymensingh/i
        ]
        
        for (const pattern of cityPatterns) {
            const match = address.match(pattern)
            if (match) return match[0]
        }
        
        return ''
    }

    // Extract state/division from address
    extractState(address) {
        if (!address) return ''
        
        // Similar to city extraction
        const statePatterns = [
            /dhaka division/i,
            /chattogram division/i,
            /khulna division/i,
            /rajshahi division/i,
            /sylhet division/i,
            /barishal division/i,
            /rangpur division/i,
            /mymensingh division/i
        ]
        
        for (const pattern of statePatterns) {
            const match = address.match(pattern)
            if (match) return match[0]
        }
        
        return ''
    }

    // Send custom event (for testing)
    async sendCustomEvent(eventName, data, userData = {}) {
        try {
            const eventData = {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: userData,
                custom_data: data
            }

            return await this.sendEvent(eventData)
            
        } catch (error) {
            console.error('Custom event error:', error)
            return { success: false, error: error.message }
        }
    }
}

// Export singleton instance
export default new FacebookConversionAPI()

// Export function for easy usage
export async function sendFacebookPurchaseEvent(order) {
    return await FacebookConversionAPI.sendPurchaseEvent(order)
}
