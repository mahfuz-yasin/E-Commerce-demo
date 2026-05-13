'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ScrollReveal = ({ 
    children, 
    direction = 'up', 
    delay = 0, 
    duration = 0.5,
    className = ''
}) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
            x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
            scale: direction === 'scale' ? 0.8 : 1
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ 
                duration, 
                delay, 
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export default ScrollReveal
