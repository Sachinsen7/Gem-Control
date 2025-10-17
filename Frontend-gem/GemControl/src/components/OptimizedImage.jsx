import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import { getImageUrl, preloadImage } from '../utils/imageUtils';

const OptimizedImage = ({
    src,
    alt,
    style,
    sx,
    fallbackSrc = '/fallback-image.png',
    showSkeleton = true,
    onLoad,
    onError,
    ...props
}) => {
    const [imageState, setImageState] = useState('loading');
    const [imageSrc, setImageSrc] = useState(null);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        if (!src) {
            setImageState('error');
            return;
        }

        const imageUrl = getImageUrl(src);

        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            loadImage(imageUrl);
                            observerRef.current?.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            if (imgRef.current) {
                observerRef.current.observe(imgRef.current);
            }
        } else {
            // Fallback for browsers without IntersectionObserver
            loadImage(imageUrl);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [src]);

    const loadImage = async (imageUrl) => {
        try {
            setImageState('loading');
            const isLoaded = await preloadImage(imageUrl);

            if (isLoaded) {
                setImageSrc(imageUrl);
                setImageState('loaded');
                onLoad?.();
            } else {
                throw new Error('Image failed to load');
            }
        } catch (error) {
            console.warn(`Failed to load image: ${imageUrl}`, error);
            setImageSrc(fallbackSrc);
            setImageState('error');
            onError?.(error);
        }
    };

    const handleImageError = (e) => {
        if (e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc;
            setImageState('error');
            onError?.(e);
        }
    };

    if (imageState === 'loading' && showSkeleton) {
        return (
            <Box ref={imgRef} sx={sx}>
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    style={style}
                    animation="wave"
                />
            </Box>
        );
    }

    return (
        <Box ref={imgRef} sx={sx}>
            <img
                src={imageSrc}
                alt={alt}
                style={{
                    ...style,
                    opacity: imageState === 'loaded' ? 1 : 0.7,
                    transition: 'opacity 0.3s ease-in-out',
                }}
                onError={handleImageError}
                loading="lazy"
                {...props}
            />
        </Box>
    );
};

export default OptimizedImage;