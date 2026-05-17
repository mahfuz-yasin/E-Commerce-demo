import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AdABTestModel from "@/models/AdABTest.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET single A/B test
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const test = await AdABTestModel.findById(params.id).lean()
        
        if (!test) {
            return response(false, 404, 'A/B test not found')
        }
        
        return response(true, 200, 'A/B test fetched successfully', test)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update A/B test
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const test = await AdABTestModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!test) {
            return response(false, 404, 'A/B test not found')
        }
        
        // Sync with Facebook if status changed to running
        if (payload.status === 'running' && !test.facebookTestId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    const fbTest = await metaMarketingAPI.createABTest({
                        testName: test.testName,
                        testType: test.testType,
                        adAccountId: test.adAccountId,
                        variants: test.variants,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbTest.success) {
                        test.facebookTestId = fbTest.data.id
                        test.syncStatus = 'synced'
                        test.lastSyncAt = new Date()
                        await AdABTestModel.findByIdAndUpdate(params.id, test)
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        return response(true, 200, 'A/B test updated successfully', test)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE A/B test
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const test = await AdABTestModel.findById(params.id).lean()
        
        if (!test) {
            return response(false, 404, 'A/B test not found')
        }
        
        // Delete from Facebook if test exists
        if (test.facebookTestId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    await metaMarketingAPI.deleteABTest({
                        testId: test.facebookTestId,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        await AdABTestModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'A/B test deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
