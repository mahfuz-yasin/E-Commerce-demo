/**
 * Product Details Page - Server Component
 * Uses new architecture: Server Component (ProductServer) + Client Component (ProductClient)
 * 
 * Error Fix: Digest 4262646709@E237 was caused by mixing server data fetching with client logic
 * Solution: Complete separation - Server handles data fetching, Client handles interactivity
 */

import ProductServer from './ProductServer'

export const metadata = {
  title: 'Product Details | Al-Hilal Panjabi',
  description: 'Shop premium quality ethnic wear for men at Al-Hilal Panjabi.',
}

const ProductPage = async ({ params, searchParams }) => {
  // Use the new Server Component architecture
  return <ProductServer params={params} searchParams={searchParams} />
}

export default ProductPage