import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import SkeletonLoader from './SkeletonLoader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide';
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  loading = 'lazy',
  onLoad,
  onError,
  aspectRatio,
  sizes,
  priority = false
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading, priority]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setImageState('error');
    onError?.();
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  const containerClasses = `relative overflow-hidden ${aspectRatio ? aspectRatioClasses[aspectRatio] : ''} ${className}`;

  return (
    <div ref={imgRef} className={containerClasses}>
      {/* Loading skeleton */}
      {imageState === 'loading' && (
        <SkeletonLoader 
          variant="rectangular" 
          className="absolute inset-0 w-full h-full" 
        />
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          sizes={sizes}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
