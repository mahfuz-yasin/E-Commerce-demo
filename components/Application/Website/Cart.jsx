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
import Image from "next/image";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { removeFromCart } from "@/store/reducer/cartReducer";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/WebsiteRoute";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
import OptimizedImage from "@/components/ui/OptimizedImage";
const Cart = () => {
    const [open, setOpen] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)


    const cart = useSelector(store => store.cartStore)
    const dispatch = useDispatch()


    useEffect(() => {
        const cartProducts = cart.products

        const totalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)


        setSubTotal(totalAmount)
        setDiscount(discount)



    }, [cart])


    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetTrigger className="relative">
                <BsCart2 size={25} className="text-gray-500 hover:text-primary" />
                <span className="absolute bg-red-500 text-white text-xs rounded-full w-4 h-4 flex justify-center items-center -right-2 -top-1">{cart.count}</span>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[450px] w-full flex flex-col">
                <SheetHeader className='py-4 border-b'>
                    <SheetTitle className="text-2xl">My Cart</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto px-4 py-4">
                        {cart.count === 0 && <div className="h-full flex justify-center items-center text-xl font-semibold">
                            Your Cart Is Empty.
                        </div>}

                        {cart.products?.map((product) => (
                            <div key={product.cartItemId} className="flex justify-between items-center gap-5 mb-4 border-b pb-4 last:border-0">
                                <div className="flex gap-5 items-center">
                                    <OptimizedImage src={product?.media} height={100} width={100} alt={product.name} className="w-20 h-20 rounded border" />

                                    <div className="flex-1">
                                        <h4 className="text-lg mb-1">{product.name}</h4>
                                        <p className="text-gray-500">
                                            {product.size}/{product.color}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex flex-col items-end">
                                    <button type="button" className="text-red-500 underline underline-offset-1 mb-2 cursor-pointer"
                                        onClick={() => {
                                            dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId, size: product.size }))
                                            showToast('success', 'Item removed from cart')
                                        }}>
                                        Remove
                                    </button>

                                    <p className="font-semibold">
                                        {product.qty} X {product.sellingPrice.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 px-4 pb-4">
                        <h2 className="flex justify-between items-center text-lg font-semibold mb-2"><span >Subtotal</span> <span>{subtotal?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span></h2>
                        <h2 className="flex justify-between items-center text-lg font-semibold mb-4"><span >Discount</span> <span>{discount?.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</span></h2>

                        <div className="flex justify-between gap-5">
                            <Button type="button" asChild variant="secondary" className="w-[200px]" onClick={() => setOpen(false)}>
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button type="button" asChild className="w-[200px]" onClick={() => setOpen(false)}>
                                {cart.count ?
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                    :
                                    <button type="button" onClick={() => showToast('error', 'Your cart is empty!')}>Checkout</button>
                                }
                            </Button>
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet>

    )
}

export default Cart