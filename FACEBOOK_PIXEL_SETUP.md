# Facebook Pixel Setup - E-Online Fashion Panjabi

## Configuration

### Step 1: Add Pixel ID to Environment Variables

Open `.env` and `.env.local` files and replace `YOUR_PIXEL_ID_HERE` with your actual Facebook Pixel ID:

```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

**Important:** The variable must start with `NEXT_PUBLIC_` to be accessible in the browser.

### Step 2: Restart Development Server

After updating the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Available Tracking Events

### Standard Events (Facebook Built-in)

| Event | Function | When to Use |
|-------|----------|-------------|
| PageView | `pageView()` | Automatic - already implemented |
| ViewContent | `viewContent(data)` | When viewing a product page |
| Search | `search(data)` | When user performs a search |
| AddToCart | `addToCart(data)` | When adding product to cart |
| AddToWishlist | `addToWishlist(data)` | When adding to wishlist |
| InitiateCheckout | `initiateCheckout(data)` | When starting checkout |
| AddPaymentInfo | `addPaymentInfo(data)` | When adding payment details |
| Purchase | `purchase(data)` | When order is completed |
| Lead | `lead(data)` | When user submits a form |
| CompleteRegistration | `completeRegistration(data)` | When user registers |
| Contact | `contact(data)` | When contacting business |
| FindLocation | `findLocation(data)` | When searching for store |
| StartTrial | `startTrial(data)` | When starting free trial |
| Subscribe | `subscribe(data)` | When subscribing to service |
| SubmitApplication | `submitApplication(data)` | When submitting application |
| Schedule | `schedule(data)` | When scheduling appointment |
| Donate | `donate(data)` | When making donation |

### Custom Events (E-commerce Specific)

| Event | Function | When to Use |
|-------|----------|-------------|
| ViewCategory | `viewCategory(data)` | When viewing product category |
| RemoveFromCart | `removeFromCart(data)` | When removing from cart |
| UpdateCartQuantity | `updateCartQuantity(data)` | When updating cart quantity |
| ViewCart | `viewCart(data)` | When viewing cart page |
| SaveProduct | `saveProduct(data)` | When saving product for later |
| ShareProduct | `shareProduct(data)` | When sharing product |
| ApplyCoupon | `applyCoupon(data)` | When applying coupon code |
| CheckoutProgress | `checkoutProgress(data)` | Tracking checkout funnel |
| ShippingInfoAdded | `shippingInfoAdded(data)` | When adding shipping info |
| OrderConfirmation | `orderConfirmation(data)` | When order is confirmed |
| OrderCancelled | `orderCancelled(data)` | When order is cancelled |
| RefundIssued | `refundIssued(data)` | When refund is issued |

### User Engagement Events

| Event | Function | When to Use |
|-------|----------|-------------|
| VideoPlay | `videoPlay(data)` | When video starts playing |
| VideoComplete | `videoComplete(data)` | When video finishes |
| PhoneClick | `phoneClick(data)` | When clicking phone number |
| EmailClick | `emailClick(data)` | When clicking email link |
| WhatsAppClick | `whatsAppClick(data)` | When clicking WhatsApp |
| MessengerClick | `messengerClick(data)` | When clicking Messenger |
| LiveChatStart | `liveChatStart(data)` | When starting live chat |
| FilterUsed | `filterUsed(data)` | When using product filters |
| SortUsed | `sortUsed(data)` | When sorting products |

## Usage Examples

### Using the Hook in Components

```jsx
"use client";

import { useFacebookPixel } from "@/lib/facebookPixel";

function ProductPage({ product }) {
  const { viewContent, addToCart } = useFacebookPixel();

  useEffect(() => {
    // Track page view when component mounts
    viewContent({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      value: product.price,
      currency: "BDT",
    });
  }, [product, viewContent]);

  const handleAddToCart = () => {
    addToCart({
      content_ids: [product._id],
      content_type: "product",
      content_name: product.name,
      value: product.price,
      currency: "BDT",
    });
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Importing Individual Functions

```jsx
import { viewContent, addToCart, purchase } from "@/lib/facebookPixel";

// Use directly
viewContent({
  content_ids: ["123"],
  value: 1500,
  currency: "BDT",
});
```

### Using Helper Functions

```jsx
import { 
  useFacebookPixel, 
  createProductData, 
  createCartData, 
  createPurchaseData 
} from "@/lib/facebookPixel";

function CheckoutPage({ cartItems, order }) {
  const { viewContent, addToCart, purchase } = useFacebookPixel();

  // Create formatted data
  const productData = createProductData(product);
  const cartData = createCartData(cartItems);
  const purchaseData = createPurchaseData(order);

  return (
    <button onClick={() => purchase(purchaseData)}>
      Complete Purchase
    </button>
  );
}
```

## Event Data Parameters

### Common Parameters

```javascript
{
  content_ids: ["123", "456"],     // Array of product IDs
  content_type: "product",          // Type: 'product' or 'product_group'
  content_name: "Premium Panjabi",  // Product name
  content_category: "Men's Wear",   // Category
  value: 1500,                      // Total value
  currency: "BDT",                  // Currency code
  num_items: 2,                     // Number of items
  order_id: "ORDER123",             // Order ID
}
```

### Purchase Event Example

```javascript
purchase({
  content_ids: ["123", "456"],
  content_type: "product",
  content_name: "Order Purchase",
  num_items: 2,
  value: 3000,
  currency: "BDT",
  order_id: "ORD-2024-001",
  shipping_cost: 100,
  tax: 50,
  discount: 200,
});
```

### Checkout Progress Example

```javascript
checkoutProgress({
  checkout_step: 2,                 // Step number
  checkout_option: "shipping",       // Current section
  content_ids: ["123", "456"],
  value: 3000,
  currency: "BDT",
});
```

## Testing Your Pixel

### 1. Facebook Pixel Helper (Chrome Extension)
- Install the Facebook Pixel Helper extension
- Open your website
- Check if events are firing correctly

### 2. Events Manager
- Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
- Select your Pixel
- Use the Test Events feature
- Perform actions on your website and verify in Events Manager

### 3. Browser Console
```javascript
// Check if pixel is initialized
fbq('track', 'PageView');

// Check pixel ID
console.log(fbq.instance);
```

## Troubleshooting

### Pixel Not Firing
1. Check if `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is set correctly
2. Verify the variable is accessible in browser console:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
   ```
3. Check browser console for any errors
4. Ensure ad blockers are disabled for testing

### Events Not Showing in Facebook
1. Wait 20-30 minutes for data to appear
2. Check Events Manager for delayed events
3. Verify pixel is active in Facebook Business Manager
4. Test with Facebook Pixel Helper extension

### Common Issues
- **"fbq is not defined"**: Pixel script hasn't loaded yet
- **Events not firing**: Check if component is client-side ("use client")
- **Duplicate events**: Ensure you're not tracking the same event multiple times

## Privacy & GDPR Compliance

This implementation respects user privacy:
- Pixel only loads when NEXT_PUBLIC_FACEBOOK_PIXEL_ID is defined
- No data is sent until pixel is initialized
- Use with your website's cookie consent mechanism if required

## Files Created

1. `/components/FacebookPixel/FacebookPixel.jsx` - Main component
2. `/components/FacebookPixel/index.js` - Export file
3. `/components/FacebookPixel/FacebookPixelExample.jsx` - Usage examples
4. `/lib/facebookPixel.js` - Tracking utilities
5. `/.env` - Environment variables
6. `/.env.example` - Example environment file

## Support

For more information:
- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- [Facebook Events Manager](https://business.facebook.com/events_manager)
