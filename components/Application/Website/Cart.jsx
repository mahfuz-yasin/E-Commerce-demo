'use client'
import { BsCart2 } from "react-icons/bs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart } from "@/store/reducer/cartReducer";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/WebsiteRoute";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
import OptimizedImage from "@/components/ui/OptimizedImage";

const Cart = ({ onOpenChange }) => {
    const [open, setOpen] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)

    const cart = useSelector((state) => state?.cartStore || { products: [], count: 0 })
    const dispatch = useDispatch()

    useEffect(() => {
        const cartProducts = cart.products || []
        const totalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)
        const discountAmount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)
        setSubTotal(totalAmount)
        setDiscount(discountAmount)
    }, [cart])

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen)
        if (isOpen && onOpenChange) {
            onOpenChange()
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger className="relative">
                <BsCart2 size={25} className="text-gray-500 hover:text-primary" />
                <span className="absolute bg-red-500 text-white text-xs rounded-full w-4 h-4 flex justify-center items-center -right-2 -top-1">{cart.count || 0}</span>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[450px] w-full flex flex-col h-[100dvh] p-0 z-[110]" overlayClassName="z-[110]">
                <SheetHeader className='py-4 px-4 border-b flex-shrink-0'>
                    <SheetTitle className="text-2xl">My Cart ({cart.count || 0})</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Products List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {cart.count === 0 ? (
                            <div className="h-full flex justify-center items-center text-xl font-semibold">
                                Your Cart Is Empty.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.products?.map((product) => (
                                    <div key={product.cartItemId || `${product.productId}-${product.variantId}-${product.size}`} className="flex justify-between items-start gap-3 border-b pb-4 last:border-0">
                                        <div className="flex gap-3 items-center flex-1 min-w-0">
                                            <OptimizedImage 
                                                src={product?.media} 
                                                height={80} 
                                                width={80} 
                                                alt={product.name} 
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded border object-cover flex-shrink-0" 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base font-medium mb-1 truncate">{product.name}</h4>
                                                <p className="text-gray-500 text-sm">
                                                    {product.size} / {Array.isArray(product.colors) ? product.colors.map(c => c.name).join(', ') : product.colors}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <button 
                                                type="button" 
                                                className="text-red-500 text-xs sm:text-sm underline underline-offset-1 mb-2 cursor-pointer hover:text-red-700"
                                                onClick={() => {
                                                    dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId, size: product.size }))
                                                    showToast('success', 'Item removed from cart')
                                                }}
                                            >
                                                Remove
                                            </button>
                                            <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
                                                {product.qty} × {product.sellingPrice?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Summary */}
                    <div className="border-t pt-4 px-4 pb-6 bg-gray-50 flex-shrink-0">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-base">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">{subtotal?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <span className="text-gray-600">Discount</span>
                                <span className="font-semibold text-green-600">-{discount?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>{(subtotal - discount)?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button 
                                type="button" 
                                asChild 
                                variant="secondary" 
                                className="flex-1" 
                                onClick={() => setOpen(false)}
                            >
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button 
                                type="button" 
                                asChild 
                                className="flex-1 bg-black hover:bg-gray-800" 
                                onClick={() => setOpen(false)}
                            >
                                {cart.count > 0 ? (
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                ) : (
                                    <button type="button" onClick={() => showToast('error', 'Your cart is empty!')}>Checkout</button>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default Cart