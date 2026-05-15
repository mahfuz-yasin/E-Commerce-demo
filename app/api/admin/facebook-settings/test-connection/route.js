import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        const { type } = payload

        const config = await FacebookConfigModel.getConfig()

        let testResult = { success: false, message: '' }

        switch (type) {
            case 'App ID':
                testResult = await testAppId(config.appId, config.appSecret)
                break
            case 'Pixel ID':
                testResult = await testPixel(config.pixelId, config.appId, config.appSecret)
                break
            case 'CAPI Access Token':
                testResult = await testCAPI(config.capiAccessToken, config.pixelId)
                break
            case 'Page ID':
                testResult = await testPage(config.pageId, config.appId, config.appSecret)
                break
            default:
                testResult = { success: false, message: 'Invalid test type' }
        }

        return response(testResult.success, testResult.success ? 200 : 400, testResult.message)

    } catch (error) {
        return catchError(error)
    }
}

async function testAppId(appId, appSecret) {
    try {
        if (!appId) {
            return { success: false, message: 'App ID is required' }
        }

        // Basic validation - check if it's a numeric string
        if (!/^\d+$/.test(appId)) {
            return { success: false, message: 'Invalid App ID format. Must be numeric.' }
        }

        // In production, you would make a real API call to Facebook Graph API
        // Example: const response = await axios.get(`https://graph.facebook.com/${config.apiVersion}/${appId}?access_token=${accessToken}`)
        
        return { success: true, message: 'App ID format is valid' }
    } catch (error) {
        return { success: false, message: 'App ID validation failed' }
    }
}

async function testPixel(pixelId, appId, appSecret) {
    try {
        if (!pixelId) {
            return { success: false, message: 'Pixel ID is required' }
        }

        // Basic validation - check if it's a numeric string
        if (!/^\d+$/.test(pixelId)) {
            return { success: false, message: 'Invalid Pixel ID format. Must be numeric.' }
        }

        // In production, you would make a real API call to Facebook Graph API
        // const response = await axios.get(`https://graph.facebook.com/${config.apiVersion}/${pixelId}?access_token=${accessToken}`)

        return { success: true, message: 'Pixel ID format is valid' }
    } catch (error) {
        return { success: false, message: 'Pixel ID validation failed' }
    }
}

async function testCAPI(capiAccessToken, pixelId) {
    try {
        if (!capiAccessToken) {
            return { success: false, message: 'CAPI Access Token is required' }
        }

        // Basic validation - check if token is long enough
        if (capiAccessToken.length < 50) {
            return { success: false, message: 'Invalid CAPI Access Token format. Token seems too short.' }
        }

        // In production, you would send a test event to Facebook
        // const response = await axios.post(`https://graph.facebook.com/${config.apiVersion}/${pixelId}/events`, {
        //     data: [{
        //         event_name: 'TestEvent',
        //         event_time: Math.floor(Date.now() / 1000),
        //         event_source_url: 'https://example.com',
        //         action_source: 'website',
        //         user_data: {}
        //     }],
        //     access_token: capiAccessToken
        // })

        return { success: true, message: 'CAPI Access Token format is valid' }
    } catch (error) {
        return { success: false, message: 'CAPI Access Token validation failed' }
    }
}

async function testPage(pageId, appId, appSecret) {
    try {
        if (!pageId) {
            return { success: false, message: 'Page ID is required' }
        }

        // Basic validation - check if it's a numeric string
        if (!/^\d+$/.test(pageId)) {
            return { success: false, message: 'Invalid Page ID format. Must be numeric.' }
        }

        // In production, you would make a real API call to Facebook Graph API
        // const response = await axios.get(`https://graph.facebook.com/${config.apiVersion}/${pageId}?access_token=${accessToken}`)

        return { success: true, message: 'Page ID format is valid' }
    } catch (error) {
        return { success: false, message: 'Page ID validation failed' }
    }
}
