'use client'
import { ThemeProvider as NextThemesProvider } from "next-themes"
const ThemeProvider = ({ children, ...props }) => {
    return <NextThemesProvider {...props} suppressHydrationWarning disableTransitionOnChange>{children}</NextThemesProvider>
}

export default ThemeProvider