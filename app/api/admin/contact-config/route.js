import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ContactConfigModel from "@/models/ContactConfig.model"

// GET contact config (admin)
export async function GET() {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, returning default contact config')
            return response(true, 200, 'Contact config fetched successfully', {
                companyName: 'E-Online Fashion Panjabi',
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
        
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const config = await ContactConfigModel.getConfig()
        
        return response(true, 200, 'Contact config fetched successfully', config)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update contact config (admin)
export async function PUT(request) {
    try {
        if (!process.env.MONGODB_URI) {
            return response(false, 500, 'Database not configured.')
        }
        
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const config = await ContactConfigModel.getConfig()
        
        // Update fields
        if (payload.companyName !== undefined) config.companyName = payload.companyName
        if (payload.address) config.address = { ...config.address, ...payload.address }
        if (payload.phone) config.phone = { ...config.phone, ...payload.phone }
        if (payload.email) config.email = { ...config.email, ...payload.email }
        if (payload.businessHours) config.businessHours = { ...config.businessHours, ...payload.businessHours }
        if (payload.socialLinks) config.socialLinks = { ...config.socialLinks, ...payload.socialLinks }
        if (payload.mapEmbedUrl !== undefined) config.mapEmbedUrl = payload.mapEmbedUrl
        if (payload.pageTitle !== undefined) config.pageTitle = payload.pageTitle
        if (payload.pageSubtitle !== undefined) config.pageSubtitle = payload.pageSubtitle
        if (payload.isActive !== undefined) config.isActive = payload.isActive
        
        await config.save()
        
        return response(true, 200, 'Contact config updated successfully', config)
    } catch (error) {
        return catchError(error)
    }
}
