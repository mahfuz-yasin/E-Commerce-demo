import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ContactConfigModel from "@/models/ContactConfig.model";

// Public GET endpoint for contact configuration
export async function GET() {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning default contact config')
            // Return default config
            return response(true, 200, 'Contact config fetched successfully', {
                companyName: 'Al-Hilal Panjabi',
                address: {
                    line1: 'Magura Sadar',
                    line2: 'Magura',
                    city: 'Magura',
                    district: 'Khulna Division',
                    country: 'Bangladesh'
                },
                phone: {
                    primary: '+880 1810-841539',
                    secondary: ''
                },
                email: {
                    primary: 'info@alhilalpanjabi.com',
                    support: 'support@alhilalpanjabi.com'
                },
                businessHours: {
                    days: 'Sat - Thu',
                    hours: '9AM - 8PM'
                },
                socialLinks: {
                    facebook: '#',
                    whatsapp: 'https://wa.me/8801810841539',
                    instagram: '#',
                    twitter: '',
                    youtube: ''
                },
                mapEmbedUrl: '',
                pageTitle: 'Contact Us',
                pageSubtitle: 'Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.'
            })
        }
        
        await connectDB();
        
        const config = await ContactConfigModel.getConfig();
        
        return response(true, 200, 'Contact config fetched successfully', config);
        
    } catch (error) {
        console.error('Error fetching contact config:', error);
        return catchError(error, 'Failed to fetch contact configuration.')
    }
}
