export const WEBSITE_HOME = "/"
export const WEBSITE_LOGIN = "/auth/login"
export const WEBSITE_REGISTER = "/auth/register"
export const WEBSITE_RESETPASSWORD = "/auth/reset-password"

export const WEBSITE_SHOP = "/shop"

export const WEBSITE_PRODUCT_DETAILS = (slug) => slug ? `/product-details/${slug}` : '/product-details'

export const WEBSITE_CART = "/cart"
export const WEBSITE_CHECKOUT = "/checkout"

export const WEBSITE_ORDER_DETAILS = (order_id) => `/order-details/${order_id}`

// Policy pages
export const WEBSITE_RETURN_POLICY = "/return-policy"
export const WEBSITE_SHIPPING_POLICY = "/shipping-policy"
export const WEBSITE_SUPPORT = "/support"
export const WEBSITE_MEMBERSHIP = "/membership"

// User routes
export const USER_DASHBOARD = "/my-account"
export const USER_PROFILE = "/profile"
export const USER_ORDERS = "/orders"