export const ADMIN_DASHBOARD = '/admin/dashboard'

// Media routes
export const ADMIN_MEDIA_SHOW = '/admin/media'
export const ADMIN_MEDIA_EDIT = (id) => id ? `/admin/media/edit/${id}` : null

// Category routes

export const ADMIN_CATEGORY_ADD = '/admin/category/add'
export const ADMIN_CATEGORY_SHOW = '/admin/category'
export const ADMIN_CATEGORY_EDIT = (id) => id ? `/admin/category/edit/${id}` : null

// Product routes

export const ADMIN_PRODUCT_ADD = '/admin/product/add'
export const ADMIN_PRODUCT_SHOW = '/admin/product'
export const ADMIN_PRODUCT_EDIT = (id) => id ? `/admin/product/edit/${id}` : null


// Product Variant routes

export const ADMIN_PRODUCT_VARIANT_ADD = '/admin/product-variant/add'
export const ADMIN_PRODUCT_VARIANT_SHOW = '/admin/product-variant'
export const ADMIN_PRODUCT_VARIANT_EDIT = (id) => id ? `/admin/product-variant/edit/${id}` : null


// Coupon routes

export const ADMIN_COUPON_ADD = '/admin/coupon/add'
export const ADMIN_COUPON_SHOW = '/admin/coupon'
export const ADMIN_COUPON_EDIT = (id) => id ? `/admin/coupon/edit/${id}` : null


// Customer route
export const ADMIN_CUSTOMERS_SHOW = '/admin/customers'


// Review route
export const ADMIN_REVIEW_SHOW = '/admin/review'

// orders routes

export const ADMIN_ORDER_SHOW = '/admin/admin-orders'
export const ADMIN_ORDER_DETAILS = (order_id) => order_id ? `/admin/admin-orders/details/${order_id}` : null


// Trash route

export const ADMIN_TRASH = '/admin/trash'

// Slider routes
export const ADMIN_SLIDER = '/admin/slider'

// Features routes
export const ADMIN_FEATURES_ADD = '/admin/features/add'
export const ADMIN_FEATURES_SHOW = '/admin/features'
export const ADMIN_FEATURES_EDIT = (id) => id ? `/admin/features/edit/${id}` : null

// Settings routes
export const ADMIN_SETTINGS = '/admin/settings'

// Facebook Settings routes
export const ADMIN_FACEBOOK_SETTINGS = '/admin/facebook-settings'
export const ADMIN_FACEBOOK_PIXEL = '/admin/facebook-settings/pixel-capi'
export const ADMIN_FACEBOOK_BUSINESS = '/admin/facebook-settings/business-manager'
export const ADMIN_FACEBOOK_CATALOG = '/admin/facebook-settings/catalog'
export const ADMIN_FACEBOOK_MESSENGER = '/admin/facebook-settings/messenger'
export const ADMIN_FACEBOOK_ADVANCED = '/admin/facebook-settings/advanced'
export const ADMIN_FACEBOOK_AUDIENCES = '/admin/facebook-settings/audiences'
export const ADMIN_FACEBOOK_ANALYTICS = '/admin/facebook-settings/analytics'
export const ADMIN_FACEBOOK_LEAD_ADS = '/admin/facebook-settings/lead-ads'
export const ADMIN_FACEBOOK_DYNAMIC_ADS = '/admin/facebook-settings/dynamic-ads'
export const ADMIN_FACEBOOK_AB_TESTING = '/admin/facebook-settings/ab-testing'
export const ADMIN_FACEBOOK_BUDGET_OPTIMIZATION = '/admin/facebook-settings/budget-optimization'
export const ADMIN_FACEBOOK_SEGMENTS = '/admin/facebook-settings/segments'
export const ADMIN_FACEBOOK_RETARGETING = '/admin/facebook-settings/retargeting'
export const ADMIN_FACEBOOK_ATTRIBUTION = '/admin/facebook-settings/attribution'
export const ADMIN_FACEBOOK_PERFORMANCE_METRICS = '/admin/facebook-settings/performance-metrics'
export const ADMIN_FACEBOOK_CHATBOT = '/admin/facebook-settings/chatbot'
export const ADMIN_FACEBOOK_AUTO_RESPONSES = '/admin/facebook-settings/auto-responses'
export const ADMIN_FACEBOOK_ABANDONED_CART = '/admin/facebook-settings/abandoned-cart'
export const ADMIN_FACEBOOK_LEAD_SCORING = '/admin/facebook-settings/lead-scoring'

// TikTok Settings routes
export const ADMIN_TIKTOK_SETTINGS = '/admin/tiktoksettings'
export const ADMIN_TIKTOK_ADS_DASHBOARD = '/admin/tiktoksettings/ads-dashboard'
export const ADMIN_TIKTOK_AUDIENCES = '/admin/tiktoksettings/audiences'

// Google Settings route
export const ADMIN_GOOGLE_SETTINGS = '/admin/google'
export const ADMIN_ANALYTICS = '/admin/analytics'

export const ADMIN_FACEBOOK_PROMOTIONS = '/admin/facebook-settings/promotions'
export const ADMIN_FACEBOOK_CUSTOM_CONVERSIONS = '/admin/facebook-settings/custom-conversions'
export const ADMIN_FACEBOOK_AUDIT = '/admin/facebook-settings/audit'
export const ADMIN_FACEBOOK_CAMPAIGN_MANAGER = '/admin/facebook-settings/campaign-manager'

// Leads routes
export const ADMIN_LEADS_DASHBOARD = '/admin/leads'

