/**
 * Facebook Pixel Tracking Utility
 * Advanced implementation for e-commerce tracking
 */

// Initialize the fbq function
export const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Get the fbq function if available
 */
const getFbq = () => {
  if (isBrowser && window.fbq) {
    return window.fbq;
  }
  return null;
};

/**
 * Check if Pixel is initialized
 */
export const isPixelInitialized = () => {
  return isBrowser && !!window.fbq;
};

/**
 * Track PageView event
 */
export const pageView = () => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "PageView");
  }
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 */
export const event = (eventName, data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", eventName, data);
  }
};

/**
 * Track custom conversion event
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 */
export const trackCustom = (eventName, data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", eventName, data);
  }
};

// ============================================
// Standard E-commerce Events
// ============================================

/**
 * Track ViewContent event
 * Used when a user views a product page
 * @param {object} data - Product data
 */
export const viewContent = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "ViewContent", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track Search event
 * Used when a user performs a search
 * @param {object} data - Search data
 */
export const search = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Search", {
      search_string: data.search_string || "",
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      ...data,
    });
  }
};

/**
 * Track AddToCart event
 * Used when a user adds a product to cart
 * @param {object} data - Cart data
 */
export const addToCart = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "AddToCart", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      num_items: data.num_items || 1,
      ...data,
    });
  }
};

/**
 * Track AddToWishlist event
 * Used when a user adds a product to wishlist
 * @param {object} data - Wishlist data
 */
export const addToWishlist = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "AddToWishlist", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track InitiateCheckout event
 * Used when a user starts the checkout process
 * @param {object} data - Checkout data
 */
export const initiateCheckout = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "InitiateCheckout", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      num_items: data.num_items || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track AddPaymentInfo event
 * Used when a user adds payment information
 * @param {object} data - Payment data
 */
export const addPaymentInfo = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "AddPaymentInfo", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track Purchase event
 * Used when a user completes a purchase
 * @param {object} data - Purchase data
 */
export const purchase = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Purchase", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      num_items: data.num_items || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      order_id: data.order_id || "",
      ...data,
    });
  }
};

/**
 * Track Lead event
 * Used when a user submits a form (contact, newsletter, etc.)
 * @param {object} data - Lead data
 */
export const lead = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Lead", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track CompleteRegistration event
 * Used when a user completes registration
 * @param {object} data - Registration data
 */
export const completeRegistration = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "CompleteRegistration", {
      content_name: data.content_name || "",
      status: data.status || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track Contact event
 * Used when a user contacts the business
 * @param {object} data - Contact data
 */
export const contact = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Contact", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      ...data,
    });
  }
};

/**
 * Track FindLocation event
 * Used when a user searches for a store location
 * @param {object} data - Location data
 */
export const findLocation = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "FindLocation", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      ...data,
    });
  }
};

/**
 * Track StartTrial event
 * Used when a user starts a free trial
 * @param {object} data - Trial data
 */
export const startTrial = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "StartTrial", {
      content_name: data.content_name || "",
      content_id: data.content_id || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      predicted_ltv: data.predicted_ltv || 0,
      ...data,
    });
  }
};

/**
 * Track Subscribe event
 * Used when a user subscribes to a service
 * @param {object} data - Subscription data
 */
export const subscribe = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Subscribe", {
      content_name: data.content_name || "",
      content_id: data.content_id || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      predicted_ltv: data.predicted_ltv || 0,
      ...data,
    });
  }
};

/**
 * Track SubmitApplication event
 * Used when a user submits an application
 * @param {object} data - Application data
 */
export const submitApplication = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "SubmitApplication", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      ...data,
    });
  }
};

/**
 * Track Schedule event
 * Used when a user schedules an appointment
 * @param {object} data - Schedule data
 */
export const schedule = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Schedule", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      ...data,
    });
  }
};

/**
 * Track Donate event
 * Used when a user makes a donation
 * @param {object} data - Donation data
 */
export const donate = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Donate", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

// ============================================
// Advanced E-commerce Events
// ============================================

/**
 * Track ViewCategory event
 * Used when a user views a product category
 * @param {object} data - Category data
 */
export const viewCategory = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "ViewCategory", {
      content_category: data.content_category || "",
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      ...data,
    });
  }
};

/**
 * Track RemoveFromCart event
 * Used when a user removes a product from cart
 * @param {object} data - Product data
 */
export const removeFromCart = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "RemoveFromCart", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track UpdateCartQuantity event
 * Used when a user updates cart quantity
 * @param {object} data - Cart data
 */
