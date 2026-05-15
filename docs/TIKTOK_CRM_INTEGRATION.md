# TikTok CRM Integration Guide

## Overview
This guide explains how to connect TikTok with your CRM using Albato or Zapier for postback signals and offline event tracking.

## Prerequisites
- TikTok Business Account configured
- Offline Event Set ID created in TikTok Ads Manager
- CRM system (HubSpot, Salesforce, Pipedrive, etc.)
- Albato or Zapier account

## Setup Steps

### 1. Create Offline Event Set in TikTok
1. Go to TikTok Ads Manager
2. Navigate to Assets > Offline Events
3. Click "Create Offline Event Set"
4. Copy the `offlineEventSetId`
5. Save it in your TikTok Settings page

### 2. Configure Webhook in TikTok
1. Go to TikTok Ads Manager > Assets > Webhooks
2. Set webhook URL: `https://yourdomain.com/api/webhooks/tiktok`
3. Set verify token (save in TikTok Settings)
4. Select events to track: leadgen, conversion, campaign updates
5. Save webhook secret (save in TikTok Settings)

### 3. Connect CRM via Albato

#### Step 1: Connect TikTok
1. In Albato, create a new connection
2. Select TikTok Ads
3. Use OAuth to authenticate with your TikTok Business Account

#### Step 2: Connect Your CRM
1. Add another connection (e.g., HubSpot)
2. Authenticate with your CRM credentials

#### Step 3: Create Automation Workflow
**Trigger:** CRM Event (e.g., New Deal, Contact Created)

**Action:** Send Offline Event to TikTok
- Event Type: Purchase/Lead/Contact
- Identifiers: Map CRM fields (email, phone)
- Value: Map deal amount
- Custom Data: Include relevant CRM data

### 4. Connect CRM via Zapier

#### Step 1: Create Zap
1. Trigger: CRM (e.g., "New Deal in HubSpot")
2. Action: Webhooks (POST to `/api/tiktok/offline-events`)

#### Step 2: Configure Webhook Action
**URL:** `https://yourdomain.com/api/tiktok/offline-events`

**Payload:**
```json
{
  "eventType": "Purchase",
  "identifiers": {
    "email": "{{CRM Email Field}}",
    "phone": "{{CRM Phone Field}}",
    "external_id": "{{CRM Deal ID}}"
  },
  "eventTime": "{{CRM Created Date}}",
  "value": "{{CRM Deal Amount}}",
  "currency": "BDT",
  "customData": {
    "deal_id": "{{CRM Deal ID}}",
    "source": "CRM"
  }
}
```

### 5. Event Mapping

| CRM Event | TikTok Event | Use Case |
|-----------|--------------|----------|
| New Deal | Purchase | E-commerce order confirmed |
| New Contact | Lead | Lead generation form submitted |
| Meeting Scheduled | Contact | Phone call or meeting booked |
| Subscription | CompleteRegistration | Newsletter signup |
| Form Submission | SubmitForm | Any form submitted |

### 6. Testing Your Integration

#### Test Offline Event API
```bash
curl -X POST https://yourdomain.com/api/tiktok/offline-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "Purchase",
    "identifiers": {
      "email": "test@example.com",
      "phone": "+8801700000000",
      "external_id": "test-order-123"
    },
    "eventTime": "2026-05-16T10:00:00Z",
    "value": 1000,
    "currency": "BDT"
  }'
```

#### Test Webhook
1. In TikTok Ads Manager, send test webhook event
2. Check webhook logs in MongoDB
3. Verify signature verification

### 7. Troubleshooting

#### Common Issues
- **Signature verification failed**: Ensure webhook secret matches in TikTok and your settings
- **Offline event not sent**: Verify offlineEventSetId is configured
- **Data not matching**: Ensure identifiers are properly hashed (SHA256)
- **Attribution window**: Events must occur within 28 days (click) or 1 day (view-through)

#### Debug Mode
Enable debug logging in your TikTok settings to see detailed logs:
```javascript
// In lib/tiktok-events-api.js
const DEBUG = true // Enable debug logs
```

### 8. Best Practices

1. **Always hash identifiers** before sending to TikTok
2. **Include external_id** for deduplication
3. **Send events in real-time** for better attribution
4. **Monitor webhook logs** regularly for errors
5. **Test with small data sets** before full deployment
6. **Keep webhook secret secure** - never expose in client code

### 9. Attribution Windows

- **Click-through attribution**: 28 days
- **View-through attribution**: 1 day
- **Last-click attribution**: Default
- **Multi-touch attribution**: Available in TikTok Ads Manager

### 10. Support

For issues with:
- **Albato**: Contact Albato support
- **Zapier**: Contact Zapier support
- **TikTok API**: Check TikTok Ads API documentation
- **Custom integration**: Contact your development team

## API Reference

### Offline Events API
- **Endpoint**: `/api/tiktok/offline-events`
- **Method**: POST
- **Authentication**: Server-side only

### Webhook Endpoint
- **Endpoint**: `/api/webhooks/tiktok`
- **Method**: POST/GET
- **Verification**: HMAC-SHA256 signature
