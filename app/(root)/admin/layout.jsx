'use client'
import dynamic from 'next/dynamic'
import AppSidebar from '@/components/Application/Admin/AppSidebar'
import Topbar from '@/components/Application/Admin/Topbar'
import AnimatedPage from '@/components/Application/Admin/AnimatedPage'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const ThemeProvider = dynamic(() => import('@/components/Application/Admin/ThemeProvider'), {
    ssr: false
})

const layout = ({ children }) => {
    return (
        <ThemeProvider defaultTheme="system">
            <SidebarProvider>
                <AppSidebar />
                <main className="md:w-[calc(100vw-16rem)] w-full overflow-x-hidden min-h-screen flex flex-col bg-background transition-colors duration-300">
                    <Topbar />
                    <div className='flex-1 pt-14'>
                        <div className='md:px-8 px-5 py-7 min-h-[calc(100vh-96px)]'>
                            <AnimatedPage>
                                {children}
                            </AnimatedPage>
                        </div>
                    </div>
                    <footer className='border-t bg-muted/40 px-8 py-3 flex items-center justify-between text-xs text-muted-foreground'>
                        <span>© 2026 E-Online Fashion Panjabi. All Rights Reserved.</span>
                        <span>Developed by <a href="https://mahfuz.me" target="_blank" rel="noopener noreferrer" className='text-primary hover:underline font-medium'>Mahfuz Yasin</a></span>
                    </footer>
                </main>
            </SidebarProvider>
        </ThemeProvider>
    )
}

export default layout