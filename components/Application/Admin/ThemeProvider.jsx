'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => {},
    resolvedTheme: 'light',
})

export const useTheme = () => useContext(ThemeContext)

const ThemeProvider = ({ children, defaultTheme = 'system', ...props }) => {
    const [theme, setTheme] = useState(defaultTheme)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setTheme(savedTheme)
        } else if (defaultTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            setTheme(systemTheme)
        }
    }, [defaultTheme])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('theme', theme)
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
    }, [theme, mounted])

    if (!mounted) {
        return <>{children}</>
    }

    const resolvedTheme = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeProvider