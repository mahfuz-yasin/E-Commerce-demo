import { useState, useLayoutEffect } from "react"

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        const handleSize = () => {
            if (typeof window !== 'undefined') {
                setSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                })
            }
        }

        handleSize()

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleSize)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleSize)
            }
        }

    }, [])

    return size
}

export default useWindowSize