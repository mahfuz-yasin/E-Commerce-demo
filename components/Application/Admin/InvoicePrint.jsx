'use client'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useRef } from 'react'

const InvoicePrint = ({ order }) => {
    const printRef = useRef(null)

    const handlePrint = () => {
        const content = printRef.current.innerHTML
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Invoice - ${order?.order_id}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; }
                    .invoice { max-width: 800px; margin: 0 auto; padding: 30px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #111; padding-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #7c3aed; }
                    .company-sub { font-size: 12px; color: #555; margin-top: 4px; }
                    .invoice-title { font-size: 20px; font-weight: bold; text-align: right; }
                    .invoice-meta { font-size: 12px; color: #555; text-align: right; margin-top: 4px; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .info-box { background: #f9f9f9; border: 1px solid #e5e5e5; padding: 12px; border-radius: 4px; }
                    .info-box p { margin: 3px 0; font-size: 13px; }
                    .info-box strong { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #7c3aed; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
                    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
                    tr:nth-child(even) td { background: #fafafa; }
                    .totals { margin-left: auto; width: 260px; }
                    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
                    .total-row.grand { font-size: 15px; font-weight: bold; border-top: 2px solid #111; border-bottom: none; padding-top: 10px; margin-top: 4px; }
                    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
                    .badge-delivered { background: #d1fae5; color: #065f46; }
                    .badge-pending { background: #fef3c7; color: #92400e; }
                    .badge-cancelled { background: #fee2e2; color: #991b1b; }
                    .badge-processing { background: #dbeafe; color: #1e40af; }
                    .badge-shipped { background: #ede9fe; color: #5b21b6; }
                    .ads-source { font-size: 11px; background: #ede9fe; color: #5b21b6; padding: 2px 8px; border-radius: 10px; display: inline-block; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    const statusClass = {
        delivered: 'badge-delivered',
        pending: 'badge-pending',
        cancelled: 'badge-cancelled',
        processing: 'badge-processing',
        shipped: 'badge-shipped',
    }

    const platformLabel = {
        facebook: '📘 Facebook',
        tiktok: '🎵 TikTok',
        google: '🔍 Google',
        instagram: '📸 Instagram',
        organic: '🌿 Organic',
        direct: '🔗 Direct',
        other: '📌 Other',
    }

    return (
        <>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className='w-4 h-4' />
                Invoice Print
            </Button>

            <div ref={printRef} style={{ display: 'none' }}>
                <div className="invoice">
                    <div className="header">
                        <div>
                            <div className="company-name">E-Online Fashion</div>
                            <div className="company-sub">Fashion E-Commerce | Bangladesh</div>
                        </div>
                        <div>
                            <div className="invoice-title">INVOICE</div>
                            <div className="invoice-meta">Invoice#: {order?.invoiceNumber || order?.order_id}</div>
                            <div className="invoice-meta">Order#: {order?.order_id}</div>
                            <div className="invoice-meta">Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : ''}</div>
                            <div className="invoice-meta">
                                Status: <span className={`badge ${statusClass[order?.status] || 'badge-pending'}`}>{order?.status?.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-box">
                            <div className="section-title">Bill To</div>
                            <p><strong>{order?.name}</strong></p>
                            <p>📞 {order?.phone}</p>
                            <p>📍 {order?.address}</p>
                            {order?.ordernote && <p>📝 Note: {order.ordernote}</p>}
                        </div>
                        <div className="info-box">
                            <div className="section-title">Order Details</div>
                            <p>Payment: <strong>{order?.paymentMethod || 'COD'}</strong></p>
                            <p>Shipping: <strong>{order?.freeShipping ? '🎁 Free' : `৳${order?.shippingCharge || 60}`}</strong></p>
                            {order?.couponDiscountAmount > 0 && <p>Coupon Discount: <strong>৳{order.couponDiscountAmount}</strong></p>}
                            {order?.adSource?.platform && (
                                <p>Ads Source: <span className="ads-source">{platformLabel[order.adSource.platform]}</span></p>
                            )}
                            {order?.courierInfo?.courierName && <p>Courier: <strong>{order.courierInfo.courierName}</strong></p>}
                            {order?.courierInfo?.trackingCode && <p>Tracking: <strong>{order.courierInfo.trackingCode}</strong></p>}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Size</th>
                                <th>MRP</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order?.products?.map((p, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{p.name}</td>
                                    <td>{p.size || '—'}</td>
                                    <td>৳{p.mrp}</td>
                                    <td>৳{p.sellingPrice}</td>
                                    <td>{p.qty}</td>
                                    <td>৳{p.sellingPrice * p.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>৳{order?.subtotal}</span>
                        </div>
                        {order?.discount > 0 && (
                            <div className="total-row">
                                <span>Discount:</span>
                                <span>- ৳{order.discount}</span>
                            </div>
                        )}
                        {order?.couponDiscountAmount > 0 && (
                            <div className="total-row">
                                <span>Coupon:</span>
                                <span>- ৳{order.couponDiscountAmount}</span>
                            </div>
                        )}
                        <div className="total-row">
                            <span>Shipping:</span>
                            <span>{order?.freeShipping ? 'Free' : `৳${order?.shippingCharge || 60}`}</span>
                        </div>
                        <div className="total-row grand">
                            <span>Grand Total:</span>
                            <span>৳{order?.totalAmount}</span>
                        </div>
                    </div>

                    <div className="footer">
                        <p>ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য! | E-Online Fashion</p>
                        <p style={{ marginTop: '6px' }}>এই ইনভয়েসটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InvoicePrint
