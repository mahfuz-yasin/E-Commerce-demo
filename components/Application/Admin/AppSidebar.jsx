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
            <SidebarHeader className="h-16 px-5 flex-row items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-sm">A</span>
                    </div>
                    <div>
                        <p className="text-sidebar-foreground font-bold text-sm leading-tight">Admin Panel</p>
                        <p className="text-sidebar-foreground/50 text-[10px] leading-tight">E-Commerce Platform</p>
                    </div>
                </div>
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

            <SidebarContent className="px-3 py-3">
                <SidebarMenu className="gap-0.5">
                    {adminAppSidebarMenu.map((menu, index) => {
                        const active = isActive(menu.url)
                        const childActive = hasActiveChild(menu.submenu)

                        return (
                            <Collapsible
                                key={index}
                                className="group/collapsible"
                                defaultOpen={childActive}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                "h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150",
                                                "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                                (active || childActive) && "bg-primary/20 text-primary font-semibold hover:bg-primary/25 hover:text-primary"
                                            )}
                                        >
                                            {menu?.url && menu.url.startsWith('http') ? (
                                                <a href={menu.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full">
                                                    <menu.icon className="w-4 h-4 shrink-0" />
                                                    <span className="flex-1 truncate">{menu.title}</span>
                                                    {menu.submenu?.length > 0 && (
                                                        <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    )}
                                                </a>
                                            ) : menu?.url && menu.url !== '#' ? (
                                                <Link href={menu.url} className="flex items-center gap-2.5 w-full">
                                                    <menu.icon className="w-4 h-4 shrink-0" />
                                                    <span className="flex-1 truncate">{menu.title}</span>
                                                    {menu.submenu?.length > 0 && (
                                                        <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    )}
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-2.5 w-full">
                                                    <menu.icon className="w-4 h-4 shrink-0" />
                                                    <span className="flex-1 truncate">{menu.title}</span>
                                                    {menu.submenu?.length > 0 && (
                                                        <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    )}
                                                </div>
                                            )}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    {menu.submenu?.length > 0 && (
                                        <CollapsibleContent>
                                            <SidebarMenuSub className="ml-4 mt-0.5 border-l border-sidebar-border/60 pl-3 gap-0.5">
                                                {menu.submenu.map((sub, subIdx) => (
                                                    <SidebarMenuSubItem key={subIdx}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={cn(
                                                                "h-8 px-2 rounded-md text-xs font-medium transition-all duration-150",
                                                                "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                                                isActive(sub.url) && "bg-primary/15 text-primary font-semibold hover:bg-primary/20 hover:text-primary"
                                                            )}
                                                        >
                                                            {sub.url ? (
                                                                <Link href={sub.url} className="flex items-center gap-1.5">
                                                                    <span className={cn(
                                                                        "w-1 h-1 rounded-full shrink-0",
                                                                        isActive(sub.url) ? "bg-primary" : "bg-sidebar-foreground/30"
                                                                    )} />
                                                                    {sub.title}
                                                                </Link>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5">
                                                                    <span className="w-1 h-1 rounded-full bg-sidebar-foreground/30 shrink-0" />
                                                                    {sub.title}
                                                                </span>
                                                            )}
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    )}
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar