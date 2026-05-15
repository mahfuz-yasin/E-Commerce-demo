import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import LeadModel from "@/models/Lead.model"
import nodemailer from 'nodemailer'

export async function POST(request) {
    try {
        await connectDB()

        // Create a sample lead for testing
        const sampleLead = {
            facebookLeadId: `test_${Date.now()}`,
            adId: 'test_ad_123',
            formId: 'test_form_123',
            formName: 'Test Form',
            pageId: 'test_page_123',
            campaignId: 'test_campaign_123',
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '+8801700000000',
            customFields: new Map([
                ['City', 'Dhaka'],
                ['Interest', 'Panjabi']
            ])
        }

        const newLead = await LeadModel.create(sampleLead)

        // Send test email notification
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'test@example.com',
                    pass: process.env.EMAIL_PASSWORD || 'test'
                }
            })

            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'test@example.com',
                to: process.env.EMAIL_USER || 'test@example.com',
                subject: 'Test Lead Received',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1877f2;">Test Lead Received</h2>
                        <p>This is a test lead from Facebook Lead Ads webhook.</p>
                        
                        <div style="background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Lead Details</h3>
                            <p><strong>Name:</strong> ${sampleLead.fullName}</p>
                            <p><strong>Email:</strong> ${sampleLead.email}</p>
                            <p><strong>Phone:</strong> ${sampleLead.phone}</p>
                            <p><strong>Form:</strong> ${sampleLead.formName}</p>
                            <p><strong>Lead ID:</strong> ${sampleLead.facebookLeadId}</p>
                        </div>

                        <p style="color: #666; font-size: 14px;">This is a test webhook from Al Hilal Panjabi.</p>
                    </div>
                `
            })
        } catch (error) {
            console.error('Error sending test email:', error)
        }

        return response(true, 200, 'Test webhook processed successfully.', { leadId: newLead._id })

    } catch (error) {
        return catchError(error)
    }
}
