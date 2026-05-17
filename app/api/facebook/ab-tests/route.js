import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AdABTestModel from "@/models/AdABTest.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all A/B tests
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const testType = searchParams.get('testType')
        const adAccountId = searchParams.get('adAccountId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (testType) {
            query.testType = testType
        }
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        
        const tests = await AdABTestModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'A/B tests fetched successfully', tests)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new A/B test
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.testName || !payload.testType || !payload.adAccountId) {
            return response(false, 400, 'Missing required fields: testName, testType, adAccountId')
        }
        
        // Validate variants
        if (!payload.variants || payload.variants.length < 2) {
            return response(false, 400, 'At least 2 variants are required for A/B testing')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Set end date based on duration
        if (payload.duration && payload.startDate) {
            const endDate = new Date(payload.startDate)
            endDate.setDate(endDate.getDate() + payload.duration)
            payload.endDate = endDate
        }
        
        // Create A/B test
        const test = await AdABTestModel.create(payload)
        
        // Sync with Facebook if status is running
        if (payload.status === 'running') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    // Create A/B test in Facebook
                    const fbTest = await metaMarketingAPI.createABTest({
                        testName: payload.testName,
                        testType: payload.testType,
                        adAccountId: payload.adAccountId,
                        variants: payload.variants,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbTest.success) {
                        test.facebookTestId = fbTest.data.id
                        test.syncStatus = 'synced'
                        test.lastSyncAt = new Date()
                        await test.save()
                    } else {
                        test.syncStatus = 'failed'
                        await test.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                test.syncStatus = 'failed'
                await test.save()
            }
        }
        
        return response(true, 201, 'A/B test created successfully', test)
    } catch (error) {
        return catchError(error)
    }
}