export const updateCartQuantity = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "UpdateCartQuantity", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      quantity: data.quantity || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track ViewCart event
 * Used when a user views their cart
 * @param {object} data - Cart data
 */
export const viewCart = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "ViewCart", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      num_items: data.num_items || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track SaveProduct event
 * Used when a user saves a product for later
 * @param {object} data - Product data
 */
export const saveProduct = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "SaveProduct", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      ...data,
    });
  }
};

/**
 * Track ShareProduct event
 * Used when a user shares a product
 * @param {object} data - Product data
 */
export const shareProduct = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "ShareProduct", {
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      content_name: data.content_name || "",
      share_method: data.share_method || "",
      ...data,
    });
  }
};

/**
 * Track ApplyCoupon event
 * Used when a user applies a coupon code
 * @param {object} data - Coupon data
 */
export const applyCoupon = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "ApplyCoupon", {
      coupon_code: data.coupon_code || "",
      discount_amount: data.discount_amount || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track CheckoutProgress event
 * Used to track checkout funnel steps
 * @param {object} data - Checkout step data
 */
export const checkoutProgress = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "CheckoutProgress", {
      checkout_step: data.checkout_step || 1,
      checkout_option: data.checkout_option || "",
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      num_items: data.num_items || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      ...data,
    });
  }
};

/**
 * Track ShippingInfoAdded event
 * Used when a user adds shipping information
 * @param {object} data - Shipping data
 */
export const shippingInfoAdded = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "ShippingInfoAdded", {
      shipping_method: data.shipping_method || "",
      shipping_cost: data.shipping_cost || 0,
      ...data,
    });
  }
};

/**
 * Track OrderConfirmation event
 * Used when an order is confirmed
 * @param {object} data - Order data
 */
export const orderConfirmation = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "OrderConfirmation", {
      order_id: data.order_id || "",
      content_ids: data.content_ids || [],
      content_type: data.content_type || "product",
      num_items: data.num_items || 0,
      value: data.value || 0,
      currency: data.currency || "BDT",
      shipping_cost: data.shipping_cost || 0,
      tax: data.tax || 0,
      discount: data.discount || 0,
      ...data,
    });
  }
};

/**
 * Track OrderCancelled event
 * Used when an order is cancelled
 * @param {object} data - Order data
 */
export const orderCancelled = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "OrderCancelled", {
      order_id: data.order_id || "",
      value: data.value || 0,
      currency: data.currency || "BDT",
      reason: data.reason || "",
      ...data,
    });
  }
};

/**
 * Track RefundIssued event
 * Used when a refund is issued
 * @param {object} data - Refund data
 */
export const refundIssued = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "RefundIssued", {
      order_id: data.order_id || "",
      content_ids: data.content_ids || [],
      value: data.value || 0,
      currency: data.currency || "BDT",
      reason: data.reason || "",
      ...data,
    });
  }
};

// ============================================
// User Engagement Events
// ============================================

/**
 * Track VideoPlay event
 * Used when a user plays a video
 * @param {object} data - Video data
 */
export const videoPlay = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "VideoPlay", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      content_ids: data.content_ids || [],
      ...data,
    });
  }
};

/**
 * Track VideoComplete event
 * Used when a user completes watching a video
 * @param {object} data - Video data
 */
export const videoComplete = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "VideoComplete", {
      content_name: data.content_name || "",
      content_category: data.content_category || "",
      content_ids: data.content_ids || [],
      ...data,
    });
  }
};

/**
 * Track PhoneClick event
 * Used when a user clicks on a phone number
 * @param {object} data - Phone data
 */
export const phoneClick = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "PhoneClick", {
      phone_number: data.phone_number || "",
      ...data,
    });
  }
};

/**
 * Track EmailClick event
 * Used when a user clicks on an email
 * @param {object} data - Email data
 */
export const emailClick = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "EmailClick", {
      email_address: data.email_address || "",
      ...data,
    });
  }
};

/**
 * Track WhatsAppClick event
 * Used when a user clicks on WhatsApp button
 * @param {object} data - WhatsApp data
 */
export const whatsAppClick = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "WhatsAppClick", {
      phone_number: data.phone_number || "",
      ...data,
    });
  }
};

/**
 * Track MessengerClick event
 * Used when a user clicks on Messenger button
 * @param {object} data - Messenger data
 */
export const messengerClick = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "MessengerClick", {
      ...data,
    });
  }
};

/**
 * Track LiveChatStart event
 * Used when a user starts a live chat
 * @param {object} data - Chat data
 */
export const liveChatStart = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "LiveChatStart", {
      ...data,
    });
  }
};

