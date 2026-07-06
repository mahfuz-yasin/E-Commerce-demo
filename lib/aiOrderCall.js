/**
 * AI Auto Order Confirmation Call
 * Provider: Bland.ai (https://www.bland.ai)
 * Fallback: Direct TTS via Google/OpenAI
 * 
 * Env vars needed:
 *   BLAND_AI_API_KEY=your_key
 *   BLAND_AI_PATHWAY_ID=your_pathway_id (optional, uses script if not set)
 *   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
 */

const BLAND_API_KEY = process.env.BLAND_AI_API_KEY
const BLAND_PATHWAY_ID = process.env.BLAND_AI_PATHWAY_ID
const BLAND_API_URL = 'https://api.bland.ai/v1/calls'

/**
 * Make AI confirmation call for a new order
 * @param {object} order - Order data
 * @returns {Promise<{success: boolean, callId?: string, message: string}>}
 */
export async function makeOrderConfirmationCall(order) {
  if (!BLAND_API_KEY) {
    console.warn('[AI Call] BLAND_AI_API_KEY not set. Skipping confirmation call.')
    return { success: false, message: 'API key not configured' }
  }

  const customerName = order.name || 'কাস্টমার'
  const orderAmount = order.totalAmount || 0
  const productNames = order.products?.map(p => p.name).join(', ') || 'পণ্য'
  const phone = order.phone?.startsWith('0') ? `+88${order.phone}` : order.phone

  // Conversational script in Bangla
  const task = `
আপনি একটি বাংলাদেশি ই-কমার্স স্টোরের AI অর্ডার কনফার্মেশন এজেন্ট।
কাস্টমারের নাম: ${customerName}
অর্ডার নম্বর: ${order.order_id}
পণ্য: ${productNames}
মোট টাকা: ${orderAmount} টাকা
পেমেন্ট: ক্যাশ অন ডেলিভারি (COD)

আপনার কাজ:
১. কাস্টমারকে অর্ডার কনফার্মেশন দিন বাংলায়।
২. ডেলিভারি ঠিকানা নিশ্চিত করুন।
৩. জিজ্ঞেস করুন অর্ডারটি সচল রাখতে চান কিনা।
৪. যদি কাস্টমার "হ্যাঁ" বলেন তাহলে বলুন "আপনার অর্ডার কনফার্ম হয়েছে। ধন্যবাদ।"
৫. যদি "না" বলেন তাহলে বলুন "অর্ডার বাতিল করা হচ্ছে। ধন্যবাদ।"

সংক্ষিপ্ত, বিনয়ী এবং পেশাদারভাবে কথা বলুন।
`.trim()

  const payload = {
    phone_number: phone,
    task,
    voice: 'nat', // Natural voice
    language: 'bn', // Bengali
    reduce_latency: true,
    record: true,
    max_duration: 2, // 2 minutes max
    webhook: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-call/webhook` : undefined,
    metadata: {
      order_id: order.order_id,
      order_db_id: order._id?.toString(),
    },
    ...(BLAND_PATHWAY_ID && { pathway_id: BLAND_PATHWAY_ID }),
  }

  try {
    const res = await fetch(BLAND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': BLAND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (res.ok && data.call_id) {
      console.log(`[AI Call] Confirmation call initiated: ${data.call_id} for order ${order.order_id}`)
      return { success: true, callId: data.call_id, message: 'Call initiated' }
    } else {
      console.error('[AI Call] Failed:', data)
      return { success: false, message: data.message || 'Call failed' }
    }
  } catch (error) {
    console.error('[AI Call] Error:', error.message)
    return { success: false, message: error.message }
  }
}

/**
 * Get call status from Bland.ai
 * @param {string} callId
 */
export async function getCallStatus(callId) {
  if (!BLAND_API_KEY || !callId) return null

  try {
    const res = await fetch(`${BLAND_API_URL}/${callId}`, {
      headers: { 'Authorization': BLAND_API_KEY }
    })
    return await res.json()
  } catch {
    return null
  }
}
