'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ChevronRight, X } from "lucide-react"
import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const itemVariants = {
    hidden: { opacity: 0, x: -14 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.045, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }
    })
}

const subItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.04, duration: 0.22, ease: 'easeOut' }
    })
}

const MenuItemContent = ({ menu, active, childActive }) => (
    <div className="flex items-center gap-2.5 w-full">
        <motion.span
            whileHover={{ scale: 1.18, rotate: active ? 0 : 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="shrink-0"
        >
            <menu.icon className="w-4 h-4" />
        </motion.span>
        <span className="flex-1 truncate">{menu.title}</span>
        {menu.submenu?.length > 0 && (
            <motion.span
                className="ml-auto shrink-0"
                animate={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </motion.span>
        )}
    </div>
)

const AppSidebar = () => {
    const { toggleSidebar } = useSidebar()
    const pathname = usePathname()

    const isActive = (url) => {
        if (!url || url === '#') return false
        if (url.startsWith('http')) return false
        return pathname === url || pathname.startsWith(url + '/')
    }

    const hasActiveChild = (submenu) => {
        if (!submenu) return false
        return submenu.some(item => isActive(item.url))
    }

    return (
        <Sidebar className="z-50 border-r-0">
            {/* Header */}
            <SidebarHeader className="h-16 px-5 flex-row items-center justify-between border-b border-sidebar-border">
                <motion.div
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    <motion.div
                        className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.1, rotate: 8 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    >
                        <span className="text-white font-black text-sm">A</span>
                    </motion.div>
                    <div>
                        <p className="text-sidebar-foreground font-bold text-sm leading-tight">Admin Panel</p>
                        <p className="text-sidebar-foreground/50 text-[10px] leading-tight">E-Commerce Platform</p>
                    </div>
                </motion.div>
                <Button
                    onClick={toggleSidebar}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                    <X className="w-4 h-4" />
                </Button>
            </SidebarHeader>

            {/* Menu */}
            <SidebarContent className="px-3 py-3">
                <SidebarMenu className="gap-0.5">
                    {adminAppSidebarMenu.map((menu, index) => {
                        const active = isActive(menu.url)
                        const childActive = hasActiveChild(menu.submenu)

                        return (
                            <motion.div
                                key={index}
                                custom={index}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Collapsible
                                    className="group/collapsible"
                                    defaultOpen={childActive}
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                asChild
                                                className={cn(
                                                    "relative h-9 px-3 rounded-lg text-sm font-medium",
                                                    "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                                    "transition-colors duration-150",
                                                    (active || childActive) && "bg-primary/20 text-primary font-semibold hover:bg-primary/25 hover:text-primary"
                                                )}
                                            >
                                                {menu?.url && menu.url.startsWith('http') ? (
                                                    <a href={menu.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full">
                                                        <MenuItemContent menu={menu} active={active} childActive={childActive} />
                                                    </a>
                                                ) : menu?.url && menu.url !== '#' ? (
                                                    <Link href={menu.url} className="flex items-center gap-2.5 w-full">
                                                        <MenuItemContent menu={menu} active={active} childActive={childActive} />
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-2.5 w-full">
                                                        <MenuItemContent menu={menu} active={active} childActive={childActive} />
                                                    </div>
                                                )}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>

                                        {/* Active left bar indicator */}
                                        <AnimatePresence>
                                            {(active || childActive) && (
                                                <motion.span
                                                    layoutId="sidebar-active-bar"
                                                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary"
                                                    initial={{ opacity: 0, scaleY: 0.4 }}
                                                    animate={{ opacity: 1, scaleY: 1 }}
                                                    exit={{ opacity: 0, scaleY: 0.4 }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        {/* Submenu */}
                                        {menu.submenu?.length > 0 && (
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="ml-4 mt-0.5 border-l border-sidebar-border/60 pl-3 gap-0.5">
                                                    {menu.submenu.map((sub, subIdx) => {
                                                        const subActive = isActive(sub.url)
                                                        return (
                                                            <motion.div
                                                                key={subIdx}
                                                                custom={subIdx}
                                                                variants={subItemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                            >
                                                                <SidebarMenuSubItem>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        className={cn(
                                                                            "h-8 px-2 rounded-md text-xs font-medium transition-colors duration-150",
                                                                            "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                                                            subActive && "bg-primary/15 text-primary font-semibold hover:bg-primary/20 hover:text-primary"
                                                                        )}
                                                                    >
                                                                        {sub.url ? (
                                                                            <Link href={sub.url} className="flex items-center gap-1.5">
                                                                                <motion.span
                                                                                    className={cn(
                                                                                        "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                                                                                        subActive ? "bg-primary" : "bg-sidebar-foreground/30"
                                                                                    )}
                                                                                    animate={subActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                                                                                    transition={{ duration: 0.35 }}
                                                                                />
                                                                                {sub.title}
                                                                            </Link>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1.5">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-sidebar-foreground/30 shrink-0" />
                                                                                {sub.title}
                                                                            </span>
                                                                        )}
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        )}
                                    </SidebarMenuItem>
                                </Collapsible>
                            </motion.div>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar