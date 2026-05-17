import dynamic from 'next/dynamic'
import "./globals.css";
import { Assistant } from 'next/font/google'
import FacebookPixel from '@/components/FacebookPixel/FacebookPixel'
import ScrollProgress from '@/components/ui/ScrollProgress'
// Note: Database imports moved inside generateMetadata for safety
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const GlobalProvider = dynamic(() => import('@/components/Application/GlobalProvider'))

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
  
  const defaultMetadata = {
    title: {
      default: "Al-Hilal Panjabi | Premium Ethnic Wear for Men",
      template: "%s | Al-Hilal Panjabi",
    },
    description: "Discover the finest collection of premium Panjabis at Al-Hilal. From traditional designs to modern ethnic wear, experience quality craftsmanship and elegance.",
    keywords: ["Panjabi", "Men's Ethnic Wear", "Al-Hilal Panjabi", "Traditional Wear Bangladesh", "Designer Panjabi"],
    authors: [{ name: "Al-Hilal Panjabi" }],
    creator: "Al-Hilal Panjabi",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: "Al-Hilal Panjabi",
      title: "Al-Hilal Panjabi | Premium Ethnic Wear",
      description: "Shop the latest collection of high-quality, stylish Panjabis. Perfect for Eid, weddings, and special occasions.",
      images: [
        {
          url: `${baseUrl}/logo.webp`,
          width: 1200,
          height: 630,
          alt: "Al-Hilal Panjabi Collection",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Al-Hilal Panjabi",
      description: "Premium Panjabis for the modern man.",
      images: [`${baseUrl}/logo.webp`],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
  
  try {
    // Only try to connect to DB if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, using default metadata')
      return defaultMetadata
    }
    
    // Dynamic imports to prevent module initialization errors
    const { connectDB } = await import('@/lib/databaseConnection')
    const { default: FacebookConfigModel } = await import('@/models/FacebookConfig.model')
    
    // Wrap DB connection in separate try-catch
    try {
      await connectDB()
    } catch (dbError) {
      console.error('Database connection error in generateMetadata:', dbError)
      return defaultMetadata
    }
    
    // Facebook config is not critical for metadata - wrap separately
    try {
      await FacebookConfigModel.getConfig()
    } catch (fbError) {
      console.error('Facebook config error (non-critical):', fbError)
    }
    
    return defaultMetadata
  } catch (error) {
    console.error('Unexpected error in generateMetadata:', error)
    // Always return default metadata on any error
    return defaultMetadata
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Temporarily disabled FacebookPixel for debugging */}
        {/* {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && <FacebookPixel />} */}
      </head>
      <body
        className={`${assistantFont.className} antialiased`}
      >
        {/* Temporarily disabled ScrollProgress for debugging */}
        {/* <ScrollProgress /> */}
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
