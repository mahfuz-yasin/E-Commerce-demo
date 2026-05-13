"use client";

import { useFacebookPixel, createProductData, createCartData, createPurchaseData } from "@/lib/facebookPixel";

/**
 * Facebook Pixel Usage Examples
 * This file demonstrates how to use the Facebook Pixel tracking system
 */

// ============================================
// 1. Product Page Tracking
// ============================================

export function ProductPageExample({ product }) {
  const { viewContent, addToCart, addToWishlist } = useFacebookPixel();

  const handleViewProduct = () => {
    // Track when user views a product
    viewContent({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: "BDT",
    });
  };

  const handleAddToCart = () => {
    // Track when user adds product to cart
    addToCart({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: "BDT",
      num_items: 1,
    });
  };

  const handleAddToWishlist = () => {
    // Track when user adds product to wishlist
    addToWishlist({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: "BDT",
    });
  };

  return (
    <div>
      <button onClick={handleViewProduct}>View Product</button>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleAddToWishlist}>Add to Wishlist</button>
    </div>
  );
}

// ============================================
// 2. Search Tracking
// ============================================

export function SearchExample() {
  const { search } = useFacebookPixel();

  const handleSearch = (searchQuery) => {
    // Track search with the query
    search({
      search_string: searchQuery,
    });
  };

  return (
    <input
      type="search"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search products..."
    />
  );
}

// ============================================
// 3. Cart Tracking
// ============================================

