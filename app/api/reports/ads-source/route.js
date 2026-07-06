import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel from "@/models/Order.model"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

        await connectDB()
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : new Date(new Date().setDate(1))
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : new Date()

        const orders = await OrderModel.find({
            createdAt: { $gte: startDate, $lte: endDate },
            deletedAt: null,
        }).select('status totalAmount adSource fbPurchaseEventSent createdAt')

        const platforms = ['facebook', 'tiktok', 'google', 'instagram', 'organic', 'direct', 'other']
        const breakdown = {}

        for (const platform of platforms) {
            const platformOrders = orders.filter(o => (o.adSource?.platform || 'organic') === platform)
            const delivered = platformOrders.filter(o => o.status === 'delivered')
            const cancelled = platformOrders.filter(o => o.status === 'cancelled')
            const revenue = delivered.reduce((sum, o) => sum + o.totalAmount, 0)
            const total = platformOrders.length

            breakdown[platform] = {
                totalOrders: total,
                deliveredOrders: delivered.length,
                cancelledOrders: cancelled.length,
                revenue,
                successRate: total > 0 ? ((delivered.length / total) * 100).toFixed(1) + '%' : '0%',
                cancelRate: total > 0 ? ((cancelled.length / total) * 100).toFixed(1) + '%' : '0%',
            }
        }

        // Campaign-level breakdown for Facebook
        const fbOrders = orders.filter(o => o.adSource?.platform === 'facebook')
        const fbCampaigns = {}
        for (const o of fbOrders) {
            const cid = o.adSource?.utmCampaign || o.adSource?.campaignId || 'unknown'
            if (!fbCampaigns[cid]) fbCampaigns[cid] = { orders: 0, delivered: 0, revenue: 0 }
            fbCampaigns[cid].orders++
            if (o.status === 'delivered') {
                fbCampaigns[cid].delivered++
                fbCampaigns[cid].revenue += o.totalAmount
            }
        }

        // Campaign-level breakdown for TikTok
        const ttOrders = orders.filter(o => o.adSource?.platform === 'tiktok')
        const ttCampaigns = {}
        for (const o of ttOrders) {
            const cid = o.adSource?.utmCampaign || o.adSource?.campaignId || 'unknown'
            if (!ttCampaigns[cid]) ttCampaigns[cid] = { orders: 0, delivered: 0, revenue: 0 }
            ttCampaigns[cid].orders++
            if (o.status === 'delivered') {
                ttCampaigns[cid].delivered++
                ttCampaigns[cid].revenue += o.totalAmount
            }
        }

        return response(true, 200, 'Ads source report generated.', {
            period: { startDate, endDate },
            totalOrders: orders.length,
            breakdown,
            facebookCampaigns: fbCampaigns,
            tiktokCampaigns: ttCampaigns,
        })
    } catch (error) {
        return catchError(error)
    }
}
