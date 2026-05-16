import { connectDB } from "@/lib/databaseConnection"
import ProductModel from "@/models/Product.model"
import { response } from "@/lib/helperFunction"

/**
 * Product Data Quality Checker
 * Validates feed before submission
 */
export async function GET(request) {
  try {
    await connectDB()

    const products = await ProductModel.find({ status: 'active' })
      .populate('category')
      .populate('media')
      .lean()

    const issues = []
    let validProducts = 0

    for (const product of products) {
      let productIssues = []

      // Check required fields
      if (!product.name || product.name.trim() === '') {
        productIssues.push(`Product ID ${product._id}: Missing title`)
      }

      if (!product.shortDescription && !product.description) {
        productIssues.push(`Product ID ${product._id}: Missing description`)
      }

      if (!product.sellingPrice || product.sellingPrice <= 0) {
        productIssues.push(`Product ID ${product._id}: Invalid price`)
      }

      if (!product.category || !product.category.name) {
        productIssues.push(`Product ID ${product._id}: Missing category`)
      }

      // Check images
      if (!product.media || product.media.length === 0) {
        productIssues.push(`Product ID ${product._id}: Missing images`)
      } else {
        const primaryImage = product.media[0]
        if (typeof primaryImage === 'object' && !primaryImage.secure_url) {
          productIssues.push(`Product ID ${product._id}: Invalid primary image`)
        }
      }

      // Check GTIN/MPN
      if (!product.gtin && !product.mpn && !product.sku) {
        productIssues.push(`Product ID ${product._id}: Missing GTIN/MPN/SKU (recommended)`)
      }

      // Check availability
      if (product.stock === undefined || product.stock === null) {
        productIssues.push(`Product ID ${product._id}: Missing stock information`)
      }

      if (productIssues.length > 0) {
        issues.push(...productIssues)
      } else {
        validProducts++
      }
    }

    const qualityReport = {
      totalProducts: products.length,
      validProducts,
      issues: issues.slice(0, 100), // Limit to first 100 issues
      issueCount: issues.length,
      qualityScore: products.length > 0 ? Math.round((validProducts / products.length) * 100) : 0
    }

    return response(true, 200, 'Quality check completed', qualityReport)
  } catch (error) {
    console.error('Error during quality check:', error)
    return response(false, 500, error.message || 'Quality check failed')
  }
}
