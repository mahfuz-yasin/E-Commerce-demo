// OTP Service for sending SMS verification codes
class OTPService {
    constructor() {
        this.providers = {
            ssl: this.sendSSLOTP.bind(this),
            custom: this.sendCustomOTP.bind(this)
        }
    }

    // Send OTP via SMS
    async sendOTP(phoneNumber, otp, orderId) {
        try {
            // Try SSL Wireless first (most common in Bangladesh)
            const sslResult = await this.sendSSLOTP(phoneNumber, otp, orderId)
            if (sslResult) return true
            
            // Fallback to custom SMS service
            const customResult = await this.sendCustomOTP(phoneNumber, otp, orderId)
            return customResult
            
        } catch (error) {
            console.error('Error sending OTP:', error)
            return false
        }
    }

    // SSL Wireless SMS Integration
    async sendSSLOTP(phoneNumber, otp, orderId) {
        try {
            const apiKey = process.env.SSL_WIRELESS_API_KEY
            const sid = process.env.SSL_WIRELESS_SID
            
            if (!apiKey || !sid) {
                console.warn('SSL Wireless credentials not configured')
                return false
            }

            const message = `Your OTP for order ${orderId} is: ${otp}. Valid for 5 minutes.`
            const url = `https://sms.sslwireless.com/api/v3/send-sms`
            
            const params = new URLSearchParams({
                api_token: apiKey,
                sid: sid,
                msisdn: phoneNumber,
                sms: message,
                csms_id: Date.now().toString()
            })

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            })

            const result = await response.json()
            
            if (result.status === 'SUCCESS') {
                console.log(`OTP sent successfully to ${phoneNumber}`)
                return true
            } else {
                console.error('SSL Wireless SMS failed:', result)
                return false
            }
            
        } catch (error) {
            console.error('SSL Wireless error:', error)
            return false
        }
    }

    // Custom SMS Service (fallback)
    async sendCustomOTP(phoneNumber, otp, orderId) {
        try {
            // This is a mock implementation
            // In production, integrate with your preferred SMS service
            
            const message = `Your OTP for order ${orderId} is: ${otp}. Valid for 5 minutes.`
            
            // Mock SMS sending - replace with actual SMS service
            console.log(`MOCK SMS: Sending to ${phoneNumber}: ${message}`)
            
            // Simulate SMS sending delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            return true
            
        } catch (error) {
            console.error('Custom SMS error:', error)
            return false
        }
    }

    // Generate OTP
    generateOTP(length = 6) {
        const digits = '0123456789'
        let otp = ''
        
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * digits.length)]
        }
        
        return otp
    }

    // Validate OTP format
    validateOTP(otp) {
        return /^\d{6}$/.test(otp)
    }
}

const otpService = new OTPService()

export default otpService
export { otpService as sendOTP }
