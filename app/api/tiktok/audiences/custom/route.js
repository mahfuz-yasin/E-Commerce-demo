import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"
import crypto from 'crypto'

/**
 * Hash data using SHA256 (required by TikTok DMP)
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  return crypto.createHash('sha256').update(normalizeData(data)).digest('hex')
}

/**
 * Normalize data before hashing
 * @param {string} data - Data to normalize
 * @returns {string} Normalized data
 */
function normalizeData(data) {
  return data.toString().toLowerCase().trim()
}

/**
 * Process CSV data and hash emails/phones
 * @param {string} csvData - CSV content
 * @returns {array} Array of hashed data
 */
function processCSVData(csvData) {
  const lines = csvData.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  const emailIndex = headers.indexOf('email')
  const phoneIndex = headers.indexOf('phone')
  
  const hashedData = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    
    if (emailIndex !== -1 && values[emailIndex]) {
      row.email = hashSHA256(values[emailIndex])
    }
    
    if (phoneIndex !== -1 && values[phoneIndex]) {
      row.phone = hashSHA256(values[phoneIndex])
    }
    
    if (Object.keys(row).length > 0) {
      hashedData.push(row)
    }
  }
  
  return hashedData
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, type, method, rules, csvData } = body

    if (!name) {
      return response(false, 400, 'Audience name is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    let audienceData = {
      advertiser_id: config.adAccountId,
      audience_name: name,
      description: description || ''
    }

    if (method === 'file' && csvData) {
      // File upload method - process CSV
      const hashedData = processCSVData(csvData)
      
      audienceData.audience_type = 'FILE'
      audienceData.audience_rule = {
        inclusion: hashedData
      }
    } else if (method === 'rule' && rules) {
      // Rule-based method
      audienceData.audience_type = 'RULE'
      audienceData.audience_rule = {
        inclusion: {
          url: rules.url || undefined,
          visit_frequency: rules.visitFrequency || undefined,
          time_on_site: rules.timeOnSite || undefined,
          page_views: rules.pageViews || undefined
        }
      }
    } else if (method === 'pangle') {
      // Pangle audience package
      audienceData.audience_type = 'PANGLE'
      audienceData.pangle_audience_id = rules.pangleAudienceId
    }

    const endpoint = `/audience/create/`
    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: audienceData
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to create custom audience')
    }

    return response(true, 200, 'Custom audience created successfully', result.data)
  } catch (error) {
    console.error('Error creating custom audience:', error)
    return response(false, 500, error.message || 'Failed to create custom audience')
  }
}
