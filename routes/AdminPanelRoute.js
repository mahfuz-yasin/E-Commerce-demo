export const ADMIN_DASHBOARD = '/dashboard'

// Media routes
export const ADMIN_MEDIA_SHOW = '/media'
export const ADMIN_MEDIA_EDIT = (id) => id ? `/media/edit/${id}` : ''

// Category routes

export const ADMIN_CATEGORY_ADD = '/category/add'
export const ADMIN_CATEGORY_SHOW = '/category'
export const ADMIN_CATEGORY_EDIT = (id) => id ? `/category/edit/${id}` : ''

// Product routes

export const ADMIN_PRODUCT_ADD = '/product/add'
export const ADMIN_PRODUCT_SHOW = '/product'
export const ADMIN_PRODUCT_EDIT = (id) => id ? `/product/edit/${id}` : ''


// Product Variant routes

export const ADMIN_PRODUCT_VARIANT_ADD = '/product-variant/add'
export const ADMIN_PRODUCT_VARIANT_SHOW = '/product-variant'
export const ADMIN_PRODUCT_VARIANT_EDIT = (id) => id ? `/product-variant/edit/${id}` : ''


// Coupon routes

export const ADMIN_COUPON_ADD = '/coupon/add'
export const ADMIN_COUPON_SHOW = '/coupon'
export const ADMIN_COUPON_EDIT = (id) => id ? `/coupon/edit/${id}` : ''


// Customer route
export const ADMIN_CUSTOMERS_SHOW = '/customers'


// Review route
export const ADMIN_REVIEW_SHOW = '/review'

// orders routes

export const ADMIN_ORDER_SHOW = '/admin-orders'
export const ADMIN_ORDER_DETAILS = (order_id) => order_id ? `/admin-orders/details/${order_id}` : ''


// Trash route

export const ADMIN_TRASH = '/trash'

// Slider routes
export const ADMIN_SLIDER = '/slider'

// Features routes
export const ADMIN_FEATURES_ADD = '/features/add'
export const ADMIN_FEATURES_SHOW = '/features'
export const ADMIN_FEATURES_EDIT = (id) => id ? `/features/edit/${id}` : ''

// Settings routes
export const ADMIN_SETTINGS = '/settings'

// Facebook Settings routes
export const ADMIN_FACEBOOK_SETTINGS = '/facebook-settings'
export const ADMIN_FACEBOOK_PIXEL = '/facebook-settings/pixel-capi'
export const ADMIN_FACEBOOK_BUSINESS = '/facebook-settings/business-manager'
export const ADMIN_FACEBOOK_CATALOG = '/facebook-settings/catalog'
export const ADMIN_FACEBOOK_MESSENGER = '/facebook-settings/messenger'
export const ADMIN_FACEBOOK_ADVANCED = '/facebook-settings/advanced'
export const ADMIN_FACEBOOK_AUDIENCES = '/facebook-settings/audiences'
export const ADMIN_FACEBOOK_ANALYTICS = '/facebook-settings/analytics'
export const ADMIN_FACEBOOK_LEAD_ADS = '/facebook-settings/lead-ads'
export const ADMIN_FACEBOOK_PROMOTIONS = '/facebook-settings/promotions'
export const ADMIN_FACEBOOK_CUSTOM_CONVERSIONS = '/facebook-settings/custom-conversions'
export const ADMIN_FACEBOOK_AUDIT = '/facebook-settings/audit'
export const ADMIN_FACEBOOK_CAMPAIGN_MANAGER = '/facebook-settings/campaign-manager'

// Leads routes
export const ADMIN_LEADS_DASHBOARD = '/leads'