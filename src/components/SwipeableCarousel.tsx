import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}

const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  onSlideChange
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = children.length;

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, totalSlides]);

  // Pause auto play on hover
  const pauseAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const resumeAutoPlay = () => {
    if (autoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }
  };

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    onSlideChange?.(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, onSlideChange]);

  const nextSlide = useCallback(() => {
    const nextIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    goToSlide(nextIndex);
  }, [currentSlide, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    goToSlide(prevIndex);
  }, [currentSlide, totalSlides, goToSlide]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoPlay();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
    
    // Handle circular navigation
    if (isLeftSwipe && currentSlide === totalSlides - 1) {
      goToSlide(0);
    }
    if (isRightSwipe && currentSlide === 0) {
      goToSlide(totalSlides - 1);
    }

    resumeAutoPlay();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (totalSlides === 0) return null;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Main carousel container */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm disabled:opacity-50 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm disabled:opacity-50 z-10"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar (optional) */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-100"
            style={{ 
              width: `${((currentSlide + 1) / totalSlides) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SwipeableCarousel;
