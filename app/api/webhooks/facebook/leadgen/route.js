import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import LeadModel from "@/models/Lead.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { rateLimit } from "@/lib/rateLimiter"

// Rate limiter: 100 requests per minute for webhook
const limiter = rateLimit(100, 60000, 'facebook-webhook')

// Verify webhook signature
function verifyWebhookSignature(payload, signature, appSecret) {
    const expectedSignature = crypto
        .createHmac('sha1', appSecret)
        .update(payload)
        .digest('hex')
    
    return signature === expectedSignature
}

// Send email notification for new lead
async function sendLeadNotification(lead) {
    try {
        const config = await FacebookConfigModel.getConfig()
        
        if (!config.email || config.emailStatus !== 'active') {
            return
        }

        const transporter = nodemailer.createTransport({
            host: config.emailHost || 'smtp.gmail.com',
            port: config.emailPort || 587,
            secure: false,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })

        const mailOptions = {
            from: config.emailUser,
            to: config.email,
            subject: `New Lead from Facebook: ${lead.fullName || 'Unknown'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1877f2;">New Lead Received</h2>
                    <p>You have received a new lead from Facebook Lead Ads.</p>
                    
                    <div style="background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Lead Details</h3>
                        <p><strong>Name:</strong> ${lead.fullName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
                        <p><strong>Form:</strong> ${lead.formName || 'N/A'}</p>
                        <p><strong>Lead ID:</strong> ${lead.facebookLeadId}</p>
                        <p><strong>Date:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
                    </div>

                    ${Object.keys(lead.customFields).length > 0 ? `
                        <div style="background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Custom Fields</h3>
                            ${Object.entries(lead.customFields).map(([key, value]) => `
                                <p><strong>${key}:</strong> ${value}</p>
                            `).join('')}
                        </div>
                    ` : ''}

                    <p style="color: #666; font-size: 14px;">This is an automated message from Al Hilal Panjabi.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error('Error sending lead notification email:', error)
    }
}

export async function POST(request) {
    try {
        // Apply rate limiting
        const rateLimitResult = await limiter(request)
        if (!rateLimitResult.success) {
            return response(false, 429, 'Rate limit exceeded')
        }

        const payload = await request.text()
        const signature = request.headers.get('x-hub-signature')?.replace('sha1=', '')

        await connectDB()
        const config = await FacebookConfigModel.getConfig()
        
        // Verify webhook signature
        if (config.appSecret && !verifyWebhookSignature(payload, signature, config.appSecret)) {
            return response(false, 403, 'Invalid webhook signature')
        }

        const body = JSON.parse(payload)
        
        if (body.object !== 'page') {
            return response(true, 200, 'Not a page event')
        }

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                if (change.field === 'leadgen') {
                    const leadData = change.value
                    
                    // Extract lead information
                    const leadInfo = {
                        facebookLeadId: leadData.leadgen_id,
                        adId: leadData.ad_id,
                        formId: leadData.form_id,
                        formName: leadData.form_name || '',
                        pageId: leadData.page_id,
                        campaignId: leadData.campaign_id || '',
                        fullName: '',
                        email: '',
                        phone: '',
                        customFields: new Map()
                    }

                    // Parse field data
                    if (leadData.field_data) {
                        for (const field of leadData.field_data) {
                            const key = field.name.toLowerCase()
                            const value = field.values?.[0] || ''
                            
                            if (key === 'full_name' || key === 'name') {
                                leadInfo.fullName = value
                            } else if (key === 'email') {
                                leadInfo.email = value
                            } else if (key === 'phone' || key === 'phone_number') {
                                leadInfo.phone = value
                            } else {
                                leadInfo.customFields.set(field.name, value)
                            }
                        }
                    }

                    // Check if lead already exists
                    const existingLead = await LeadModel.findOne({ facebookLeadId: leadInfo.facebookLeadId })
                    
                    if (!existingLead) {
                        // Create new lead
                        const newLead = await LeadModel.create(leadInfo)
                        
                        // Send email notification
                        await sendLeadNotification(newLead)

                        // Auto-reply if configured
                        if (config.autoReplyStatus === 'active' && config.autoReplyMessage) {
                            try {
                                const transporter = nodemailer.createTransport({
                                    host: config.emailHost || 'smtp.gmail.com',
                                    port: config.emailPort || 587,
                                    secure: false,
                                    auth: {
                                        user: config.emailUser,
                                        pass: config.emailPassword
                                    }
                                })

                                if (leadInfo.email) {
                                    await transporter.sendMail({
                                        from: config.emailUser,
                                        to: leadInfo.email,
                                        subject: 'Thank you for your interest!',
                                        html: `
                                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                                <h2 style="color: #1877f2;">Thank You!</h2>
                                                <p>${config.autoReplyMessage}</p>
                                                <p style="color: #666;">Best regards,<br>Al Hilal Panjabi Team</p>
                                            </div>
                                        `
                                    })
                                }
                            } catch (error) {
                                console.error('Error sending auto-reply email:', error)
                            }
                        }
                    }
                }
            }
        }

        return response(true, 200, 'Webhook received successfully')

    } catch (error) {
        console.error('Webhook error:', error)
        return catchError(error)
    }
}

export async function GET(request) {
    return response(true, 200, 'Webhook endpoint is active')
}
