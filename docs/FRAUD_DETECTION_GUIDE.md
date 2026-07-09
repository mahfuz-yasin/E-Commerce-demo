# Anti-Fraud and Fake Order Detection System

A comprehensive, production-ready fraud detection system for e-commerce applications that automatically filters and blocks fake orders before saving them to MongoDB and before firing the Facebook Conversion API (CAPI) Purchase event.

## 🚀 Features

### 1. Time-Gate Trigger
- **Purpose**: Detect bots and automated submissions
- **Logic**: Track duration between checkout page load and order submission
- **Threshold**: Less than 10 seconds = Bot/Spam detection
- **Action**: Instant rejection, no Facebook event sent

### 2. Rate Limiting & Device/IP Fingerprinting
- **Purpose**: Prevent multiple orders from same source
- **Logic**: Track IP address and device fingerprint
- **Threshold**: 3+ orders in 15 minutes
- **Action**: Auto-block IP for 24 hours, instant rejection

### 3. Trash Data & Regex Validation
- **Purpose**: Detect gibberish and fake information
- **Logic**: Validate customer name and shipping address
- **Patterns**: Repetitive characters, meaningless strings
- **Action**: Flag for review, no Facebook event sent

### 4. Phone Number Filter & Blacklist
- **Purpose**: Block known fraudulent phone numbers
- **Logic**: Validate Bangladeshi format, check blacklist
- **Format**: +8801... or 01... (10 digits)
- **Action**: Instant rejection if blacklisted

### 5. Third-Party Courier API Integration
- **Purpose**: Check customer return history
- **Logic**: Fetch return rate from courier services
- **Threshold**: Return rate > 40%
- **Action**: Require advance payment, hold order

### 6. Secure Thank-You Page & OTP Verification
- **Purpose**: Prevent direct access to success page
- **Logic**: One-time JWT token, expires after single use
- **OTP**: 6-digit code via SMS for verification
- **Action**: Secure order finalization

## 📁 File Structure

```
├── models/
│   ├── FraudSession.model.js      # Session tracking for time-gate
│   ├── BlacklistedContact.model.js # Phone blacklist management
│   └── Order.model.js             # Enhanced with fraud fields
├── lib/
│   ├── services/
│   │   ├── FraudDetectionService.js    # Core fraud detection logic
│   │   ├── FacebookConversionAPI.js    # Facebook CAPI integration
│   │   └── OTPService.js               # SMS OTP service
│   ├── middleware/
│   │   └── fraudDetection.js           # Fraud detection middleware
│   └── client/
│       └── FraudDetectionClient.js     # Frontend integration
├── app/api/
│   ├── orders/
│   │   ├── create/route.js             # Order creation with fraud detection
│   │   ├── thank-you/route.js          # Secure thank you page
│   │   └── verify-otp/route.js         # OTP verification
│   └── auth/
│       └── send-otp/route.js           # OTP sending
└── .env.example                         # Environment variables
```

## 🔧 Installation & Setup

### 1. Environment Variables
Add these to your `.env.local` file:

```env
# Facebook Conversion API
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PIXEL_ID=your_facebook_pixel_id
FACEBOOK_TEST_EVENT_CODE=your_test_event_code_optional

# JWT Secret for Thank You Page tokens
JWT_SECRET=your_jwt_secret_key_change_in_production

# SMS (SSL Wireless)
SSL_WIRELESS_API_KEY=your_ssl_wireless_api_key
SSL_WIRELESS_SID=your_ssl_wireless_sid

# Fraud Detection Settings
FRAUD_DETECTION_ENABLED=true
FRAUD_RATE_LIMIT_ORDERS=3
FRAUD_RATE_LIMIT_MINUTES=15
FRAUD_TIME_GATE_SECONDS=10
FRAUD_MAX_RETURN_RATE=40
```

### 2. Install Required Dependencies
```bash
npm install jsonwebtoken crypto
```

### 3. Database Setup
The system will automatically create the necessary collections:
- `fraud_sessions` - Session tracking
- `blacklisted_contacts` - Phone blacklist
- `blocked_customers` - IP blocks
- `orders` - Enhanced with fraud fields

## 🎯 Usage Examples

### Frontend Integration

```javascript
import FraudDetectionClient from '@/lib/client/FraudDetectionClient'

const fraudClient = new FraudDetectionClient()

// Initialize on checkout page load
await fraudClient.initializeCheckout()

// Submit order with fraud detection
const orderData = {
    name: 'John Doe',
    phone: '01712345678',
    address: '123 Street, Dhaka',
    products: [...],
    totalAmount: 1000
}

const result = await fraudClient.submitOrder(orderData)

if (result.success) {
    switch (result.nextStep) {
        case 'thank-you':
            // Get thank you token and redirect
            const tokenResult = await fraudClient.getThankYouToken(result.order.order_id)
            window.location.href = `/thank-you?token=${tokenResult.token}`
            break
        
        case 'review':
            // Show review message
            alert('Order is under review. We will contact you soon.')
            break
        
        case 'advance-payment':
            // Show advance payment requirement
            alert('Order requires advance payment due to high return rate.')
            break
    }
} else {
    // Handle fraud detection rejection
    alert(`Order rejected: ${result.error}`)
}
```