export function CartExample({ cartItems }) {
  const { viewCart, initiateCheckout, removeFromCart, updateCartQuantity } = useFacebookPixel();

  const handleViewCart = () => {
    // Track cart view
    const cartData = createCartData(cartItems);
    viewCart(cartData);
  };

  const handleRemoveFromCart = (item) => {
    // Track item removal
    removeFromCart({
      content_ids: [item.productId],
      content_type: "product",
      content_name: item.name,
      value: item.price * item.quantity,
      currency: "BDT",
    });
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    // Track quantity update
    updateCartQuantity({
      content_ids: [item.productId],
      content_type: "product",
      quantity: newQuantity,
      value: item.price * newQuantity,
      currency: "BDT",
    });
  };

  const handleCheckout = () => {
    // Track checkout initiation
    const cartData = createCartData(cartItems);
    initiateCheckout(cartData);
  };

  return (
    <div>
      <button onClick={handleViewCart}>View Cart</button>
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
}

// ============================================
// 4. Checkout Tracking
// ============================================

export function CheckoutExample({ cartItems, step }) {
  const { initiateCheckout, addPaymentInfo, checkoutProgress, shippingInfoAdded } = useFacebookPixel();

  const handleCheckoutStep = (stepNumber) => {
    // Track checkout progress
    const cartData = createCartData(cartItems);
    checkoutProgress({
      ...cartData,
      checkout_step: stepNumber,
    });
  };

  const handleShippingInfo = (shippingMethod) => {
    // Track shipping information
    shippingInfoAdded({
      shipping_method: shippingMethod,
      shipping_cost: 100, // Example cost
    });
  };

  const handlePaymentInfo = () => {
    // Track payment information
    const cartData = createCartData(cartItems);
    addPaymentInfo(cartData);
  };

  return (
    <div>
      <button onClick={() => handleCheckoutStep(1)}>Step 1</button>
      <button onClick={() => handleCheckoutStep(2)}>Step 2</button>
      <button onClick={handlePaymentInfo}>Add Payment Info</button>
    </div>
  );
}

// ============================================
// 5. Purchase Tracking
// ============================================

export function PurchaseExample({ order }) {
  const { purchase, orderConfirmation } = useFacebookPixel();

  const handlePurchase = () => {
    // Track purchase
    const purchaseData = createPurchaseData(order);
    purchase(purchaseData);
  };

  const handleOrderConfirmation = () => {
    // Track order confirmation
    const orderData = createPurchaseData(order);
    orderConfirmation({
      ...orderData,
      shipping_cost: order.shippingCost,
      tax: order.tax,
      discount: order.discount,
    });
  };

  return (
    <div>
      <button onClick={handlePurchase}>Complete Purchase</button>
    </div>
  );
}

// ============================================
// 6. Category Page Tracking
// ============================================

export function CategoryPageExample({ category, products }) {
  const { viewCategory } = useFacebookPixel();

  const handleViewCategory = () => {
    // Track category view
    viewCategory({
      content_category: category.name,
      content_ids: products.map((p) => p._id),
      content_type: "product",
    });
  };

  return (
    <div>
      <button onClick={handleViewCategory}>View Category</button>
    </div>
  );
}

// ============================================
// 7. User Registration/Login Tracking
// ============================================

export function RegistrationExample() {
  const { completeRegistration, lead } = useFacebookPixel();

  const handleRegistration = () => {
    // Track registration completion
    completeRegistration({
      content_name: "User Registration",
      status: "completed",
      value: 0,
      currency: "BDT",
    });
  };

  const handleLead = () => {
    // Track lead (e.g., newsletter signup)
    lead({
      content_name: "Newsletter Signup",
      content_category: "Marketing",
    });
  };

  return (
    <div>
      <button onClick={handleRegistration}>Complete Registration</button>
      <button onClick={handleLead}>Newsletter Signup</button>
    </div>
  );
}

// ============================================
// 8. Contact & Support Tracking
// ============================================

export function ContactExample() {
  const { contact, phoneClick, emailClick, whatsAppClick, messengerClick, liveChatStart } = useFacebookPixel();

  const handleContact = () => {
    // Track contact form submission
    contact({
      content_name: "Contact Form",
      content_category: "Customer Support",
    });
  };

  const handlePhoneClick = (phoneNumber) => {
    // Track phone number click
    phoneClick({ phone_number: phoneNumber });
  };

  const handleEmailClick = (email) => {
    // Track email click
    emailClick({ email_address: email });
  };

  const handleWhatsAppClick = (phoneNumber) => {
    // Track WhatsApp button click
    whatsAppClick({ phone_number: phoneNumber });
  };

  const handleMessengerClick = () => {
    // Track Messenger button click
    messengerClick({});
  };

  const handleLiveChatStart = () => {
    // Track live chat initiation
    liveChatStart({});
  };

  return (
    <div>
      <button onClick={handleContact}>Contact Us</button>
      <a href="tel:+8801234567890" onClick={() => handlePhoneClick("+8801234567890")}>
        Call Us
      </a>
      <a href="mailto:support@alhilalpanjabi.com" onClick={() => handleEmailClick("support@alhilalpanjabi.com")}>
        Email Us
      </a>
      <button onClick={() => handleWhatsAppClick("+8801234567890")}>WhatsApp</button>
      <button onClick={handleMessengerClick}>Messenger</button>
      <button onClick={handleLiveChatStart}>Start Live Chat</button>
    </div>
  );
}

// ============================================
// 9. Product Interaction Tracking
// ============================================

export function ProductInteractionExample({ product }) {
  const { shareProduct, saveProduct, applyCoupon } = useFacebookPixel();

  const handleShare = (method) => {
    // Track product share
    shareProduct({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      share_method: method, // e.g., 'facebook', 'twitter', 'whatsapp'
    });
  };

  const handleSave = () => {
    // Track product save
    saveProduct({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
    });
  };

  const handleApplyCoupon = (couponCode, discount) => {
    // Track coupon application
    applyCoupon({
      coupon_code: couponCode,
      discount_amount: discount,
      value: product.price - discount,
      currency: "BDT",
    });
  };

  return (
    <div>
      <button onClick={() => handleShare("facebook")}>Share on Facebook</button>
      <button onClick={handleSave}>Save for Later</button>
      <button onClick={() => handleApplyCoupon("DISCOUNT10", 100)}>Apply Coupon</button>
    </div>
  );
}

// ============================================
// 10. Filtering & Sorting Tracking
// ============================================

export function FilterSortExample() {
  const { filterUsed, sortUsed } = useFacebookPixel();

  const handleFilter = (filterType, filterValue) => {
    // Track filter usage
    filterUsed({
      filter_type: filterType, // e.g., 'price', 'size', 'color'
      filter_value: filterValue,
    });
  };

  const handleSort = (sortBy) => {
    // Track sorting
    sortUsed({ sort_by: sortBy });
  };

  return (
    <div>
      <select onChange={(e) => handleFilter("price", e.target.value)}>
        <option>Price Filter</option>
        <option value="low-high">Low to High</option>
        <option value="high-low">High to Low</option>
      </select>
      <select onChange={(e) => handleSort(e.target.value)}>
        <option>Sort By</option>
        <option value="price">Price</option>
        <option value="name">Name</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
}

// ============================================
// 11. Video Tracking
// ============================================

export function VideoExample({ videoName }) {
  const { videoPlay, videoComplete } = useFacebookPixel();

  const handleVideoPlay = () => {
    // Track video play
    videoPlay({
      content_name: videoName,
      content_category: "Product Video",
    });
  };

  const handleVideoComplete = () => {
    // Track video completion
    videoComplete({
      content_name: videoName,
      content_category: "Product Video",
    });
  };

  return (
    <video
      onPlay={handleVideoPlay}
      onEnded={handleVideoComplete}
      controls
    >
      <source src="/video.mp4" type="video/mp4" />
    </video>
  );
}

// ============================================
// 12. Order Management Tracking
// ============================================

export function OrderManagementExample({ order }) {
  const { orderCancelled, refundIssued } = useFacebookPixel();

  const handleOrderCancel = (reason) => {
    // Track order cancellation
    orderCancelled({
      order_id: order._id,
      value: order.totalAmount,
      currency: "BDT",
      reason: reason,
    });
  };

  const handleRefund = (reason) => {
    // Track refund
    refundIssued({
      order_id: order._id,
      content_ids: order.items.map((item) => item.productId),
      value: order.totalAmount,
      currency: "BDT",
      reason: reason,
    });
  };

  return (
    <div>
      <button onClick={() => handleOrderCancel("Changed mind")}>Cancel Order</button>
      <button onClick={() => handleRefund("Product defect")}>Request Refund</button>
    </div>
  );
}
