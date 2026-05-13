"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp';

const OptimizedImage = ({
    src,
    alt = '',
    fallbackSrc = imgPlaceholder,
    className = '',
    priority = false,
    loading = 'lazy',
    sizes,
    quality = 80,
    fill = false,
    width,
    height,
    style,
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(fallbackSrc);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // If no src provided, use fallback
        if (!src) {
            setImageSrc(fallbackSrc);
            setIsLoaded(true);
            return;
        }

        // If src is already the fallback, set it directly
        if (src === fallbackSrc || src === fallbackSrc.src) {
            setImageSrc(src);
            setIsLoaded(true);
            return;
        }

        // For local images or data URLs, use directly
        if (src.startsWith('/public/') || src.startsWith('data:') || src.startsWith('blob:')) {
            setImageSrc(src);
            setIsLoaded(true);
            return;
        }

        // For remote images, use a timeout to switch to fallback if slow
        const timeoutId = setTimeout(() => {
            if (!isLoaded) {
                setImageSrc(fallbackSrc);
                setHasError(true);
            }
        }, 0); // Zero seconds - immediate fallback if not loaded instantly

        // Try to load the original image
        const img = new window.Image();
        img.onload = () => {
            clearTimeout(timeoutId);
            setImageSrc(src);
            setIsLoaded(true);
            setHasError(false);
            if (onLoad) onLoad();
        };
        img.onerror = () => {
            clearTimeout(timeoutId);
            setImageSrc(fallbackSrc);
            setHasError(true);
            setIsLoaded(true);
            if (onError) onError();
        };
        img.src = src;

        return () => {
            clearTimeout(timeoutId);
        };
    }, [src, fallbackSrc, isLoaded, onLoad, onError]);

    return (
        <Image
            src={imageSrc}
            alt={alt}
            className={className}
            priority={priority}
            loading={loading}
            sizes={sizes}
            quality={quality}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            style={style}
            {...props}
        />
    );
};

export default OptimizedImage;