### Backend API Usage

```javascript
// Create order with fraud detection
POST /api/orders/create?sessionId={sessionId}

{
    "name": "John Doe",
    "phone": "01712345678",
    "address": "123 Street, Dhaka",
    "products": [...],
    "totalAmount": 1000
}

// Response
{
    "success": true,
    "data": {
        "order": {...},
        "fraudDetection": {
            "status": "Approved",
            "score": 15,
            "message": "Order approved",
            "checks": {...}
        },
        "facebookEventSent": true
    }
}
```

## 🔍 Fraud Detection Logic

### Order Status Flow

1. **APPROVED** → Save to MongoDB, Send Facebook CAPI
2. **HOLD_REVIEW** → Save as 'Hold/Review', No Facebook event
3. **REQUIRE_ADVANCE_PAYMENT** → Save as 'Requires_Advance_Delivery_Charge', No Facebook event
4. **REJECT** → Don't save, Return 429 error, No Facebook event

### Fraud Score Calculation

| Violation | Score | Action |
|-----------|-------|--------|
| Time gate (< 10s) | +30 | REJECT |
| Rate limit (3+ orders) | +35 | REJECT |
| Trash data | +20 | HOLD_REVIEW |
| Phone blacklist | +40 | HOLD_REVIEW |
| High courier risk | +15 | REQUIRE_ADVANCE_PAYMENT |

### Score Ranges

- **0-29**: APPROVED
- **30-69**: HOLD_REVIEW
- **70+**: REJECT

## 🛡️ Security Features

### 1. Session Management
- Unique session ID for each checkout
- Tracks checkout start time
- Device fingerprinting
- Auto-expiration (1 hour)

### 2. Secure Thank-You Page
- One-time JWT token
- 5-minute expiration
- Single use only
- Prevents direct URL access

### 3. OTP Verification
- 6-digit SMS code
- 5-minute expiration
- Hashed storage
- Rate limiting (1 minute between requests)

### 4. IP Blocking
- Automatic IP blocking for violations
- 24-hour block duration
- Manual override capability
- Audit trail

## 📊 Monitoring & Analytics

### Fraud Detection Dashboard
Access via: `/admin/fraud-guard`

Features:
- Overview statistics
- Suspicious IP monitoring
- Blacklist management
- Validation rules configuration

### Key Metrics
- Fraud detection rate
- False positive rate
- Block effectiveness
- Return rate correlation

## 🔧 Configuration

### Fraud Settings
Update via Admin Panel → Fraud Guard → Validation Rules:

- **Minimum Address Length**: 10 characters
- **Block Below Delivery Ratio**: 30%
- **Block New Customers**: false/true
- **Custom Block Message**: Configure popup text

### Courier Integration
Configure courier APIs in Admin Panel → Courier Settings:
- SteadFast API credentials
- Pathao API credentials
- Return rate thresholds

## 🚨 Troubleshooting

### Common Issues

1. **High False Positives**
   - Adjust time gate threshold
   - Review regex patterns
   - Calibrate rate limits

2. **OTP Not Sending**
   - Check SSL Wireless credentials
   - Verify phone number format
   - Check SMS credits

3. **Facebook Events Not Firing**
   - Verify Facebook credentials
   - Check pixel configuration
   - Review test event code

4. **Performance Issues**
   - Add database indexes
   - Optimize fraud checks
   - Implement caching

## 📈 Performance Optimization

### Database Indexes
```javascript
// FraudSession indexes
db.fraudsessions.createIndex({ sessionId: 1 })
db.fraudsessions.createIndex({ ipAddress: 1, checkoutStartTime: 1 })
db.fraudsessions.createIndex({ deviceFingerprint: 1, checkoutStartTime: 1 })

// BlacklistedContact indexes
db.blacklistedcontacts.createIndex({ phone: 1, isActive: 1 })
db.blacklistedcontacts.createIndex({ blacklistReason: 1, isActive: 1 })
```

### Caching Strategy
- Cache fraud settings (5 minutes)
- Cache blacklist data (10 minutes)
- Cache courier API responses (1 hour)

## 🔮 Future Enhancements

1. **Machine Learning Integration**
   - Pattern recognition
   - Anomaly detection
   - Predictive scoring

2. **Advanced Device Fingerprinting**
   - Browser fingerprinting
   - Canvas fingerprinting
   - Behavioral analysis

3. **Real-time Monitoring**
   - WebSocket alerts
   - Live dashboard
   - Automated responses

4. **Multi-channel Verification**
   - Email verification
   - Social media verification
   - Address verification

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the fraud detection dashboard
3. Check the logs for error messages
4. Contact development team

---

**Note**: This system is designed to be highly configurable. Adjust thresholds and rules based on your specific business requirements and fraud patterns.
