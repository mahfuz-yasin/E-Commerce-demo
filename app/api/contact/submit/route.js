import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ContactInquiryModel from "@/models/ContactInquiry.model";

export async function POST(request) {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, cannot save contact inquiry')
            return response(false, 500, 'Database not configured. Please try again later.')
        }
        
        await connectDB();
        
        const body = await request.json();
        
        // Validate required fields
        const { name, email, subject, message } = body;
        
        if (!name || !email || !subject || !message) {
            return response(false, 400, 'Please fill in all required fields.')
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response(false, 400, 'Please enter a valid email address.')
        }
        
        // Get IP and user agent
        const headers = request.headers;
        const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
        const userAgent = headers.get('user-agent') || 'unknown';
        
        // Create inquiry
        const inquiry = await ContactInquiryModel.create({
            name,
            email,
            phone: body.phone || '',
            subject,
            message,
            ipAddress,
            userAgent
        });
        
        return response(true, 201, 'Thank you! Your message has been sent successfully. We will get back to you soon.', inquiry);
        
    } catch (error) {
        console.error('Error saving contact inquiry:', error);
        return catchError(error, 'Failed to send message. Please try again later.')
    }
}
