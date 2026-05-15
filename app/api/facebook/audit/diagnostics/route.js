import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'
import { validatePattern } from "@/lib/validation"

export async function POST(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()

        const statusData = {
            pixel: { status: 'unknown', message: 'Not configured' },
            capi: { status: 'unknown', message: 'Not configured' },
            businessManager: { status: 'unknown', message: 'Not configured' },
            catalog: { status: 'unknown', message: 'Not configured' },
            messenger: { status: 'unknown', message: 'Not configured' },
            leadAds: { status: 'unknown', message: 'Not configured' },
            webhooks: { status: 'unknown', message: 'Not configured' }
        }

        // Check Pixel Status
        if (config.pixelId && config.pixelStatus === 'active') {
            if (validatePattern(config.pixelId, 'pixelId')) {
                statusData.pixel = { status: 'healthy', message: 'Pixel ID is valid and active' }
            } else {
                statusData.pixel = { status: 'error', message: 'Invalid Pixel ID format' }
            }
        } else {
            statusData.pixel = { status: 'warning', message: 'Pixel not configured or inactive' }
        }

        // Check CAPI Status
        if (config.capiAccessToken && config.capiStatus === 'active') {
            try {
                // Validate token format
                if (validatePattern(config.capiAccessToken, 'accessToken')) {
                    // Check token expiration
                    const tokenData = parseJWT(config.capiAccessToken)
                    if (tokenData && tokenData.exp) {
                        const expiryDate = new Date(tokenData.exp * 1000)
                        const now = new Date()
                        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
                        
                        if (daysUntilExpiry <= 0) {
                            statusData.capi = { status: 'error', message: 'Token has expired' }
                        } else if (daysUntilExpiry <= 7) {
                            statusData.capi = { status: 'warning', message: `Token expires in ${daysUntilExpiry} days` }
                        } else {
                            statusData.capi = { status: 'healthy', message: 'Token is valid' }
                        }
                    } else {
                        statusData.capi = { status: 'error', message: 'Invalid token format' }
                    }
                } else {
                    statusData.capi = { status: 'error', message: 'Invalid token format' }
                }
            } catch (error) {
                statusData.capi = { status: 'error', message: 'Token validation failed' }
            }
        } else {
            statusData.capi = { status: 'warning', message: 'CAPI not configured or inactive' }
        }

        // Check Business Manager Status
        if (config.businessManagerId && config.businessManagerStatus === 'active') {
            if (validatePattern(config.businessManagerId, 'businessManagerId')) {
                statusData.businessManager = { status: 'healthy', message: 'Business Manager ID is valid' }
            } else {
                statusData.businessManager = { status: 'error', message: 'Invalid Business Manager ID format' }
            }
        } else {
            statusData.businessManager = { status: 'warning', message: 'Business Manager not configured' }
        }

        // Check Catalog Status
        if (config.catalogId && config.catalogStatus === 'active') {
            if (validatePattern(config.catalogId, 'catalogId')) {
                const daysSinceSync = config.lastCatalogSync 
                    ? Math.floor((new Date() - new Date(config.lastCatalogSync)) / (1000 * 60 * 60 * 24))
                    : null
                
                if (daysSinceSync !== null && daysSinceSync > 7) {
                    statusData.catalog = { status: 'warning', message: `Catalog last synced ${daysSinceSync} days ago` }
                } else {
                    statusData.catalog = { status: 'healthy', message: 'Catalog is active and synced' }
                }
            } else {
                statusData.catalog = { status: 'error', message: 'Invalid Catalog ID format' }
            }
        } else {
            statusData.catalog = { status: 'warning', message: 'Catalog not configured' }
        }

        // Check Messenger Status
        if (config.messengerPageId && config.messengerStatus === 'active') {
            if (validatePattern(config.messengerPageId, 'pageId')) {
                statusData.messenger = { status: 'healthy', message: 'Messenger is configured' }
            } else {
                statusData.messenger = { status: 'error', message: 'Invalid Page ID format' }
            }
        } else {
            statusData.messenger = { status: 'warning', message: 'Messenger not configured' }
        }

        // Check Lead Ads Status
        if (config.leadAdsStatus === 'active' && config.appId && config.appSecret) {
            statusData.leadAds = { status: 'healthy', message: 'Lead Ads is configured' }
        } else {
            statusData.leadAds = { status: 'warning', message: 'Lead Ads not configured' }
        }

        // Check Webhook Status
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alhilalpanjabi.com'
        const webhookUrl = `${baseUrl}/api/webhooks/facebook/leadgen`
        statusData.webhooks = { status: 'healthy', message: `Webhook endpoint: ${webhookUrl}` }

        return response(true, 200, 'Diagnostics completed successfully.', statusData)

    } catch (error) {
        return catchError(error)
    }
}

function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    } catch (error) {
        return null
    }
}