/**
 * Track FilterUsed event
 * Used when a user applies filters
 * @param {object} data - Filter data
 */
export const filterUsed = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "FilterUsed", {
      filter_type: data.filter_type || "",
      filter_value: data.filter_value || "",
      ...data,
    });
  }
};

/**
 * Track SortUsed event
 * Used when a user sorts products
 * @param {object} data - Sort data
 */
export const sortUsed = (data = {}) => {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", "SortUsed", {
      sort_by: data.sort_by || "",
      ...data,
    });
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create product data for Pixel events
 * @param {object} product - Product object
 * @returns {object} Formatted product data
 */
export const createProductData = (product) => {
  return {
    content_id: product._id || product.id || "",
    content_name: product.name || "",
    content_category: product.category || "",
    content_type: "product",
    price: product.price || 0,
    currency: "BDT",
    availability: product.stock > 0 ? "in stock" : "out of stock",
    brand: product.brand || "E-Online Fashion Panjabi",
  };
};

/**
 * Create cart data for Pixel events
 * @param {array} cartItems - Array of cart items
 * @returns {object} Formatted cart data
 */
export const createCartData = (cartItems) => {
  const content_ids = cartItems.map((item) => item.productId || item._id || "");
  const value = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );
  const num_items = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return {
    content_ids,
    content_type: "product",
    num_items,
    value,
    currency: "BDT",
  };
};

/**
 * Create checkout data for Pixel events
 * @param {array} cartItems - Array of cart items
 * @param {object} checkoutInfo - Checkout information
 * @returns {object} Formatted checkout data
 */
export const createCheckoutData = (cartItems, checkoutInfo = {}) => {
  const baseData = createCartData(cartItems);
  return {
    ...baseData,
    ...checkoutInfo,
  };
};

/**
 * Create purchase data for Pixel events
 * @param {object} order - Order object
 * @returns {object} Formatted purchase data
 */
export const createPurchaseData = (order) => {
  const cartItems = order.items || [];
  const content_ids = cartItems.map((item) => item.productId || item._id || "");
  const num_items = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return {
    content_ids,
    content_type: "product",
    content_name: "Order Purchase",
    num_items,
    value: order.totalAmount || order.total || 0,
    currency: "BDT",
    order_id: order._id || order.orderId || "",
    shipping_cost: order.shippingCost || 0,
    tax: order.tax || 0,
    discount: order.discount || 0,
  };
};

// ============================================
// React Hook for Pixel Tracking
// ============================================

/**
 * Custom hook for Facebook Pixel tracking in React components
 * @returns {object} Pixel tracking methods
 */
export const useFacebookPixel = () => {
  return {
    isInitialized: isPixelInitialized,
    pageView,
    event,
    trackCustom,
    viewContent,
    search,
    addToCart,
    addToWishlist,
    initiateCheckout,
    addPaymentInfo,
    purchase,
    lead,
    completeRegistration,
    contact,
    findLocation,
    startTrial,
    subscribe,
    submitApplication,
    schedule,
    donate,
    viewCategory,
    removeFromCart,
    updateCartQuantity,
    viewCart,
    saveProduct,
    shareProduct,
    applyCoupon,
    checkoutProgress,
    shippingInfoAdded,
    orderConfirmation,
    orderCancelled,
    refundIssued,
    videoPlay,
    videoComplete,
    phoneClick,
    emailClick,
    whatsAppClick,
    messengerClick,
    liveChatStart,
    filterUsed,
    sortUsed,
    createProductData,
    createCartData,
    createCheckoutData,
    createPurchaseData,
  };
};

// Default export
const facebookPixel = {
  pixelId,
  isInitialized: isPixelInitialized,
  pageView,
  event,
  trackCustom,
  viewContent,
  search,
  addToCart,
  addToWishlist,
  initiateCheckout,
  addPaymentInfo,
  purchase,
  lead,
  completeRegistration,
  contact,
  findLocation,
  startTrial,
  subscribe,
  submitApplication,
  schedule,
  donate,
  viewCategory,
  removeFromCart,
  updateCartQuantity,
  viewCart,
  saveProduct,
  shareProduct,
  applyCoupon,
  checkoutProgress,
  shippingInfoAdded,
  orderConfirmation,
  orderCancelled,
  refundIssued,
  videoPlay,
  videoComplete,
  phoneClick,
  emailClick,
  whatsAppClick,
  messengerClick,
  liveChatStart,
  filterUsed,
  sortUsed,
  createProductData,
  createCartData,
  createCheckoutData,
  createPurchaseData,
  useFacebookPixel,
};

export default facebookPixel;
