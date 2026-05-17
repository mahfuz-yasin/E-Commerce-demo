import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AdABTestModel from "@/models/AdABTest.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET A/B test results
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
        
        // Fetch latest results from Facebook if test is running
        if (test.status === 'running' && test.facebookTestId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    const fbResults = await metaMarketingAPI.getABTestResults({
                        testId: test.facebookTestId,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbResults.success) {
                        // Update results in database
                        test.results = fbResults.data.variants.map(variant => ({
                            variantId: variant.id,
                            variantName: variant.name,
                            impressions: variant.impressions || 0,
                            clicks: variant.clicks || 0,
                            spend: variant.spend || 0,
                            conversions: variant.conversions || 0,
                            revenue: variant.revenue || 0,
                            roas: variant.roas || 0,
                            ctr: variant.ctr || 0,
                            cpc: variant.cpc || 0,
                            cpa: variant.cpa || 0,
                            conversionRate: variant.conversionRate || 0,
                            statisticalSignificance: variant.statisticalSignificance || false,
                            pValue: variant.pValue || null,
                            confidenceInterval: variant.confidenceInterval || null
                        }))
                        
                        // Calculate winner if auto selection is enabled and minimum sample size reached
                        if (test.autoWinnerSelection && test.totalImpressions >= test.minimumSampleSize) {
                            const winner = calculateWinner(test, test.winnerCriteria)
                            if (winner) {
                                test.winner = {
                                    variantId: winner.variantId,
                                    variantName: winner.variantName,
                                    reason: winner.reason,
                                    selectedAt: new Date(),
                                    applied: false
                                }
                            }
                        }
                        
                        await AdABTestModel.findByIdAndUpdate(params.id, test)
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        // Calculate statistical analysis
        const analysis = calculateStatisticalAnalysis(test)
        
        return response(true, 200, 'Results fetched successfully', {
            test,
            analysis
        })
    } catch (error) {
        return catchError(error)
    }
}

// POST apply winner
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const test = await AdABTestModel.findById(params.id)
        
        if (!test) {
            return response(false, 404, 'A/B test not found')
        }
        
        if (!test.winner) {
            return response(false, 400, 'No winner selected yet')
        }
        
        // Apply winner to Facebook
        try {
            const fbConfig = await FacebookConfigModel.getConfig()
            if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                const result = await metaMarketingAPI.applyABTestWinner({
                    testId: test.facebookTestId,
                    winnerVariantId: test.winner.variantId,
                    accessToken: fbConfig.adAccountAccessToken
                })
                
                if (result.success) {
                    test.winner.applied = true
                    test.status = 'completed'
                    test.updatedBy = auth.user?.id || 'system'
                    await test.save()
                    
                    return response(true, 200, 'Winner applied successfully', test)
                } else {
                    return response(false, 500, result.message || 'Failed to apply winner')
                }
            } else {
                return response(false, 400, 'Facebook campaign manager is not configured')
            }
        } catch (error) {
            return catchError(error)
        }
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to calculate winner
function calculateWinner(test, criteria) {
    if (!test.results || test.results.length === 0) {
        return null
    }
    
    let winner = null
    let bestValue = -Infinity
    
    test.results.forEach(result => {
        let value = 0
        switch (criteria) {
            case 'roas':
                value = result.roas || 0
                break
            case 'cpa':
                value = result.cpa ? 1 / result.cpa : 0
                break
            case 'ctr':
                value = result.ctr || 0
                break
            case 'conversions':
                value = result.conversions || 0
                break
        }
        
        if (value > bestValue) {
            bestValue = value
            winner = {
                variantId: result.variantId,
                variantName: result.variantName,
                reason: `Best ${criteria}: ${value.toFixed(2)}`
            }
        }
    })
    
    return winner
}

// Helper function to calculate statistical analysis
function calculateStatisticalAnalysis(test) {
    if (!test.results || test.results.length < 2) {
        return {
            significance: false,
            confidence: 0,
            recommendation: 'Not enough data for analysis'
        }
    }
    
    const control = test.results[0]
    const treatment = test.results[1]
    
    // Calculate lift
    const lift = {
        impressions: ((treatment.impressions - control.impressions) / control.impressions) * 100,
        clicks: ((treatment.clicks - control.clicks) / control.clicks) * 100,
        conversions: ((treatment.conversions - control.conversions) / control.conversions) * 100,
        roas: ((treatment.roas - control.roas) / control.roas) * 100
    }
    
    // Simple statistical significance check (Z-test approximation)
    const pValue = calculatePValue(control.conversions, control.impressions, treatment.conversions, treatment.impressions)
    const isSignificant = pValue < (test.confidenceLevel / 100)
    
    return {
        lift,
        significance: isSignificant,
        confidence: (1 - pValue) * 100,
        pValue,
        recommendation: isSignificant 
            ? 'Statistically significant difference detected' 
            : 'Not statistically significant yet'
    }
}

// Helper function to calculate p-value (simplified Z-test)
function calculatePValue(controlConversions, controlImpressions, treatmentConversions, treatmentImpressions) {
    const p1 = controlConversions / controlImpressions
    const p2 = treatmentConversions / treatmentImpressions
    const pooledP = (controlConversions + treatmentConversions) / (controlImpressions + treatmentImpressions)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/controlImpressions + 1/treatmentImpressions))
    const z = (p2 - p1) / se
    
    // Approximate p-value from Z-score (simplified)
    const absZ = Math.abs(z)
    if (absZ < 1.96) return 0.05 // Not significant at 95%
    if (absZ < 2.58) return 0.01 // Significant at 95%
    return 0.001 // Highly significant
}
