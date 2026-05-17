import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import LeadScoringRuleModel from "@/models/LeadScoringRule.model"
import User from "@/models/User.model"

// POST score leads
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const { ruleId, userId } = await request.json()
        
        if (!ruleId) {
            return response(false, 400, 'Rule ID is required')
        }
        
        const rule = await LeadScoringRuleModel.findById(ruleId)
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        if (rule.status !== 'active') {
            return response(false, 400, 'Rule is not active')
        }
        
        // Get user(s) to score
        let users = []
        if (userId) {
            const user = await User.findById(userId).lean()
            if (user) users = [user]
        } else {
            // Score all users (limit to recent ones for performance)
            users = await User.find({}).limit(100).lean()
        }
        
        // Score each user
        const scoredUsers = users.map(user => {
            let score = 0
            const criteriaResults = []
            
            rule.scoringCriteria.forEach(criterion => {
                const result = evaluateCriterion(user, criterion)
                if (result.passed) {
                    score += criterion.points * criterion.weight
                }
                criteriaResults.push({
                    criterionName: criterion.criterionName,
                    passed: result.passed,
                    points: result.passed ? criterion.points * criterion.weight : 0
                })
            })
            
            // Determine lead category
            let category = 'cold'
            for (const threshold of rule.scoreThresholds) {
                if (score >= threshold.minScore && score <= threshold.maxScore) {
                    category = threshold.thresholdName
                    break
                }
            }
            
            return {
                userId: user._id,
                email: user.email,
                score,
                maxScore: rule.maxScore,
                category,
                criteriaResults
            }
        })
        
        // Update rule performance
        rule.performance.totalLeadsScored += scoredUsers.length
        rule.performance.hotLeads += scoredUsers.filter(u => u.category === 'hot').length
        rule.performance.warmLeads += scoredUsers.filter(u => u.category === 'warm').length
        rule.performance.coldLeads += scoredUsers.filter(u => u.category === 'cold').length
        rule.performance.avgScore = scoredUsers.reduce((sum, u) => sum + u.score, 0) / scoredUsers.length
        rule.lastPerformanceUpdate = new Date()
        await rule.save()
        
        return response(true, 200, 'Leads scored successfully', {
            rule: {
                id: rule._id,
                name: rule.ruleName,
                maxScore: rule.maxScore
            },
            scoredUsers,
            summary: {
                totalScored: scoredUsers.length,
                hot: scoredUsers.filter(u => u.category === 'hot').length,
                warm: scoredUsers.filter(u => u.category === 'warm').length,
                cold: scoredUsers.filter(u => u.category === 'cold').length
            }
        })
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to evaluate a single criterion
function evaluateCriterion(user, criterion) {
    const fieldValue = getFieldValue(user, criterion.field)
    const result = {
        passed: false,
        points: 0
    }
    
    switch (criterion.operator) {
        case 'equals':
            result.passed = fieldValue === criterion.value
            break
        case 'not_equals':
            result.passed = fieldValue !== criterion.value
            break
        case 'contains':
            result.passed = typeof fieldValue === 'string' && fieldValue.includes(criterion.value)
            break
        case 'not_contains':
            result.passed = typeof fieldValue === 'string' && !fieldValue.includes(criterion.value)
            break
        case 'greater_than':
            result.passed = typeof fieldValue === 'number' && fieldValue > criterion.value
            break
        case 'less_than':
            result.passed = typeof fieldValue === 'number' && fieldValue < criterion.value
            break
        case 'between':
            result.passed = typeof fieldValue === 'number' && fieldValue >= criterion.value && fieldValue <= criterion.value2
            break
        case 'in_list':
            result.passed = Array.isArray(criterion.value) && criterion.value.includes(fieldValue)
            break
        case 'not_in_list':
            result.passed = Array.isArray(criterion.value) && !criterion.value.includes(fieldValue)
            break
    }
    
    return result
}

// Helper function to get field value from user object
function getFieldValue(user, field) {
    const parts = field.split('.')
    let value = user
    
    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part]
        } else {
            return null
        }
    }
    
    return value
}
