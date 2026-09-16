import { useState, useEffect, useRef } from 'react';

/**
 * Helper to automatically derive thumbnail and optimized paths from a team image path
 */
export const getOptimizedImageUrls = (src) => {
  if (!src || typeof src !== 'string') return { thumb: src, high: src };

  // Check if image is in /team/ or team/
  const match = src.match(/(?:\/team\/|team\/)(.+)\.(png|jpe?g|webp)$/i);
  if (match) {
    const filename = match[1];
    return {
      thumb: `/team/thumbs/${filename}.webp`,
      high: `/team/optimized/${filename}.webp`,
    };
  }

  return { thumb: src, high: src };
};

/**
 * ProgressiveImage component:
 * 1. Immediately renders low-resolution WebP thumbnail (1-2 KB) with subtle blur.
 * 2. Preloads full-resolution image asynchronously in background.
 * 3. Smoothly transitions (blur-up / crossfade) to the crisp high-res version once loaded.
 */
const ProgressiveImage = ({
  src,
  lowResSrc,
  highResSrc,
  alt = '',
  className = '',
  containerClassName = '',
  priority = false,
  style = {},
  onLoad,
  ...props
}) => {
  const urls = getOptimizedImageUrls(src);
  const thumbnail = lowResSrc || urls.thumb;
  const fullImage = highResSrc || urls.high || src;

  const [currentSrc, setCurrentSrc] = useState(thumbnail || fullImage);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Check if network is extremely slow or data-saver is active
    const conn =
      typeof navigator !== 'undefined' &&
      (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
    
    const isSaveData = conn?.saveData;
    const isSlowNetwork = conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g';

    if (isSaveData && !priority) {
      // Stay on lightweight thumbnail to save user data
      return;
    }

    // Preload high-resolution image in background
    const img = new Image();
    img.src = fullImage;

    img.onload = () => {
      if (isMounted.current) {
        setCurrentSrc(fullImage);
        setIsLoaded(true);
        if (onLoad) onLoad();
      }
    };

    img.onerror = () => {
      // Fallback to original src if highRes failed
      if (isMounted.current) {
        if (fullImage !== src) {
          setCurrentSrc(src);
        }
        setIsLoaded(true);
      }
    };

    return () => {
      isMounted.current = false;
    };
  }, [fullImage, src, priority, onLoad]);

  return (
    <div
      className={`relative overflow-hidden inline-block ${containerClassName}`}
      style={style}
    >
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className} transition-all duration-500 ease-out ${
          isLoaded
            ? 'blur-0 scale-100 opacity-100'
            : 'blur-md scale-105 opacity-90'
        }`}
        {...props}
      />
    </div>
  );
};

export default ProgressiveImage;
