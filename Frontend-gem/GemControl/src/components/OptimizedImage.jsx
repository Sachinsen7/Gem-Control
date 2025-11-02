import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Skeleton } from '@mui/material';
import { getImageUrl, preloadImage } from '../utils/imageUtils';

const OptimizedImage = ({
    src,
    alt,
    style,
    sx,
    fallbackSrc = '/fallback-image.svg',
    showSkeleton = true,
    onLoad,
    onError,
    retryCount = 2,
    debug = false,
    ...props
}) => {
    const [imageState, setImageState] = useState('loading');
    const [imageSrc, setImageSrc] = useState(null);
    const [currentRetry, setCurrentRetry] = useState(0);
    const imgRef = useRef(null);
    const observerRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const logDebug = useCallback((message) => {
        if (debug) {
            console.log(`[OptimizedImage] ${message}`);
        }
    }, [debug]);

    const loadImage = useCallback(async (imageUrl, retryAttempt = 0) => {
        if (!mountedRef.current) return;

        try {
            setImageState('loading');
            logDebug(`Loading image: ${imageUrl} (attempt ${retryAttempt + 1})`);

            const isLoaded = await preloadImage(imageUrl);

            if (!mountedRef.current) return;

            if (isLoaded) {
                setImageSrc(imageUrl);
                setImageState('loaded');
                setCurrentRetry(0);
                onLoad?.();
                logDebug(`Successfully loaded image: ${imageUrl}`);
            } else {
                throw new Error('Image failed to preload');
            }
        } catch (error) {
            if (!mountedRef.current) return;

            logDebug(`Failed to load image: ${imageUrl} (attempt ${retryAttempt + 1}) - ${error.message}`);

            // Retry logic
            if (retryAttempt < retryCount) {
                setCurrentRetry(retryAttempt + 1);
                const delay = 1000 * Math.pow(2, retryAttempt); // Exponential backoff
                logDebug(`Retrying in ${delay}ms...`);

                setTimeout(() => {
                    if (mountedRef.current) {
                        loadImage(imageUrl, retryAttempt + 1);
                    }
                }, delay);
            } else {
                // All retries failed, use fallback
                logDebug(`All retry attempts failed for image: ${imageUrl}, using fallback`);
                setImageSrc(fallbackSrc);
                setImageState('error');
                setCurrentRetry(0);
                onError?.(error);
            }
        }
    }, [retryCount, fallbackSrc, onLoad, onError, logDebug]);

    useEffect(() => {
        if (!src) {
            logDebug('No src provided, using fallback');
            setImageState('error');
            setImageSrc(fallbackSrc);
            return;
        }

        const imageUrl = getImageUrl(src);
        logDebug(`Original src: "${src}" -> Processed URL: "${imageUrl}"`);

        // Reset retry count when src changes
        setCurrentRetry(0);

        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window && imgRef.current) {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && mountedRef.current) {
                            logDebug('Image entered viewport, starting load');
                            loadImage(imageUrl);
                            observerRef.current?.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: '50px' }
            );

            observerRef.current.observe(imgRef.current);
        } else {
            // Fallback for browsers without IntersectionObserver
            logDebug('IntersectionObserver not available, loading immediately');
            loadImage(imageUrl);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [src, loadImage, fallbackSrc, logDebug]);

    const handleImageError = useCallback((e) => {
        if (!mountedRef.current) return;

        logDebug(`Image error event for: ${e.target.src}`);

        if (e.target.src !== fallbackSrc) {
            logDebug('Setting fallback image due to error');
            setImageSrc(fallbackSrc);
            setImageState('error');
            onError?.(e);
        }
    }, [fallbackSrc, onError, logDebug]);

    const handleImageLoad = useCallback(() => {
        if (!mountedRef.current) return;
        logDebug('Image loaded successfully');
        setImageState('loaded');
        onLoad?.();
    }, [onLoad, logDebug]);

    if (imageState === 'loading' && showSkeleton) {
        return (
            <Box
                ref={imgRef}
                sx={{
                    ...sx,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
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
        <Box ref={imgRef} sx={{ ...sx, position: 'relative' }}>
            <img
                src={imageSrc}
                alt={alt}
                style={{
                    ...style,
                    opacity: imageState === 'loaded' ? 1 : 0.7,
                    transition: 'opacity 0.3s ease-in-out',
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
                {...props}
            />
        </Box>
    );
};

export default OptimizedImage;