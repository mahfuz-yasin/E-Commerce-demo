'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 origin-left z-[9999]"
            style={{ scaleX }}
        />
    )
}

export default ScrollProgress
