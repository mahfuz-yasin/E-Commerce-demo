import dynamic from 'next/dynamic'
import "./globals.css";
import { Assistant } from 'next/font/google'
import FacebookPixel from '@/components/FacebookPixel/FacebookPixel'
import ScrollProgress from '@/components/ui/ScrollProgress'
import { connectDB } from "@/lib/databaseConnection"
import FacebookConfigModel from "@/models/FacebookConfig.model"
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const GlobalProvider = dynamic(() => import('@/components/Application/GlobalProvider'))

export async function generateMetadata() {
  try {
    await connectDB()
    const config = await FacebookConfigModel.getConfig()
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
    
    return {
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
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: "Al-Hilal Panjabi",
      description: "Premium Ethnic Wear for Men",
    }
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
        <ScrollProgress />
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
