'use client'

import { useState, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, X } from 'lucide-react'
import OptimizedImage from './OptimizedImage'

const ImageZoom = ({ src, alt, width = 650, height = 650, className = '' }) => {
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const [scale, setScale] = useState(1.5)
    const imageRef = useRef(null)
    const containerRef = useRef(null)

    // Desktop hover zoom
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current || isZoomed) return
        
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        setZoomPosition({ x, y })
    }, [isZoomed])

    // Mobile pinch zoom
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault()
            const distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            )
            containerRef.current.dataset.startDistance = distance
        }
    }, [])

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2 && containerRef.current) {
            e.preventDefault()
            const startDistance = parseFloat(containerRef.current.dataset.startDistance)
            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            )
            const newScale = Math.min(Math.max(currentDistance / startDistance * 1.5, 1), 3)
            setScale(newScale)
        }
    }, [])

    // Toggle zoom modal
    const toggleZoom = useCallback(() => {
        setIsZoomed(!isZoomed)
        if (!isZoomed) {
            setScale(1.5)
        }
    }, [isZoomed])

    // Zoom in/out buttons
    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.5, 3))
    }, [])

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - 0.5, 1))
    }, [])

    return (
        <>
            {/* Main Image Container with Hover Zoom */}
            <div 
                ref={containerRef}
                className={`relative overflow-hidden cursor-zoom-in group ${className}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
                onClick={toggleZoom}
            >
                {/* Normal Image */}
                <OptimizedImage
                    src={src}
                    width={width}
                    height={height}
                    alt={alt}
                    className="w-full h-auto object-cover transition-transform duration-300"
                    priority={true}
                />
                
                {/* Hover Zoom Overlay (Desktop only) */}
                <div 
                    className="absolute inset-0 bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: '200%',
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                />
                
                {/* Zoom Hint */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden">
                    <ZoomIn size={14} />
                    <span>Hover to zoom, Click to expand</span>
                </div>
                
                {/* Mobile Zoom Hint */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1 md:hidden">
                    <ZoomIn size={14} />
                    <span>Tap to zoom</span>
                </div>
            </div>

            {/* Full Screen Zoom Modal */}
            {isZoomed && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* Close Button */}
                    <button 
                        className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-50"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X size={24} />
                    </button>

                    {/* Zoom Controls */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 rounded-full px-4 py-2 z-50">
                        <button 
                            onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                            className="text-white p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            disabled={scale <= 1}
                        >
                            <ZoomOut size={20} />
                        </button>
                        <span className="text-white text-sm min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                            className="text-white p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            disabled={scale >= 3}
                        >
                            <ZoomIn size={20} />
                        </button>
                    </div>

                    {/* Zoomable Image */}
                    <div 
                        className="w-full h-full flex items-center justify-center overflow-hidden touch-pan-y"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-[90%] max-h-[80vh] object-contain transition-transform duration-200 ease-out"
                            style={{ 
                                transform: `scale(${scale})`,
                                cursor: scale > 1 ? 'grab' : 'default'
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
                        <p className="hidden md:block">Scroll to zoom • Drag to pan • Click outside to close</p>
                        <p className="md:hidden">Pinch to zoom • Double tap to reset • Tap outside to close</p>
                    </div>
                </div>
            )}
        </>
    )
}

export default ImageZoom
