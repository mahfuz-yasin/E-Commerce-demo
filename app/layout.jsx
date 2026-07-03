import dynamic from 'next/dynamic'
import "./globals.css";
import { Assistant } from 'next/font/google'
// Note: Using static metadata export to avoid DB connection issues
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const GlobalProvider = dynamic(() => import('@/components/Application/GlobalProvider'))

export const metadata = {
  title: {
    default: "E-Online Fashion Panjabi | Premium Ethnic Wear for Men",
    template: "%s | E-Online Fashion Panjabi",
  },
  description: "Discover the finest collection of premium Panjabis at E-Online Fashion. From traditional designs to modern ethnic wear, experience quality craftsmanship and elegance.",
  keywords: ["Panjabi", "Men's Ethnic Wear", "E-Online Fashion Panjabi", "Traditional Wear Bangladesh", "Designer Panjabi"],
  authors: [{ name: "E-Online Fashion Panjabi" }],
  creator: "E-Online Fashion Panjabi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alhilalpanjabi.com",
    siteName: "E-Online Fashion Panjabi",
    title: "E-Online Fashion Panjabi | Premium Ethnic Wear",
    description: "Shop the latest collection of high-quality, stylish Panjabis. Perfect for Eid, weddings, and special occasions.",
    images: [
      {
        url: "https://alhilalpanjabi.com/logo.webp",
        width: 1200,
        height: 630,
        alt: "E-Online Fashion Panjabi Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Online Fashion Panjabi",
    description: "Premium Panjabis for the modern man.",
    images: ["https://alhilalpanjabi.com/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${assistantFont.className} antialiased`}>
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
