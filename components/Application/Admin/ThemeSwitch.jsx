'use client'
import { useTheme } from "./ThemeProvider"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

const ThemeSwitch = () => {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return <div className="h-8 w-8" />

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer overflow-hidden"
        >
            <Sun
                className={`absolute w-4 h-4 transition-all duration-300 ${
                    isDark
                        ? 'opacity-0 rotate-90 scale-50'
                        : 'opacity-100 rotate-0 scale-100'
                }`}
            />
            <Moon
                className={`absolute w-4 h-4 transition-all duration-300 ${
                    isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-50'
                }`}
            />
        </button>
    )
}

export default ThemeSwitch