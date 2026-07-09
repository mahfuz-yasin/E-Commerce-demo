// Client-side fraud detection integration
class FraudDetectionClient {
    constructor() {
        this.sessionId = null
        this.checkoutStartTime = null
    }

    // Initialize fraud detection on checkout page load
    async initializeCheckout() {
        try {
            const response = await fetch('/api/orders/create', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.sessionId = result.data.sessionId
                this.checkoutStartTime = result.data.checkoutStartTime
                console.log('Fraud session initialized:', this.sessionId)
                return true
            } else {
                console.error('Failed to initialize fraud session:', result.message)
                return false
            }
        } catch (error) {
            console.error('Error initializing fraud detection:', error)
            return false
        }
    }

    // Submit order with fraud detection
    async submitOrder(orderData) {
        if (!this.sessionId) {
            throw new Error('Fraud session not initialized')
        }

        try {
            const response = await fetch(`/api/orders/create?sessionId=${this.sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            
            const result = await response.json()
            
            if (result.success) {
                // Handle different order statuses
                switch (result.data.fraudDetection.status) {
                    case 'Approved':
                        return {
                            success: true,
                            order: result.data.order,
                            nextStep: 'thank-you',
                            message: 'Order placed successfully!'
                        }
                    
                    case 'Hold/Review':
                        return {
                            success: true,
                            order: result.data.order,
                            nextStep: 'review',
                            message: 'Order is under review. We will contact you soon.'
                        }
                    
                    case 'Requires_Advance_Delivery_Charge':
                        return {
                            success: true,
                            order: result.data.order,
                            nextStep: 'advance-payment',
                            message: 'Order requires advance payment due to high return rate.'
                        }
                    
                    default:
                        return {
                            success: false,
                            error: result.data.fraudDetection.message,
                            fraudScore: result.data.fraudDetection.score
                        }
                }
            } else {
                return {
                    success: false,
                    error: result.message,
                    fraudScore: result.data?.fraudScore
                }
            }
        } catch (error) {
            console.error('Error submitting order:', error)
            return {
                success: false,
                error: 'Failed to submit order. Please try again.'
            }
        }
    }

    // Send OTP for order verification
    async sendOTP(orderId, phone) {
        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, phone })
            })
            
            const result = await response.json()
            
            if (result.success) {
                return {
                    success: true,
                    message: 'OTP sent to your phone',
                    expiresIn: '5 minutes'
                }
            } else {
                return {
                    success: false,
                    error: result.message
                }
            }
        } catch (error) {
            console.error('Error sending OTP:', error)
            return {
                success: false,
                error: 'Failed to send OTP'
            }
        }
    }

    // Verify OTP
    async verifyOTP(orderId, phone, otp) {
        try {
            const response = await fetch('/api/orders/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, phone, otp })
            })
            
            const result = await response.json()
            
            if (result.success) {
                return {
                    success: true,
                    message: 'OTP verified successfully',
                    orderStatus: result.data.orderStatus
                }
            } else {
                return {
                    success: false,
                    error: result.message
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error)
            return {
                success: false,
                error: 'Failed to verify OTP'
            }
        }
    }

    // Get thank you page token
    async getThankYouToken(orderId) {
        try {
            const response = await fetch('/api/orders/thank-you', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            })
            
            const result = await response.json()
            
            if (result.success) {
                return {
                    success: true,
                    token: result.data.token,
                    orderDetails: result.data.orderDetails
                }
            } else {
                return {
                    success: false,
                    error: result.message
                }
            }
        } catch (error) {
            console.error('Error getting thank you token:', error)
            return {
                success: false,
                error: 'Failed to get thank you page access'
            }
        }
    }

    // Access thank you page with token
    async accessThankYouPage(token) {
        try {
            const response = await fetch(`/api/orders/thank-you?token=${token}`)
            const result = await response.json()
            
            if (result.success) {
                return {
                    success: true,
                    order: result.data.order
                }
            } else {
                return {
                    success: false,
                    error: result.message
                }
            }
        } catch (error) {
            console.error('Error accessing thank you page:', error)
            return {
                success: false,
                error: 'Failed to access thank you page'
            }
        }
    }

    // Validate phone number format
    validatePhoneNumber(phone) {
        // Bangladeshi phone number validation
        const bdPhonePattern = /^(?:\+880|01)?[13-9]\d{8}$/
        return bdPhonePattern.test(phone.replace(/\s/g, ''))
    }

    // Validate customer name
    validateCustomerName(name) {
        if (!name || name.trim().length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters long' }
        }
        
        if (name.trim().length > 100) {
            return { valid: false, error: 'Name must be less than 100 characters' }
        }
        
        // Check for obvious trash data
        const trashPatterns = [
            /(.)\1{4,}/, // Repeated characters
            /^[a-z]{10,}$/i, // Long lowercase strings
            /^(asdf|qwer|zxcv|test|demo|fake)/i // Common test strings
        ]
        
        for (const pattern of trashPatterns) {
            if (pattern.test(name)) {
                return { valid: false, error: 'Please enter a valid name' }
            }
        }
        
        return { valid: true }
    }

    // Validate shipping address
    validateAddress(address) {
        if (!address || address.trim().length < 10) {
            return { valid: false, error: 'Address must be at least 10 characters long' }
        }
        
        if (address.trim().length > 500) {
            return { valid: false, error: 'Address must be less than 500 characters' }
        }
        
        // Check for obvious trash data
        const trashPatterns = [
            /(.)\1{4,}/, // Repeated characters
            /^[a-z]{15,}$/i, // Long lowercase strings
            /^(asdf|qwer|zxcv|test|demo|fake)/i // Common test strings
        ]
        
        for (const pattern of trashPatterns) {
            if (pattern.test(address)) {
                return { valid: false, error: 'Please enter a valid address' }
            }
        }
        
        return { valid: true }
    }
}

// Export singleton instance
export default new FraudDetectionClient()

// Usage example:
/*
// Initialize on checkout page load
const fraudClient = new FraudDetectionClient()
await fraudClient.initializeCheckout()

// Submit order
const orderData = {
    name: 'John Doe',
    phone: '01712345678',
    address: '123 Street, Dhaka',
    products: [...],
    totalAmount: 1000
}

const result = await fraudClient.submitOrder(orderData)
if (result.success) {
    // Handle success based on nextStep
    if (result.nextStep === 'thank-you') {
        // Get thank you token and redirect
        const tokenResult = await fraudClient.getThankYouToken(result.order.order_id)
        if (tokenResult.success) {
            window.location.href = `/thank-you?token=${tokenResult.token}`
        }
    }
}
*/
