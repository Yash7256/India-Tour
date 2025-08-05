import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = 'w-full',
  height = 'h-4',
  lines = 1
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${width} ${height}`}
            style={{ width: index === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
    />
  );
};

// Destination Card Skeleton
export const DestinationCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg p-0">
    <SkeletonLoader variant="rectangular" height="h-48 sm:h-64" />
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="w-32" height="h-6" />
        <SkeletonLoader variant="circular" width="w-6" height="h-6" />
      </div>
      <SkeletonLoader variant="text" width="w-24" height="h-4" />
      <SkeletonLoader variant="text" lines={2} height="h-4" />
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="w-20" height="h-4" />
        <SkeletonLoader variant="text" width="w-16" height="h-4" />
      </div>
    </div>
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative h-screen overflow-hidden bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400"></div>
    <div className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <SkeletonLoader variant="text" width="w-80" height="h-12" className="mx-auto" />
          <SkeletonLoader variant="text" width="w-96" height="h-12" className="mx-auto" />
        </div>
        <SkeletonLoader variant="text" lines={2} width="w-full max-w-2xl mx-auto" height="h-6" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <SkeletonLoader variant="rectangular" width="w-48" height="h-12" />
          <SkeletonLoader variant="rectangular" width="w-40" height="h-12" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
