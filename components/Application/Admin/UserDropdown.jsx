import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import adminLogo from '@/public/assets/images/admin-logo.png'
import { useSelector } from "react-redux"

import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD } from "@/routes/AdminPanelRoute";

const UserDropdown = () => {
    const auth = useSelector((store) => {
        try {
            const state = store || {}
            const authStore = state.authStore || {}
            return authStore.auth || null
        } catch (error) {
            console.error('Error accessing auth state in UserDropdown:', error)
            return null
        }
    })
    const initials = (auth?.name || 'Admin').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer outline-none">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={adminLogo.src} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold leading-tight text-foreground">{auth?.name || 'Admin'}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Administrator</p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="me-4 w-48" align="end">
                <DropdownMenuLabel className="pb-1">
                    <p className="font-semibold text-sm">{auth?.name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground font-normal">Administrator</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={ADMIN_PRODUCT_ADD} className="cursor-pointer">
                        <IoShirtOutline />
                        New Product
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={ADMIN_ORDER_SHOW} className="cursor-pointer">
                        <MdOutlineShoppingBag />
                        Orders
                    </Link>
                </DropdownMenuItem>

                <LogoutButton />

            </DropdownMenuContent>
        </DropdownMenu>

    )
}

export default UserDropdown