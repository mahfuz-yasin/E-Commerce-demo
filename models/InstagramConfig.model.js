import mongoose from "mongoose"

const instagramConfigSchema = new mongoose.Schema({
    // Business Account Settings
    businessAccount: {
        isConnected: { type: Boolean, default: false },
        accountId: { type: String, default: null },
        username: { type: String, default: null },
        accessToken: { type: String, default: null },
        refreshToken: { type: String, default: null },
        tokenExpiry: { type: Date, default: null },
        profilePicture: { type: String, default: null },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        mediaCount: { type: Number, default: 0 }
    },

    // Shop Settings
    shop: {
        isEnabled: { type: Boolean, default: false },
        commerceAccountId: { type: String, default: null },
        productCatalogId: { type: String, default: null },
        checkoutEnabled: { type: Boolean, default: false },
        shippingCountries: [{ type: String }],
        currency: { type: String, default: 'BDT' }
    },

    // Content Settings
    content: {
        autoPostProducts: { type: Boolean, default: false },
        defaultHashtags: [{ type: String }],
        postingSchedule: {
            enabled: { type: Boolean, default: false },
            times: [{ type: String }] // ["10:00", "14:00", "19:00"]
        },
        storyTemplates: [{
            name: String,
            template: String,
            isActive: Boolean
        }]
    },

    // Messaging & Automation
    messaging: {
        autoReplyEnabled: { type: Boolean, default: false },
        welcomeMessage: { type: String, default: null },
        awayMessage: { type: String, default: null },
        quickReplies: [{
            keyword: String,
            response: String,
            isActive: Boolean
        }],
        aiChatbot: {
            enabled: { type: Boolean, default: false },
            provider: { type: String, default: 'openai' },
            apiKey: { type: String, default: null }
        }
    },

    // Ads Settings
    ads: {
        adAccountId: { type: String, default: null },
        pixelId: { type: String, default: null },
        defaultCampaignBudget: { type: Number, default: 1000 },
        automatedAds: {
            enabled: { type: Boolean, default: false },
            productPromotion: { type: Boolean, default: false },
            retargeting: { type: Boolean, default: false }
        }
    },

    // Analytics Settings
    analytics: {
        trackingEnabled: { type: Boolean, default: true },
        metricsToTrack: [{
            type: String,
            enum: ['impressions', 'reach', 'engagement', 'saves', 'shares', 'profile_visits', 'website_clicks']
        }],
        reportSchedule: {
            enabled: { type: Boolean, default: false },
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
            emailRecipients: [{ type: String }]
        }
    },

    // Influencer Settings
    influencers: {
        enabled: { type: Boolean, default: false },
        affiliateCommission: { type: Number, default: 10 }, // percentage
        approvedInfluencers: [{
            instagramId: String,
            username: String,
            commissionRate: Number,
            discountCode: String,
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
        }]
    },

    // API Configuration
    apiConfig: {
        appId: { type: String, default: null },
        appSecret: { type: String, default: null },
        webhookSecret: { type: String, default: null },
        apiVersion: { type: String, default: 'v18.0' }
    },

    // Status & Timestamps
    isActive: { type: Boolean, default: false },
    lastSyncAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }

}, { timestamps: true })

const InstagramConfigModel = (mongoose.models && mongoose.models.InstagramConfig) || mongoose.model('InstagramConfig', instagramConfigSchema, 'instagram_configs')
export default InstagramConfigModel