// Contact Inquiry routes
export const ADMIN_CONTACT_INQUIRY = '/admin/contact-inquiry'

// Contact Config routes
export const ADMIN_CONTACT_CONFIG = '/admin/contact-config'

// Up Banner routes
export const ADMIN_UPBANNER = '/admin/upbanner'
export const ADMIN_UPBANNER_ADD = '/admin/upbanner/add'
export const ADMIN_UPBANNER_EDIT = (id) => id ? `/admin/upbanner/edit/${id}` : null

// Banner (Promo Banner) routes
export const ADMIN_BANNER_SHOW = '/admin/settings/banner'
export const ADMIN_BANNER_ADD = '/admin/settings/banner/add'
export const ADMIN_BANNER_EDIT = (id) => id ? `/admin/settings/banner/edit/${id}` : null

// Down Banner routes
export const ADMIN_DOWNBANNER = '/admin/downbanner'
export const ADMIN_DOWNBANNER_ADD = '/admin/downbanner/add'
export const ADMIN_DOWNBANNER_EDIT = (id) => id ? `/admin/downbanner/edit/${id}` : null

// Courier Settings routes
export const ADMIN_COURIER_SETTINGS = '/admin/courier-settings'
export const ADMIN_COURIER_STEADFAST = '/admin/courier-settings/steadfast'
export const ADMIN_COURIER_PATHAO = '/admin/courier-settings/pathao'
export const ADMIN_COURIER_MISSING_PARCELS = '/admin/courier-settings/missing-parcels'

// Instagram Business Settings routes
export const ADMIN_INSTAGRAM_SETTINGS = '/admin/instagram-settings'
export const ADMIN_INSTAGRAM_BUSINESS = '/admin/instagram-settings/business-account'
export const ADMIN_INSTAGRAM_SHOPPING = '/admin/instagram-settings/shopping'
export const ADMIN_INSTAGRAM_CONTENT = '/admin/instagram-settings/content'
export const ADMIN_INSTAGRAM_ANALYTICS = '/admin/instagram-settings/analytics'
export const ADMIN_INSTAGRAM_MESSAGING = '/admin/instagram-settings/messaging'
export const ADMIN_INSTAGRAM_ADS = '/admin/instagram-settings/ads'
export const ADMIN_INSTAGRAM_AUDIENCES = '/admin/instagram-settings/audiences'
export const ADMIN_INSTAGRAM_HASHTAGS = '/admin/instagram-settings/hashtags'
export const ADMIN_INSTAGRAM_INFLUENCERS = '/admin/instagram-settings/influencers'
export const ADMIN_INSTAGRAM_STORIES = '/admin/instagram-settings/stories'
export const ADMIN_INSTAGRAM_REELS = '/admin/instagram-settings/reels'
export const ADMIN_INSTAGRAM_LIVE = '/admin/instagram-settings/live'
export const ADMIN_INSTAGRAM_INSIGHTS = '/admin/instagram-settings/insights'
export const ADMIN_INSTAGRAM_PRODUCT_TAGGING = '/admin/instagram-settings/product-tagging'
export const ADMIN_INSTAGRAM_AUTOMATION = '/admin/instagram-settings/automation'
export const ADMIN_INSTAGRAM_COLLABORATIONS = '/admin/instagram-settings/collaborations'
export const ADMIN_INSTAGRAM_CONTESTS = '/admin/instagram-settings/contests'
export const ADMIN_INSTAGRAM_SHOP_SETUP = '/admin/instagram-settings/shop-setup'
export const ADMIN_INSTAGRAM_PIXEL = '/admin/instagram-settings/pixel'

// Fraud Guard routes
export const ADMIN_FRAUD_GUARD = '/admin/fraud-guard'
export const ADMIN_FRAUD_GUARD_BLOCKED = '/admin/fraud-guard/blocked'

// Inventory routes
export const ADMIN_INVENTORY = '/admin/inventory'
export const ADMIN_INVENTORY_PURCHASES = '/admin/inventory/purchases'
export const ADMIN_INVENTORY_PURCHASE_ADD = '/admin/inventory/purchases/add'
export const ADMIN_SUPPLIERS = '/admin/inventory/suppliers'

// Staff routes
export const ADMIN_STAFF = '/admin/staff'
export const ADMIN_STAFF_ADD = '/admin/staff/add'
export const ADMIN_ORDER_ASSIGN = '/admin/admin-orders/assign'

// Reports routes
export const ADMIN_REPORTS = '/admin/reports'
export const ADMIN_REPORTS_PROFIT_LOSS = '/admin/reports/profit-loss'
export const ADMIN_REPORTS_ADS_SOURCE = '/admin/reports/ads-source'
export const ADMIN_REPORTS_STOCK = '/admin/reports/stock'
export const ADMIN_REPORTS_EMPLOYEE = '/admin/reports/employee'
export const ADMIN_REPORTS_PRODUCTS = '/admin/reports/products'

// Flash Sale routes
export const ADMIN_FLASH_SALE = '/admin/flash-sale'
export const ADMIN_FLASH_SALE_ADD = '/admin/flash-sale/add'
export const ADMIN_FLASH_SALE_EDIT = (id) => id ? `/admin/flash-sale/edit/${id}` : null

// Shipping Rules routes
export const ADMIN_SHIPPING_RULES = '/admin/shipping-rules'

// Payment Settings route
export const ADMIN_PAYMENT_SETTINGS = '/admin/payment-settings'

// SMS routes
export const ADMIN_SMS = '/admin/sms'
export const ADMIN_SMS_BULK = '/admin/sms/bulk'
export const ADMIN_SMS_LOGS = '/admin/sms/logs'